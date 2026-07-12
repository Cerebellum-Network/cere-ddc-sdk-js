import { CereClient, Bucket, BucketId, ClusterId, StorageNode as BCStorageNode } from '@cere-ddc-sdk/blockchain';

import { RouterNode } from './RoutingStrategy';
import { Logger } from '../logger';
import { PingStrategy } from './PingStrategy';

export type BlockchainStrategyConfig = {
  client: CereClient;
};

/**
 * The `BlockchainStrategy` retrieves nodes from the blockchain. And appiles the `PingStrategy` + `NodeTypeStrategy` to select the best node.
 */
export class BlockchainStrategy extends PingStrategy {
  private client: CereClient;
  private bucketCache: Map<BucketId, Bucket> = new Map();
  private clusterNodes: Map<ClusterId, RouterNode[]> = new Map();
  private readyProbe?: Promise<boolean>;

  constructor(logger: Logger, { client }: BlockchainStrategyConfig) {
    super(logger);

    this.client = client;
  }

  async isReady() {
    // `Router.getNode()` calls `isReady()` on every store/read/dagNode operation.
    // Memoize the probe so it runs at most once per instance and resolves
    // instantly thereafter, mirroring the old polkadot.js `api.isReady`
    // resolve-once semantics and avoiding a per-operation RPC round-trip. A
    // rejection clears the cache so a transient liveness-probe failure doesn't
    // permanently brick the instance — only a resolved probe is memoized.
    return (this.readyProbe ??= this.probeLiveness().catch((err) => {
      this.readyProbe = undefined;
      throw err;
    }));
  }

  private async probeLiveness(): Promise<boolean> {
    // The papi client connects lazily and has no `isReady()` gate; a cheap
    // chain read confirms the connection is live.
    await this.client.chain.getCurrentBlockNumber();

    return true;
  }

  async getNodes(bucketId: BucketId) {
    const { clusterId } = await this.getBucket(bucketId);
    const nodes = await this.getClusterNodes(clusterId);

    this.logger.debug({ nodes }, 'Using nodes from blockchain');

    if (!nodes.length) {
      throw new Error(`No nodes found in the cluster: ${clusterId}`);
    }

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
    const allNodes = await this.client.nodes.listStorageNodes();
    const clusterNodes = allNodes.filter((node) => node.clusterId === clusterId).map(this.mapNodeProps);
    this.clusterNodes.set(clusterId, clusterNodes);

    return clusterNodes;
  }

  private async getBucket(bucketId: BucketId) {
    if (this.bucketCache.has(bucketId)) {
      return this.bucketCache.get(bucketId)!;
    }

    const bucket = await this.client.customers.getBucket(bucketId);

    if (!bucket) {
      throw new Error(`Failed to get bucket ${bucketId} on blockchain`);
    }

    this.logger.debug({ bucket }, 'Got bucket from blockchain');
    this.bucketCache.set(bucketId, bucket);

    return bucket;
  }
}
