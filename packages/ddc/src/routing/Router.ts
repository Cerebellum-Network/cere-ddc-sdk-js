import { BucketId, Signer } from '@cere-ddc-sdk/blockchain';

import { StorageNode } from '../nodes';
import { RouterNode, RouterOperation, RoutingStrategy } from './RoutingStrategy';
import { BlockchainStrategy, BlockchainStrategyConfig } from './BlockchainStrategy';
import { StaticStrategy, StaticStrategyConfig } from './StaticStrategy';
import { Logger, LoggerOptions, createLogger } from '../logger';

export type RouterConfig = (StaticStrategyConfig | BlockchainStrategyConfig) &
  LoggerOptions & {
    signer: Signer;
  };

const getNodeId = (node: RouterNode) => node.nodeId || node.grpcUrl;

export class Router {
  private strategy: RoutingStrategy;
  private signer: Signer;
  private logger: Logger;

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

  async getNode(operation: RouterOperation, bucketId: BucketId, exclude: string[] = []) {
    this.logger.info('Getting node for operation "%s" in bucket %s', operation, bucketId);

    const allNodes = await this.strategy.getNodes(bucketId);
    const nodes = allNodes.filter((node) => !exclude.includes(getNodeId(node)));
    const filterNodes = await this.strategy.filterNodes(operation, nodes);
    const node = this.strategy.selectNode(operation, filterNodes);

    if (!node) {
      throw new Error('No nodes available to handle the operation');
    }

    this.logger.info(node, `Selected node for operation "%s" in bucket %s`, operation, bucketId);

    return new StorageNode(this.signer, {
      ...node,
      logger: this.logger,
      nodeId: node.nodeId || node.grpcUrl,
    });
  }
}
