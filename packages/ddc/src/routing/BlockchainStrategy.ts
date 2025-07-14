import { Blockchain, Bucket, BucketId, ClusterId, StorageNode as BCStorageNode } from '@cere-ddc-sdk/blockchain';

import { RouterNode } from './RoutingStrategy';
import { Logger } from '../logger';
import { PingStrategy } from './PingStrategy';
import { BUCKET_CACHE_TTL } from '../constants';

export type BlockchainRetryConfig = {
  maxRetries?: number;
  retryDelay?: number;
};

export type BlockchainStrategyConfig = {
  blockchain: Blockchain;
  retryConfig?: BlockchainRetryConfig;
};

type BucketCacheEntry = {
  bucket: Bucket;
  timestamp: number;
};

/**
 * The `BlockchainStrategy` retrieves nodes from the blockchain. And appiles the `PingStrategy` + `NodeTypeStrategy` to select the best node.
 */
export class BlockchainStrategy extends PingStrategy {
  private blockchain: Blockchain;
  private bucketCache: Map<BucketId, BucketCacheEntry> = new Map();
  private clusterNodes: Map<ClusterId, RouterNode[]> = new Map();
  private retryConfig: BlockchainRetryConfig;

  constructor(logger: Logger, { blockchain, retryConfig = {} }: BlockchainStrategyConfig) {
    super(logger);

    this.blockchain = blockchain;
    this.retryConfig = retryConfig;
  }

  /**
   * Check if a bucket cache entry is expired based on TTL
   */
  private isBucketCacheExpired(entry: BucketCacheEntry): boolean {
    return Date.now() - entry.timestamp > BUCKET_CACHE_TTL;
  }

  /**
   * Clean expired bucket cache entries
   */
  private cleanExpiredBuckets(): void {
    const beforeSize = this.bucketCache.size;

    for (const [bucketId, entry] of this.bucketCache.entries()) {
      if (this.isBucketCacheExpired(entry)) {
        this.bucketCache.delete(bucketId);
      }
    }

    const removedCount = beforeSize - this.bucketCache.size;
    if (removedCount > 0) {
      this.logger.debug('🧹 Cleaned %d expired bucket cache entries (TTL: %dms)', removedCount, BUCKET_CACHE_TTL);
    }
  }

  async isReady() {
    await this.blockchain.isReady();

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
    const allNodes = await this.blockchain.ddcNodes.listStorageNodes();
    const clusterNodes = allNodes.filter((node) => node.clusterId === clusterId).map(this.mapNodeProps);
    this.clusterNodes.set(clusterId, clusterNodes);

    return clusterNodes;
  }

  private async getBucket(bucketId: BucketId, retryCount = 0): Promise<Bucket> {
    // Check cache first and validate TTL
    const cached = this.bucketCache.get(bucketId);
    if (cached && !this.isBucketCacheExpired(cached)) {
      return cached.bucket;
    } else if (cached) {
      this.bucketCache.delete(bucketId);
    }

    const maxRetries = this.retryConfig.maxRetries ?? 3; // Default to 3 if not configured
    const baseRetryDelay = this.retryConfig.retryDelay ?? 1000; // Default to 1000ms if not configured
    const retryDelay = baseRetryDelay * (retryCount + 1); // Progressive delay

    let bucket: Bucket | undefined = undefined;

    try {
      bucket = await this.blockchain.ddcCustomers.getBucket(bucketId);
    } catch (error) {
      const errorMessage = (error as Error).message || '';
      const errorStack = (error as Error).stack || '';

      // Check for various network-related errors
      const isNetworkError =
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('EHOSTUNREACH') ||
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('WebSocket') ||
        errorStack.includes('WebSocket') ||
        errorStack.includes('network') ||
        // Check for blockchain-specific connection errors
        errorMessage.includes('Unable to retrieve the next result') ||
        errorMessage.includes('connection lost') ||
        errorMessage.includes('RPC') ||
        errorMessage.includes('provider');

      if (retryCount < maxRetries && isNetworkError) {
        this.logger.warn('🔄 Network/Connection error, retrying in %dms: %s', retryDelay, errorMessage);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return this.getBucket(bucketId, retryCount + 1);
      }
      this.logger.debug('Full error details: %o', error);

      // Enhance error with context
      const enhancedError = new Error(
        `Failed to get bucket ${bucketId} on blockchain after ${retryCount + 1} attempts. ` +
          `Original error: ${errorMessage}`,
      );

      // Copy relevant properties
      (enhancedError as any).bucketId = bucketId.toString();
      (enhancedError as any).context = 'blockchain_fetch_error';
      (enhancedError as any).retryCount = retryCount;
      (enhancedError as any).originalError = error;

      throw enhancedError;
    }

    if (bucket) {
      // Cache bucket with timestamp
      this.bucketCache.set(bucketId, {
        bucket,
        timestamp: Date.now(),
      });

      return bucket;
    } else {
      // Retry logic for bucket not found
      if (retryCount < maxRetries) {
        this.logger.warn('🔄 Bucket not found, retrying in %dms...', retryDelay);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return this.getBucket(bucketId, retryCount + 1);
      }

      // Enhanced error with suggestions
      const error = new Error(
        `Bucket ${bucketId} not found in blockchain after ${maxRetries + 1} attempts. This might indicate:\n` +
          `1. The bucket was removed or never existed\n` +
          `2. Indexer data is out of sync with blockchain\n` +
          `3. Wrong network configuration (check if indexer and blockchain endpoints match)\n` +
          `4. Temporary network connectivity issues\n\n` +
          `Suggested actions:\n` +
          `- Verify bucket exists using polkadot.js apps\n` +
          `- Check if indexer and blockchain are on the same network\n` +
          `- Try refreshing the page to reload bucket data\n` +
          `- Check network connectivity and try again later`,
      );

      // Add additional context to error
      (error as any).bucketId = bucketId.toString();
      (error as any).context = 'bucket_not_found_in_blockchain';
      (error as any).retryCount = retryCount;

      throw error;
    }
  }
}
