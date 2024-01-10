import { RouterNode, RouterOperation, RoutingStrategy } from './RoutingStrategy';

const isSSLRequired = () => globalThis.location?.protocol === 'https:';

export abstract class BaseStrategy extends RoutingStrategy {
  async filterNodes(operation: RouterOperation, allNodes: RouterNode[]) {
    if (!isSSLRequired()) {
      return allNodes;
    }

    const nodes = allNodes.filter((node) => node.ssl);
    this.logger.debug({ nodes }, 'Filter nodes suitable for secure web (domain + SSL)');

    return nodes;
  }
}
