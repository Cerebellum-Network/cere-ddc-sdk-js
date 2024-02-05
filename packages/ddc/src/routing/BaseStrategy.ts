import { StorageNodeConfig } from '../nodes';
import { RouterOperation, RoutingStrategy } from './RoutingStrategy';

export abstract class BaseStrategy extends RoutingStrategy {
  async marshalNodes(operation: RouterOperation, nodes: StorageNodeConfig[]) {
    return nodes;
  }
}
