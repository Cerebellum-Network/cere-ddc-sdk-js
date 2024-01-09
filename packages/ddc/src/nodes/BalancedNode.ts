import retry, { Options as RetryOptions } from 'async-retry';
import { BucketId } from '@cere-ddc-sdk/blockchain';

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
      async (...args) => {
        const node = await this.router.getNode(operation, bucketId, exclude);

        exclude.push(node.nodeId);

        return body(node, ...args);
      },
      {
        retries: 3,
        minTimeout: 0,
        ...options,
        onRetry: (error, attempt) => {
          options.onRetry?.(error, attempt);

          this.logger.warn({ error, attempt }, 'Retrying operation');
        },
      },
    );
  }

  async storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, options?: PieceStoreOptions) {
    return this.withRetry(bucketId, RouterOperation.STORE_PIECE, (node) => node.storePiece(bucketId, piece, options));
  }

  async storeDagNode(bucketId: BucketId, dagNode: DagNode, options?: DagNodeStoreOptions) {
    return this.withRetry(bucketId, RouterOperation.STORE_DAG_NODE, (node) =>
      node.storeDagNode(bucketId, dagNode, options),
    );
  }

  async readPiece(bucketId: BucketId, cidOrName: string, options?: PieceReadOptions) {
    return this.withRetry(bucketId, RouterOperation.READ_PIECE, (node) => node.readPiece(bucketId, cidOrName, options));
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
