/**
 * Temporary concept which will later be revised and probably re-implemented differently
 *
 * TODO: Repalce with real implementation
 */

import {StorageNode} from '../StorageNode';

export enum RouterOperation {
    READ_DAG_NODE = 'read-dag-node',
    STORE_DAG_NODE = 'store-dag-node',
    READ_PIECE = 'read-piece',
    STORE_PIECE = 'read-piece',
}

export type RouterNode = {
    rpcHost: string;
};

export class Router {
    constructor(private nodes: RouterNode[]) {}

    async getNode(operation: RouterOperation) {
        const node = this.nodes[Math.floor(Math.random() * this.nodes.length)];

        if (!node) {
            throw new Error('No nodes available to handle the operation');
        }

        return new StorageNode(node);
    }
}
