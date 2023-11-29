import { StorageNode, StorageNodeConfig } from '../StorageNode';
import { Blockchain, Bucket, BucketId, Cluster, ClusterId, Signer } from '@cere-ddc-sdk/blockchain';

export enum RouterOperation {
  READ_DAG_NODE = 'read-dag-node',
  STORE_DAG_NODE = 'store-dag-node',
  READ_PIECE = 'read-piece',
  STORE_PIECE = 'store-piece',
}

export type RouterNode = StorageNodeConfig;
type RouterStaticConfig = {
  signer: Signer;
  nodes: RouterNode[];
};

type RouterDynamicConfig = {
  signer: Signer;
  blockchain: Blockchain;
};

export type RouterConfig = RouterStaticConfig | RouterDynamicConfig;

export abstract class BaseRouter {
  readonly blockchainCache = {
    buckets: {} as Record<string, Bucket>,
    clusters: {} as Record<ClusterId, Cluster>,
  };

  constructor(private config: RouterConfig) {}

  abstract selectNode(operation: RouterOperation, nodes: RouterNode[]): RouterNode;

  async isRead() {
    return this.config.signer.isReady();
  }

  async getNodes(bucketId: BucketId): Promise<RouterNode[]> {
    await this.isRead();

    if ('nodes' in this.config) {
      return this.config.nodes;
    }

    const bucket = await this.getBucket(bucketId);

    if (!bucket) {
      throw new Error(`Failed to get info for bucket ${bucketId} on blockchain`);
    }

    if (!bucket.clusterId) {
      throw new Error(`Bucket ${bucketId} is not allocated to any cluster`);
    }

    const cluster = await this.getCluster(bucket.clusterId);

    if (!cluster) {
      throw new Error(`Failed to get info for cluster ${bucket.clusterId} on blockchain`);
    }

    const nodes = await this.config.blockchain.ddcClusters.listNodeKeys(cluster.clusterId);
    const storageNodeKeys = nodes.filter((node) => node.keyType === 'storage').map((node) => node.nodePublicKey);
    const nodeKey = storageNodeKeys[Math.floor(Math.random() * storageNodeKeys.length)];
    const node = await this.config.blockchain.ddcNodes.findStorageNodeByPublicKey(nodeKey);

    if (node == null) {
      throw new Error(`Failed to get info for node ${nodeKey} on blockchain`);
    }

    /**
     * TODO: Revise this implementation to support future `ssl` endpoints
     */
    return [
      {
        grpcUrl: `grpc://${node.props.host}:${node.props.grpcPort}`,
        httpUrl: `http://${node.props.host}:${node.props.httpPort}`,
        ssl: false,
      },
    ];
  }

  async getNode(operation: RouterOperation, bucketId: BucketId) {
    const nodes = await this.getNodes(bucketId);
    const node = nodes.length > 1 ? this.selectNode(operation, nodes) : nodes[0];

    if (!node) {
      throw new Error('No nodes available to handle the operation');
    }

    return new StorageNode(this.config.signer, node);
  }

  private async getCluster(clusterId: ClusterId) {
    const cached = this.blockchainCache.clusters[clusterId];

    if (cached) {
      return cached;
    }

    if (!('blockchain' in this.config)) {
      return;
    }

    const cluster = await this.config.blockchain.ddcClusters.findClusterById(clusterId);

    if (cluster) {
      this.blockchainCache.clusters[clusterId] = cluster;
    }

    return cluster;
  }

  private async getBucket(bucketId: BucketId) {
    const cached = this.blockchainCache.buckets[bucketId.toString()];

    if (cached) {
      return cached;
    }

    if (!('blockchain' in this.config)) {
      return;
    }

    const bucket = await this.config.blockchain.ddcCustomers.getBucket(bucketId);

    if (bucket) {
      this.blockchainCache.buckets[bucketId.toString()] = bucket;
    }

    return bucket;
  }
}
