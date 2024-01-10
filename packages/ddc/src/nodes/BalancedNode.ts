import retry, { Options as RetryOptions } from 'async-retry';
import { RpcError } from '@protobuf-ts/runtime-rpc';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { BucketId } from '@cere-ddc-sdk/blockchain';

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
} from './NodeInterface';

export type BalancedNodeConfig = LoggerOptions & {
  router: Router;
};

export class BalancedNode implements NodeInterface {
  readonly nodeId = 'BalancedNode';

  private router: Router;
  private logger: Logger;

  constructor({ router, ...config }: BalancedNodeConfig) {
    this.router = router;
    this.logger = createLogger('BalancedNode', config);
  }

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
    const isRetriablePiece = Piece.isStaticPiece(piece) || MultipartPiece.isMultipartPiece(piece);

    return this.withRetry(
      bucketId,
      RouterOperation.STORE_PIECE,
      (node, bail, attempt) => {
        const isRetry = attempt > 1;
        const finalPiece = isRetry && Piece.isPiece(piece) ? Piece.from(piece) : piece;

        return node.storePiece(bucketId, finalPiece, options);
      },
      {
        retries: isRetriablePiece ? RETRY_MAX_ATTEPTS : 0,
      },
    );
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

  async resolveName(bucketId: BucketId, cidOrName: string) {
    return this.withRetry(bucketId, RouterOperation.READ_CNS_RECORD, (node) => node.resolveName(bucketId, cidOrName));
  }
}
