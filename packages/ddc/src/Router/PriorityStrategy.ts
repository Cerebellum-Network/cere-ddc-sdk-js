import { StorageNodeMode as Mode } from '@cere-ddc-sdk/blockchain';

import { shuffle } from './RandomStrategy';
import { RouterOperation as Operation, RouterNode, RoutingStrategy } from './RoutingStrategy';

type ModePriorityMap = Partial<Record<Mode, number>>;
type OperationPriorityMap = Record<Operation, ModePriorityMap>;

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
};

export abstract class PriorityStrategy extends RoutingStrategy {
  selectNode(operation: Operation, nodes: RouterNode[]) {
    const opertaionPriorityMap = priorityMap[operation];
    const operationNodes = nodes.filter(({ mode }) => opertaionPriorityMap[mode] !== undefined);

    /**
     * Sort nodes by priority where the lower the number the higher the priority. 0 - highest priority.
     */
    const [node] = shuffle(operationNodes).sort((a, b) => {
      const aPriority = opertaionPriorityMap[a.mode] || 0;
      const bPriority = opertaionPriorityMap[b.mode] || 0;

      return aPriority - bPriority;
    });

    return node;
  }
}
