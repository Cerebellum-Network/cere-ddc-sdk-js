import { Blockchain, Bucket, BucketId, Cluster, ClusterId } from '@cere-ddc-sdk/blockchain';

import { BaseStrategy } from './BaseStrategy';
import { Logger } from '../Logger';

export type BlockchainStrategyConfig = {
  blockchain: Blockchain;
};

export class BlockchainStrategy extends BaseStrategy {
  private blockchain: Blockchain;

  readonly blockchainCache = {
    buckets: {} as Record<string, Bucket>,
    clusters: {} as Record<ClusterId, Cluster>,
  };

  constructor(logger: Logger, { blockchain }: BlockchainStrategyConfig) {
    super(logger);

    this.blockchain = blockchain;
  }

  async isReady() {
    return this.blockchain.isReady();
  }

  async getNodes(bucketId: BucketId) {
    await this.isReady();

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

    const nodes = await this.blockchain.ddcClusters.listNodeKeys(cluster.clusterId);
    const storageNodeKeys = nodes.filter((node) => node.keyType === 'storage').map((node) => node.nodePublicKey);
    const nodeKey = storageNodeKeys[Math.floor(Math.random() * storageNodeKeys.length)];
    const node = await this.blockchain.ddcNodes.findStorageNodeByPublicKey(nodeKey);

    if (node == null) {
      throw new Error(`Failed to get info for node ${nodeKey} on blockchain`);
    }

    /**
     * TODO: Revise this implementation to support future `ssl` endpoints
     */
    const resultNodes = [
      {
        grpcUrl: `grpc://${node.props.host}:${node.props.grpcPort}`,
        httpUrl: `http://${node.props.host}:${node.props.httpPort}`,
        ssl: false,
      },
    ];

    this.logger.debug({ nodes: resultNodes }, 'Using nodes from blockchain');

    return resultNodes;
  }

  private async getCluster(clusterId: ClusterId) {
    const cached = this.blockchainCache.clusters[clusterId];

    if (cached) {
      return cached;
    }

    const cluster = await this.blockchain.ddcClusters.findClusterById(clusterId);

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

    const bucket = await this.blockchain.ddcCustomers.getBucket(bucketId);

    if (bucket) {
      this.blockchainCache.buckets[bucketId.toString()] = bucket;
    }

    return bucket;
  }
}
