import type { BucketId } from '@cere-ddc-sdk/blockchain';

import type { StorageNodeConfig } from '../nodes';
import type { Logger } from '../logger';

export enum RouterOperation {
  READ_DAG_NODE = 'read-dag-node',
  STORE_DAG_NODE = 'store-dag-node',
  READ_PIECE = 'read-piece',
  STORE_PIECE = 'store-piece',
  STORE_CNS_RECORD = 'store-cns-record',
  READ_CNS_RECORD = 'read-cns-record',
}

export type RouterNode = StorageNodeConfig & {
  priority?: number;
};

export abstract class RoutingStrategy {
  constructor(protected logger: Logger) {}

  abstract selectNode(operation: RouterOperation, nodes: RouterNode[]): RouterNode | undefined;
  abstract getNodes(bucketId: BucketId): Promise<RouterNode[]>;
  abstract isReady(): Promise<boolean>;
  abstract marshalNodes(operation: RouterOperation, nodes: RouterNode[]): Promise<RouterNode[]>;
}
