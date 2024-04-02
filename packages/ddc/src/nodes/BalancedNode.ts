import retry, { Options as RetryOptions } from 'async-retry';
import { RpcError } from '@protobuf-ts/runtime-rpc';
import { BucketId } from '@cere-ddc-sdk/blockchain';

import { GrpcStatus } from '../grpc/status';
import { RETRYABLE_GRPC_ERROR_CODES, RETRY_MAX_ATTEPTS } from '../constants';
import { Router, RouterOperation } from '../routing';
import { Piece, MultipartPiece } from '../Piece';
import { DagNode } from '../DagNode';
import { CnsRecord } from '../CnsRecord';
import { Logger, LoggerOptions, createLogger } from '../logger';
import {
  DagNodeGetOptions,
  DagNodeStoreOptions,
  PieceReadOptions,
  PieceStoreOptions,
  NodeInterface,
  CnsRecordGetOptions,
} from './NodeInterface';

export type BalancedNodeConfig = LoggerOptions & {
  router: Router;
};

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

  private router: Router;
  private logger: Logger;

  constructor({ router, ...config }: BalancedNodeConfig) {
    this.router = router;
    this.logger = createLogger('BalancedNode', config);
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
    body: (node: NodeInterface, bail: (e: Error) => void, attempt: number) => Promise<T>,
    options: RetryOptions = {},
  ) {
    const exclude: string[] = [];

    return retry(
      async (bail, attempt) => {
        try {
          const node = await this.router.getNode(operation, bucketId, exclude);
          exclude.push(node.nodeId);

          return await body(node, bail, attempt);
        } catch (error) {
          if (
            error instanceof RpcError &&
            RETRYABLE_GRPC_ERROR_CODES.map((status) => GrpcStatus[status]).includes(error.code)
          ) {
            throw error;
          }

          bail(error as Error);
        }
      },
      {
        retries: RETRY_MAX_ATTEPTS,
        minTimeout: 0,
        ...options,
        onRetry: (err, attempt) => {
          options.onRetry?.(err, attempt);

          this.logger.warn({ err, attempt }, 'Retrying operation');
        },
      },
    ) as T;
  }

  async storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, options?: PieceStoreOptions) {
    return this.withRetry(bucketId, RouterOperation.STORE_PIECE, (node) => node.storePiece(bucketId, piece, options));
  }

  async readPiece(bucketId: BucketId, cidOrName: string, options?: PieceReadOptions) {
    return this.withRetry(bucketId, RouterOperation.READ_PIECE, (node) => node.readPiece(bucketId, cidOrName, options));
  }

  async storeDagNode(bucketId: BucketId, dagNode: DagNode, options?: DagNodeStoreOptions) {
    return this.withRetry(bucketId, RouterOperation.STORE_DAG_NODE, (node) =>
      node.storeDagNode(bucketId, dagNode, options),
    );
  }

  async getDagNode(bucketId: BucketId, cidOrName: string, options?: DagNodeGetOptions) {
    return this.withRetry(bucketId, RouterOperation.READ_DAG_NODE, (node) =>
      node.getDagNode(bucketId, cidOrName, options),
    );
  }

  async storeCnsRecord(bucketId: BucketId, record: CnsRecord) {
    return this.withRetry(bucketId, RouterOperation.STORE_CNS_RECORD, (node) => node.storeCnsRecord(bucketId, record));
  }

  async getCnsRecord(bucketId: BucketId, name: string) {
    return this.withRetry(bucketId, RouterOperation.READ_CNS_RECORD, (node) => node.getCnsRecord(bucketId, name));
  }

  async resolveName(bucketId: BucketId, cidOrName: string, options?: CnsRecordGetOptions) {
    return this.withRetry(bucketId, RouterOperation.READ_CNS_RECORD, (node) =>
      node.resolveName(bucketId, cidOrName, options),
    );
  }
}
