import { RouterNode, RouterOperation, RoutingStrategy } from './RoutingStrategy';

const isSSLRequired = () => globalThis.location?.protocol === 'https:';

export abstract class BaseStrategy extends RoutingStrategy {
  selectNode(operation: RouterOperation, nodes: RouterNode[]) {
    const sslNodes = isSSLRequired() ? nodes.filter((node) => node.ssl) : nodes;
    const randomIndex = Math.floor(Math.random() * sslNodes.length);

    return sslNodes[randomIndex];
  }
}
