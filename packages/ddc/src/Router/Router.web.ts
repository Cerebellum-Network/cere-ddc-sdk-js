import { BaseRouter, RouterOperation, RouterNode } from './BaseRouter';

export class Router extends BaseRouter {
  selectNode(operation: RouterOperation, nodes: RouterNode[]): RouterNode {
    const sslNodes = nodes.filter((node) => node.ssl);
    const randomIndex = Math.floor(Math.random() * sslNodes.length);

    return sslNodes[randomIndex];
  }
}
