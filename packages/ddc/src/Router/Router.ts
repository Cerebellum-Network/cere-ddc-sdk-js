/**
 * Temporary concept which will later be revised and probably re-implemented differently
 *
 * TODO: Repalce with real implementation
 */

import {Signer} from '../Signer';
import {StorageNode, StorageNodeConfig} from '../StorageNode';

export enum RouterOperation {
    READ_DAG_NODE = 'read-dag-node',
    STORE_DAG_NODE = 'store-dag-node',
    READ_PIECE = 'read-piece',
    STORE_PIECE = 'read-piece',
}

export type RouterNode = StorageNodeConfig;
export type RouterConfig = {
    signer: Signer;
    nodes: RouterNode[];
};

export class Router {
    constructor(private config: RouterConfig) {}

    async isRead() {
        return this.config.signer.isReady();
    }

    async getNode(operation: RouterOperation) {
        await this.isRead();

        const nodes = this.config.nodes;
        const node = nodes[Math.floor(Math.random() * nodes.length)];

        if (!node) {
            throw new Error('No nodes available to handle the operation');
        }

        return new StorageNode(this.config.signer, node);
    }
}
