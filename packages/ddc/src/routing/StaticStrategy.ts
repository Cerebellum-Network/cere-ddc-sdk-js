import { BucketId } from '@cere-ddc-sdk/blockchain';

import { RouterNode } from './RoutingStrategy';
import { Logger } from '../logger';
import { PingStrategy } from './PingStrategy';

export type StaticStrategyConfig = {
  nodes: RouterNode[];
};

export class StaticStrategy extends PingStrategy {
  private nodes: RouterNode[];

  constructor(logger: Logger, { nodes }: StaticStrategyConfig) {
    super(logger);

    this.nodes = nodes;
  }

  async getNodes(bucketId: BucketId) {
    return this.nodes;
  }

  async isReady() {
    return true;
  }
}
