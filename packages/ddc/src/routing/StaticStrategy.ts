import { BucketId } from '@cere-ddc-sdk/blockchain';

import { RouterNode } from './RoutingStrategy';
import { PriorityStrategy } from './PriorityStrategy';
import { Logger } from '../logger';

export type StaticStrategyConfig = {
  nodes: RouterNode[];
};

export class StaticStrategy extends PriorityStrategy {
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
