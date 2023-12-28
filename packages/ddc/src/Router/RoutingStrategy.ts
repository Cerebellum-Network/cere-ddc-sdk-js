import { BucketId } from '@cere-ddc-sdk/blockchain';

import { StorageNodeConfig } from '../StorageNode';
import { Logger } from '../Logger';

export enum RouterOperation {
  READ_DAG_NODE = 'read-dag-node',
  STORE_DAG_NODE = 'store-dag-node',
  READ_PIECE = 'read-piece',
  STORE_PIECE = 'store-piece',
}

export type RouterNode = StorageNodeConfig;

export abstract class RoutingStrategy {
  constructor(protected logger: Logger) {}

  abstract selectNode(operation: RouterOperation, nodes: RouterNode[]): RouterNode | undefined;
  abstract getNodes(bucketId: BucketId): Promise<RouterNode[]>;
  abstract isReady(): Promise<boolean>;
  abstract filterNodes(operation: RouterOperation, nodes: RouterNode[]): Promise<RouterNode[]>;
}
