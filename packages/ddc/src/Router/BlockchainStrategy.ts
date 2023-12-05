import { Blockchain, Bucket, BucketId, ClusterId, StorageNode as BCStorageNode } from '@cere-ddc-sdk/blockchain';

import { BaseStrategy } from './BaseStrategy';
import { Logger } from '../Logger';
import { RouterNode } from './RoutingStrategy';

export type BlockchainStrategyConfig = {
  blockchain: Blockchain;
};

export class BlockchainStrategy extends BaseStrategy {
  private blockchain: Blockchain;
  private bucketCache: Map<BucketId, Bucket> = new Map();
  private clusterNodes: Map<ClusterId, RouterNode[]> = new Map();

  constructor(logger: Logger, { blockchain }: BlockchainStrategyConfig) {
    super(logger);

    this.blockchain = blockchain;
  }

  async isReady() {
    return this.blockchain.isReady();
  }

  async getNodes(bucketId: BucketId) {
    await this.isReady();

    const { clusterId } = await this.getBucket(bucketId);
    const nodes = await this.getClusterNodes(clusterId);

    this.logger.debug({ nodes }, 'Using nodes from blockchain');

    return nodes;
  }

  private mapNodeProps = (node: BCStorageNode): RouterNode => {
    const { grpcPort, host, httpPort } = node.props;
    const ssl = httpPort === 443;
    const httpUrl = ssl ? `https://${host}` : `http://${host}:${httpPort}`;

    return {
      ssl,
      httpUrl,
      grpcUrl: `grpc://${host}:${grpcPort}`,
    };
  };

  private async getClusterNodes(clusterId: ClusterId) {
    if (this.clusterNodes.has(clusterId)) {
      return this.clusterNodes.get(clusterId)!;
    }

    /**
     * TODO: Discuss with the team if it is possible to get nodes with props from the blockchain by clusterId
     */
    const allNodes = await this.blockchain.ddcNodes.listStorageNodes();
    const clusterNodes = allNodes.filter((node) => node.clusterId === clusterId).map(this.mapNodeProps);
    this.clusterNodes.set(clusterId, clusterNodes);

    return clusterNodes;
  }

  private async getBucket(bucketId: BucketId) {
    if (this.bucketCache.has(bucketId)) {
      return this.bucketCache.get(bucketId)!;
    }

    const bucket = await this.blockchain.ddcCustomers.getBucket(bucketId);

    if (!bucket) {
      throw new Error(`Failed to get bucket ${bucketId} on blockchain`);
    }

    this.logger.debug({ bucket }, 'Got bucket from blockchain');
    this.bucketCache.set(bucketId, bucket);

    return bucket;
  }
}
