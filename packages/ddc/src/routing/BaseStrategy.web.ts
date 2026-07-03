import { RouterNode, RouterOperation, RoutingStrategy } from './RoutingStrategy';

const isSSLRequired = () => globalThis.location?.protocol === 'https:';

export abstract class BaseStrategy extends RoutingStrategy {
  async marshalNodes(operation: RouterOperation, allNodes: RouterNode[]) {
    if (!isSSLRequired()) {
      return allNodes;
    }

    return allNodes.filter((node) => node.ssl);
  }
}
