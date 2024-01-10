import { StorageNodeConfig } from '../nodes';
import { RouterOperation, RoutingStrategy } from './RoutingStrategy';

export abstract class BaseStrategy extends RoutingStrategy {
  async filterNodes(operation: RouterOperation, nodes: StorageNodeConfig[]) {
    return nodes;
  }
}
