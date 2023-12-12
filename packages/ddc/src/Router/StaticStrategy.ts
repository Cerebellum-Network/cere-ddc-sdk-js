import { BucketId } from '@cere-ddc-sdk/blockchain';

import { BaseStrategy } from './BaseStrategy';
import { RouterNode } from './RoutingStrategy';
import { Logger } from '../Logger';

export type StaticStrategyConfig = {
  nodes: RouterNode[];
};

export class StaticStrategy extends BaseStrategy {
  private nodes: RouterNode[];

  constructor(logger: Logger, { nodes }: StaticStrategyConfig) {
    super(logger);

    this.nodes = nodes;
  }

  async isReady() {
    return true;
  }

  async getNodes(bucketId: BucketId) {
    return this.nodes;
  }
}
