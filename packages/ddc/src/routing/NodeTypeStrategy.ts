import { StorageNodeMode as Mode } from '@cere-ddc-sdk/blockchain';

import { RouterOperation as Operation, RouterNode } from './RoutingStrategy';
import { BaseStrategy } from './BaseStrategy.web';

type ModePriorityMap = Partial<Record<Mode, number>>;
type OperationPriorityMap = Record<Operation, ModePriorityMap>;

/**
 * The `priorityMap` defines the priority of the operation for each mode.
 * The lower the number, the higher the priority.
 */
const priorityMap: OperationPriorityMap = {
  [Operation.READ_DAG_NODE]: {
    [Mode.Full]: 1,
    [Mode.Cache]: 1,
    [Mode.Storage]: 2,
  },

  [Operation.STORE_DAG_NODE]: {
    [Mode.Full]: 1,
    [Mode.Storage]: 2,
    [Mode.Cache]: undefined, // Not applicable for the operation
  },

  [Operation.READ_PIECE]: {
    [Mode.Full]: 1,
    [Mode.Cache]: 1,
    [Mode.Storage]: 2,
  },

  [Operation.STORE_PIECE]: {
    [Mode.Full]: 1,
    [Mode.Storage]: 2,
    [Mode.Cache]: undefined, // Not applicable for the operation
  },

  [Operation.READ_CNS_RECORD]: {
    [Mode.Full]: 1,
    [Mode.Cache]: 1,
    [Mode.Storage]: 2,
  },

  [Operation.STORE_CNS_RECORD]: {
    [Mode.Full]: 1,
    [Mode.Storage]: 2,
    [Mode.Cache]: undefined, // Not applicable for the operation
  },
};

/**
 * The `NodeTypeStrategy` selects a node based on the operation type and node mode.
 */
export abstract class NodeTypeStrategy extends BaseStrategy {
  async marshalNodes(operation: Operation, allNodes: RouterNode[]): Promise<RouterNode[]> {
    const nodes = await super.marshalNodes(operation, allNodes);

    const opertaionPriorityMap = priorityMap[operation];
    const operationNodes = nodes.filter(({ mode }) => opertaionPriorityMap[mode] !== undefined);

    return operationNodes.sort((a, b) => {
      const aPriority = a.priority ?? opertaionPriorityMap[a.mode] ?? 0;
      const bPriority = b.priority ?? opertaionPriorityMap[b.mode] ?? 0;

      return aPriority - bPriority;
    });
  }

  selectNode(operation: Operation, nodes: RouterNode[]): RouterNode | undefined {
    return nodes[0]; // select first node from the rundomly shuffled list
  }
}
