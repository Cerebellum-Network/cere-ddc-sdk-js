import retry, { Options as RetryOptions } from 'async-retry';
import { RpcError } from '@protobuf-ts/runtime-rpc';
import { BucketId, Signer } from '@cere-ddc-sdk/blockchain';

import { RETRY_MAX_RETRIES, RETRY_MAX_TIMEOUT, RETRY_MIN_TIMEOUT } from '../constants';
import { EndpointResolver, RouterOperation } from '../routing';
import { Piece, MultipartPiece } from '../Piece';
import { DagNode } from '../DagNode';
import { CnsRecord } from '../CnsRecord';
import { Logger, LoggerOptions, bindErrorLogger, createLogger } from '../logger';
import { createCorrelationId } from '../activity';
import { observeFirstRead } from '../streams';
import { NodeError, isRetryableNodeError } from './NodeError';
import {
  DagNodeGetOptions,
  DagNodeStoreOptions,
  PieceReadOptions,
  PieceStoreOptions,
  NodeInterface,
  CnsRecordGetOptions,
  CorrelationOptions,
} from './NodeInterface';

/**
 * Controls how failed node operations are retried. Only transient, node-side failures are retried
 * (see `isRetryableNodeError`); every other error is returned to the caller right away.
 *
 * The timeouts between retries are exponential, starting at `minTimeout` and increasing each time until `maxTimeout`.
 * With `randomize` (on by default) each timeout is multiplied by a random factor between 1 and 2.
 *
 * The formula for the timeout between retries is:
 *
 * ```typescript
 * const timeout = Math.min(random * minTimeout * Math.pow(factor, attempt), maxTimeout);
 * ```
 *
 * By default an operation is retried twice (three attempts in total), waiting 500-1000 ms before the
 * first retry and 1000-2000 ms before the second.
 */
export type OpperationRetryOptions = Omit<RetryOptions, 'retries'> & {
  /**
   * The number of retries after the first attempt. Set it to `0` to disable retries.
   */
  attempts?: number;
};

export type BalancedNodeConfig = LoggerOptions & {
  resolver: EndpointResolver;

  /**
   * The number of retries after the first attempt, or the full retry options.
   */
  retries?: number | OpperationRetryOptions;
};

export type ResolverNodeConfig = {
  signer: Signer;
  storageUrl: string;
  cdnUrl?: string;
  retries?: number | OpperationRetryOptions;
  logger: Logger;
};

/**
 * Builds a `BalancedNode` backed by a single-cluster `EndpointResolver` for the given
 * `storageUrl`/`cdnUrl`.
 *
 * `DdcClient` and `FileStorage` wire the resolver up identically, so this is shared
 * between the two rather than duplicated.
 */
export const createResolverNode = ({ signer, storageUrl, cdnUrl, retries, logger }: ResolverNodeConfig) => {
  const resolver = new EndpointResolver({ signer, storageUrl, cdnUrl, logger });

  return new BalancedNode({ resolver, retries, logger });
};

/**
 * Tells whether a piece's content is held in memory, so every attempt can send it again from the start.
 */
const hasReplayableContent = (piece: Piece): boolean => Piece.isStaticPiece(piece);

const withCorrelationId = <T extends CorrelationOptions>(options: T): T => ({
  ...options,
  correlationId: options.correlationId || createCorrelationId(),
});

/**
 * The `BalancedNode` class implements the `NodeInterface` and provides methods for interacting with storage nodes.
 *
 * A balanced node is a node that distributes operations across multiple underlying nodes to balance the load.
 *
 * @group Storage Node
 * @example
 *
 * ```typescript
 * const resolver = new EndpointResolver(...);
 * const balancedNode = new BalancedNode({ resolver });
 * ```
 */
export class BalancedNode implements NodeInterface {
  readonly nodeId = 'BalancedNode';
  readonly displayName = 'BalancedNode';

  private resolver: EndpointResolver;
  private logger: Logger;

  private retryOptions: RetryOptions = {
    minTimeout: RETRY_MIN_TIMEOUT,
    maxTimeout: RETRY_MAX_TIMEOUT,
    factor: 2,
    randomize: true,
    retries: RETRY_MAX_RETRIES,
  };

  constructor({ resolver, ...config }: BalancedNodeConfig) {
    this.resolver = resolver;
    this.logger = createLogger('BalancedNode', config);

    if (typeof config.retries === 'number') {
      this.retryOptions.retries = config.retries;
    } else if (config.retries) {
      const { attempts = RETRY_MAX_RETRIES, ...retryOptions } = config.retries;

      /**
       * Keep a custom `minTimeout` above the default cap from silently shortening every delay.
       */
      const maxTimeout = retryOptions.maxTimeout ?? Math.max(RETRY_MAX_TIMEOUT, retryOptions.minTimeout ?? 0);

      this.retryOptions = { ...this.retryOptions, ...retryOptions, maxTimeout, retries: attempts };
    }

    if (config.logErrors !== false) {
      bindErrorLogger(this, this.logger, [
        'storePiece',
        'storeDagNode',
        'readPiece',
        'getDagNode',
        'storeCnsRecord',
        'getCnsRecord',
        'resolveName',
      ]);
    }
  }

