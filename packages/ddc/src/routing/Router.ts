import { BucketId, Signer } from '@cere-ddc-sdk/blockchain';

import { StorageNode, StorageNodeConfig } from '../nodes';
import { RouterNode, RouterOperation, RoutingStrategy } from './RoutingStrategy';
import { BlockchainStrategy, BlockchainStrategyConfig } from './BlockchainStrategy';
import { StaticStrategy, StaticStrategyConfig } from './StaticStrategy';
import { Logger, LoggerOptions, createLogger } from '../logger';
import { AuthToken, createSdkToken, isValidSdkToken } from '../auth';

export type RouterConfig = (StaticStrategyConfig | BlockchainStrategyConfig) &
  LoggerOptions & {
    signer: Signer;
  };

const getNodeId = (node: RouterNode) => node.nodeId || node.grpcUrl;

/**
 * The `Router` class provides methods for routing operations to different nodes based on a routing strategy.
 *
 * @internal
 * @example
 *
 * ```typescript
 * const router = new Router({
 *   signer: new UriSigner('...'),
 *   nodes: [...],
 * });
 * ```
 */
export class Router {
  private strategy: RoutingStrategy;
  private signer: Signer;
  private logger: Logger;
  private sdkTokenPromise?: Promise<AuthToken>;

  constructor({ signer, ...config }: RouterConfig) {
    this.logger = createLogger('Router', config);
    this.signer = signer;

    if ('nodes' in config) {
      this.strategy = new StaticStrategy(this.logger, config);
      this.logger.debug({ strategy: 'static' }, 'Router created');
    } else {
      this.strategy = new BlockchainStrategy(this.logger, config);
      this.logger.debug({ strategy: 'blockchain' }, 'Router created');
    }
  }

  /**
   * Returns an SDK token for the current signer
   */
  private getSdkToken() {
    this.sdkTokenPromise = Promise.all([this.sdkTokenPromise, this.signer.isReady()]).then(([token]) =>
      token && isValidSdkToken(this.signer, token) ? token : createSdkToken(this.signer),
    );

    return this.sdkTokenPromise;
  }

  /**
   * Retrieves a node for a specific operation in a specific bucket, excluding certain nodes.
   *
   * @param operation - The operation for which to retrieve a node.
   * @param bucketId - The ID of the bucket in which to retrieve a node.
   * @param exclude - An optional array of node IDs to exclude from the retrieval.
   *
   * @returns A promise that resolves to the `StorageNode` selected for the operation.
   *
   * @throws Will throw an error if no nodes are available to handle the operation.
   */
  async getNode(
    operation: RouterOperation,
    bucketId: BucketId,
    config: Partial<StorageNodeConfig> = {},
    exclude: string[] = [],
  ) {
    this.logger.info('Getting node for operation "%s" in bucket %s', operation, bucketId);

    const sdkTokenPromise = this.getSdkToken();
    await this.strategy.isReady();

    const allNodes = await this.strategy.getNodes(bucketId);
    const nodes = allNodes.filter((node) => !exclude.includes(getNodeId(node)));
    const finalNodes = await this.strategy.marshalNodes(operation, nodes);
    const node = this.strategy.selectNode(operation, finalNodes);

    if (!node) {
      throw new Error('No nodes available to handle the operation');
    }

    const storageNode = new StorageNode(this.signer, {
      ...node,
      logger: this.logger,
      authToken: await sdkTokenPromise,
      nodeId: node.nodeId || node.grpcUrl,
      ...config,
    });

    this.logger.info(`Selected node for operation "%s" in bucket %s: %s`, operation, bucketId, storageNode.displayName);
    this.logger.debug({ bucketId, node }, 'Selected node');

    return storageNode;
  }
}
