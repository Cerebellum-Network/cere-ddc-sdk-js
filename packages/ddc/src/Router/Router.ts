import { BucketId, Signer } from '@cere-ddc-sdk/blockchain';

import { RouterOperation, RoutingStrategy } from './RoutingStrategy';
import { BlockchainStrategy, BlockchainStrategyConfig } from './BlockchainStrategy';
import { StaticStrategy, StaticStrategyConfig } from './StaticStrategy';
import { LogLevel, Logger, LoggerOptions, createLogger } from '../Logger';
import { StorageNode } from '../StorageNode';

export type RouterConfig = (StaticStrategyConfig | BlockchainStrategyConfig) &
  LoggerOptions & {
    signer: Signer;
  };

export class Router {
  private strategy: RoutingStrategy;
  private signer: Signer;
  private logger: Logger;

  constructor({ signer, ...config }: RouterConfig) {
    this.logger = createLogger({ ...config, prefix: 'Router' });
    this.signer = signer;

    if ('nodes' in config) {
      this.strategy = new StaticStrategy(this.logger, config);
    } else {
      this.strategy = new BlockchainStrategy(this.logger, config);
    }
  }

  async getNode(operation: RouterOperation, bucketId: BucketId) {
    this.logger.info('Getting node for operation "%s" in bucket %s', operation, bucketId);

    const nodes = await this.strategy.getNodes(bucketId);
    const node = nodes.length > 1 ? this.strategy.selectNode(operation, nodes) : nodes[0];

    if (!node) {
      throw new Error('No nodes available to handle the operation');
    }

    this.logger.info(node, `Selected node for operation "%s" in bucket %s`, operation, bucketId);

    return new StorageNode(this.signer, {
      ...node,
      logLevel: this.logger.level as LogLevel,
    });
  }
}
