import retry, { Options as RetryOptions } from 'async-retry';
import { RpcError } from '@protobuf-ts/runtime-rpc';
import { BucketId } from '@cere-ddc-sdk/blockchain';

import { GrpcStatus } from '../grpc/status';
import { RETRYABLE_GRPC_ERROR_CODES, RETRY_MAX_ATTEPTS } from '../constants';
import { Router, RouterOperation } from '../routing';
import { Piece, MultipartPiece } from '../Piece';
import { DagNode } from '../DagNode';
import { CnsRecord } from '../CnsRecord';
import { Logger, LoggerOptions, bindErrorLogger, createLogger } from '../logger';
import { createCorrelationId } from '../activity';
import { NodeError } from './NodeError';
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
 * The timeouts bettween retries are exponential, starting at `minTimeout` and increasing each time until `maxTimeout`.
 *
 * The formuka for the timeout between retries is:
 *
 * ```typescript
 * const timeout = Math.min(random * minTimeout * Math.pow(factor, attempt), maxTimeout);
 * ```
 */
export type OpperationRetryOptions = Omit<RetryOptions, 'retries'> & {
  attempts?: number;
};

export type BalancedNodeConfig = LoggerOptions & {
  router: Router;
  retries?: number | OpperationRetryOptions;
};

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
 * const router = new Router(...);
 * const balancedNode = new BalancedNode({ router });
 * ```
 */
export class BalancedNode implements NodeInterface {
  readonly nodeId = 'BalancedNode';
  readonly displayName = 'BalancedNode';

  private router: Router;
  private logger: Logger;

  private retryOptions: RetryOptions = {
    minTimeout: 50, // Starting timeout from which to increase exponentially
    factor: 2, // Exponential backoff
    retries: RETRY_MAX_ATTEPTS,
  };

  constructor({ router, ...config }: BalancedNodeConfig) {
    this.router = router;
    this.logger = createLogger('BalancedNode', config);

    if (typeof config.retries === 'number') {
      this.retryOptions.retries = config.retries;
    } else if (config.retries) {
      const { attempts = RETRY_MAX_ATTEPTS, ...retryOptions } = config.retries;

      this.retryOptions = { ...this.retryOptions, ...retryOptions, retries: attempts };
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
   * Executes a function with automatic retry on failure.
   *
   * @param fn - The function to execute.
   * @param options - Optional parameters for retrying the function.
   *
   * @returns A promise that resolves to the result of the function.
   */
  private async withRetry<T>(
    bucketId: BucketId,
    operation: RouterOperation,
    { correlationId }: CorrelationOptions,
    body: (node: NodeInterface, bail: (e: Error) => void, attempt: number) => Promise<T>,
  ) {
    let lastOperationError: RpcError | undefined;
    let lastRouterError: Error | undefined;

    const exclude: NodeInterface[] = [];

    return retry(
      async (bail, attempt) => {
        let node: NodeInterface | undefined;

        try {
          node = await this.router.getNode(
            operation,
            bucketId,
            { logErrors: false },
            exclude.map((node) => node.nodeId),
          );

          exclude.unshift(node);
        } catch (error) {
          /**
           * In case we fail to get a node, we retry with previous nodes that failed until the max attempts.
           */
          node = exclude.pop() || node;

          if (node) {
            this.logger.info(
              `Reusing previous node for operation "%s" in bucket %s: %s`,
              operation,
              bucketId,
              node.displayName,
            );
          }

          if (error instanceof Error) {
            lastRouterError = error;
          }
        }

        if (!node) {
          throw lastOperationError ?? lastRouterError ?? new Error('No nodes available to handle the operation');
        }

        try {
          return await body(node, bail, attempt);
        } catch (error) {
          const nodeError = error instanceof RpcError ? NodeError.fromRpcError(error) : undefined;

          if (nodeError) {
            nodeError.nodeId = node.nodeId;
            nodeError.correlationId = correlationId;

            if (RETRYABLE_GRPC_ERROR_CODES.map((status) => GrpcStatus[status]).includes(nodeError.code)) {
              lastOperationError = nodeError;

              throw nodeError;
            }
          }

          bail(nodeError || (error as Error));
        }
      },
      {
        ...this.retryOptions,
        onRetry: (err, attempt) => {
          this.retryOptions.onRetry?.(err, attempt);

          this.logger.warn({ err, attempt }, 'Retrying operation');
        },
      },
    ) as T;
  }

  async storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, storeOptions: PieceStoreOptions = {}) {
    const options = withCorrelationId(storeOptions);

    return this.withRetry(bucketId, RouterOperation.STORE_PIECE, options, (node, bail, attempt) =>
      /**
       * Clone the piece if it is a piece and this is not the first attempt.
       * This is done to avoid reusing the same stream multiple times.
       */
      node.storePiece(bucketId, Piece.isPiece(piece) && attempt > 0 ? Piece.from(piece) : piece, options),
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
