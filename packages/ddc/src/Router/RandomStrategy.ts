import { RoutingStrategy, RouterOperation, RouterNode } from './RoutingStrategy';

export const shuffle = (array: RouterNode[]) => {
  for (let index = array.length - 1; index > 0; index--) {
    const random = Math.floor(Math.random() * (index + 1));

    [array[index], array[random]] = [array[random], array[index]];
  }

  return array;
};

export abstract class RandomStrategy extends RoutingStrategy {
  selectNode(operation: RouterOperation, nodes: RouterNode[]): RouterNode {
    const [node] = shuffle(nodes);

    return node;
  }
}
