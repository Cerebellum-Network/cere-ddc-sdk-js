import { BaseRouter, RouterOperation, RouterNode } from './BaseRouter';

const isSSLRequired = () => globalThis.location?.protocol === 'https:';

export class Router extends BaseRouter {
  selectNode(operation: RouterOperation, nodes: RouterNode[]): RouterNode {
    const sslNodes = isSSLRequired() ? nodes.filter((node) => node.ssl) : nodes;
    const randomIndex = Math.floor(Math.random() * sslNodes.length);

    return sslNodes[randomIndex];
  }
}
