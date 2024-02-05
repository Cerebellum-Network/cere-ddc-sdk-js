import { StorageNodeConfig } from '..';
import { BaseStrategy } from './BaseStrategy';
import { RouterOperation, RouterNode } from './RoutingStrategy';

export const shuffle = (array: RouterNode[]) => {
  for (let index = array.length - 1; index > 0; index--) {
    const random = Math.floor(Math.random() * (index + 1));

    [array[index], array[random]] = [array[random], array[index]];
  }

  return array;
};

export abstract class RandomStrategy extends BaseStrategy {
  async marshalNodes(operation: RouterOperation, nodes: StorageNodeConfig[]): Promise<StorageNodeConfig[]> {
    return shuffle(nodes);
  }

  selectNode(operation: RouterOperation, nodes: RouterNode[]): RouterNode {
    return nodes[0];
  }
}