  /**
   * Executes a node operation, repeating it when it fails for a transient, node-side reason.
   *
   * Each attempt asks the resolver for a node again, so behind a load-balanced endpoint a retry may reach a
   * different node. Errors that `isRetryableNodeError` does not accept are returned without a retry.
   *
   * @param bucketId - The bucket the operation targets.
   * @param operation - The operation, used to resolve the node.
   * @param options - Correlation options attached to the returned error.
   * @param body - The operation itself, called once per attempt with the node to run it on.
   * @param canRetry - Consulted after a retryable failure. Returning `false` returns that failure instead.
   *
   * @returns A promise that resolves to the result of the operation.
   */
  private async withRetry<T>(
    bucketId: BucketId,
    operation: RouterOperation,
    { correlationId }: CorrelationOptions,
    body: (node: NodeInterface) => Promise<T>,
    canRetry: () => boolean = () => true,
  ): Promise<T> {
    return retry<T>(
      async (bail) => {
        let node: NodeInterface | undefined;

        try {
          node = await this.resolver.getNode(operation, bucketId, { logErrors: false });

          return await body(node);
        } catch (error) {
          const nodeError = error instanceof RpcError ? NodeError.fromRpcError(error) : undefined;

          if (nodeError) {
            nodeError.nodeId = node?.nodeId;
            nodeError.correlationId = correlationId;
          }

          if (nodeError && isRetryableNodeError(nodeError) && canRetry()) {
            throw nodeError;
          }

          bail(nodeError || (error as Error));

          /**
           * `bail` has already rejected the operation, so this value is never observed.
           */
          return undefined as T;
        }
      },
      {
        ...this.retryOptions,
        onRetry: (err, attempt) => {
          this.retryOptions.onRetry?.(err, attempt);

          this.logger.warn({ err, attempt }, 'Retrying operation');
        },
      },
    );
  }

  /**
   * Stores a piece, retrying transient failures.
   *
   * A retry always sends the whole piece again. Pieces created from a `Uint8Array` are re-read from memory on
   * every attempt. Pieces created from a stream or an async iterable can only be read once, so they are retried
   * only when the failed attempt had not started reading the content yet; once content has been sent, the
   * failure is returned to the caller. Buffer the content into a `Uint8Array` to make every failure retryable.
   */
  async storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, storeOptions: PieceStoreOptions = {}) {
    const options = withCorrelationId(storeOptions);

    if (Piece.isPiece(piece) && !hasReplayableContent(piece)) {
      let contentRead = false;
      const singleUsePiece = new Piece(
        observeFirstRead(piece.body, () => {
          contentRead = true;
        }),
        { ...piece.meta, multipartOffset: piece.offset, size: piece.size },
      );

      return this.withRetry(
        bucketId,
        RouterOperation.STORE_PIECE,
        options,
        (node) => node.storePiece(bucketId, singleUsePiece, options),
        () => !contentRead,
      );
    }

    return this.withRetry(bucketId, RouterOperation.STORE_PIECE, options, (node) =>
      node.storePiece(bucketId, Piece.isPiece(piece) ? Piece.from(piece) : piece, options),
    );
  }

  async readPiece(bucketId: BucketId, cidOrName: string, readOptions: PieceReadOptions = {}) {
    const options = withCorrelationId(readOptions);

    return this.withRetry(bucketId, RouterOperation.READ_PIECE, options, (node) =>
      node.readPiece(bucketId, cidOrName, options),
    );
  }

  async storeDagNode(bucketId: BucketId, dagNode: DagNode, storeOptions: DagNodeStoreOptions = {}) {
    const options = withCorrelationId(storeOptions);

    return this.withRetry(bucketId, RouterOperation.STORE_DAG_NODE, options, (node) =>
      node.storeDagNode(bucketId, dagNode, options),
    );
  }

  async getDagNode(bucketId: BucketId, cidOrName: string, getOptions: DagNodeGetOptions = {}) {
    const options = withCorrelationId(getOptions);

    return this.withRetry(bucketId, RouterOperation.READ_DAG_NODE, options, (node) =>
      node.getDagNode(bucketId, cidOrName, options),
    );
  }

  async storeCnsRecord(bucketId: BucketId, record: CnsRecord, storeOptions: DagNodeStoreOptions = {}) {
    const options = withCorrelationId(storeOptions);

    return this.withRetry(bucketId, RouterOperation.STORE_CNS_RECORD, options, (node) =>
      node.storeCnsRecord(bucketId, record, options),
    );
  }

  async getCnsRecord(bucketId: BucketId, name: string, getOptions: CnsRecordGetOptions = {}) {
    const options = withCorrelationId(getOptions);

    return this.withRetry(bucketId, RouterOperation.READ_CNS_RECORD, options, (node) =>
      node.getCnsRecord(bucketId, name, options),
    );
  }

  async resolveName(bucketId: BucketId, cidOrName: string, resolveOptions: CnsRecordGetOptions = {}) {
    const options = withCorrelationId(resolveOptions);

    return this.withRetry(bucketId, RouterOperation.READ_CNS_RECORD, options, (node) =>
      node.resolveName(bucketId, cidOrName, options),
    );
  }
}
