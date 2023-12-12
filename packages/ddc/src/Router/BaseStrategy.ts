import { RoutingStrategy, RouterOperation, RouterNode } from './RoutingStrategy';

export abstract class BaseStrategy extends RoutingStrategy {
  selectNode(operation: RouterOperation, nodes: RouterNode[]): RouterNode {
    const randomIndex = Math.floor(Math.random() * nodes.length);

    return nodes[randomIndex];
  }
}
