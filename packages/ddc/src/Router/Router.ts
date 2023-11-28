import { BaseRouter, RouterOperation, RouterNode } from './BaseRouter';

export class Router extends BaseRouter {
  selectNode(operation: RouterOperation, nodes: RouterNode[]): RouterNode {
    const randomIndex = Math.floor(Math.random() * nodes.length);

    return nodes[randomIndex];
  }
}
