import { Blockchain, Bucket, BucketId, ClusterId, StorageNode as BCStorageNode } from '@cere-ddc-sdk/blockchain';

import { RouterNode } from './RoutingStrategy';
import { Logger } from '../logger';
import { PingStrategy } from './PingStrategy';

export type BlockchainStrategyConfig = {
  blockchain: Blockchain;
};

/**
 * The `BlockchainStrategy` retrieves nodes from the blockchain. And appiles the `PingStrategy` + `NodeTypeStrategy` to select the best node.
 */
export class BlockchainStrategy extends PingStrategy {
  private blockchain: Blockchain;
  private bucketCache: Map<BucketId, Bucket> = new Map();
  private clusterNodes: Map<ClusterId, RouterNode[]> = new Map();

  constructor(logger: Logger, { blockchain }: BlockchainStrategyConfig) {
    super(logger);

    this.blockchain = blockchain;
  }

  async isReady() {
    await this.blockchain.isReady();

    return true;
  }

  async getNodes(bucketId: BucketId) {
    const { clusterId } = await this.getBucket(bucketId);
    const nodes = await this.getClusterNodes(clusterId);

    this.logger.debug({ nodes }, 'Using nodes from blockchain');

    return nodes;
  }

  private mapNodeProps = (node: BCStorageNode): RouterNode => {
    const { grpcPort, host, httpPort, ssl, domain } = node.props;
    const httpHost = domain || host;
    const httpUrl = ssl ? `https://${httpHost}` : `http://${httpHost}:${httpPort}`;

    return {
      ssl,
      httpUrl,
      grpcUrl: `grpc://${host}:${grpcPort}`,
      mode: node.props.mode,
    };
  };

  private async getClusterNodes(clusterId: ClusterId) {
    if (this.clusterNodes.has(clusterId)) {
      return this.clusterNodes.get(clusterId)!;
    }

    /**
     * TODO: Revise the solution and if the blockchain pallet adds a method to fetch nodes with props by clusterId then use it here.
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
