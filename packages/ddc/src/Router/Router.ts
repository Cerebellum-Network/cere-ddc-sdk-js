/**
 * Temporary concept which will later be revised and probably re-implemented differently
 *
 * TODO: Repalce with real implementation
 */

import {StorageNode, StorageNodeConfig} from '../StorageNode';
import {Blockchain} from '@cere-ddc-sdk/blockchain';
import {BucketId} from '@cere-ddc-sdk/smart-contract/types';

export enum RouterOperation {
    READ_DAG_NODE = 'read-dag-node',
    STORE_DAG_NODE = 'store-dag-node',
    READ_PIECE = 'read-piece',
    STORE_PIECE = 'read-piece',
}

export type RouterNode = Pick<StorageNodeConfig, 'rpcHost'>;
export type RouterConfig = {signer: StorageNodeConfig['signer']} & ({nodes: RouterNode[]} | {blockchain: Blockchain});

export class Router {
    constructor(private config: RouterConfig) {}

    async isRead() {
        return this.config.signer.isReady();
    }

    async getNode(operation: RouterOperation, bucketId: BucketId) {
        await this.isRead();

        if ('blockchain' in this.config) {
            const bucket = await this.config.blockchain.ddcCustomers.getBucket(bucketId);
            if (bucket == null) {
                throw new Error(`Failed to get info for bucket ${bucketId} on blockchain`);
            }
            if (bucket.clusterId == null) {
                throw new Error(`Bucket ${bucketId} is not allocated to any cluster`);
            }
            const cluster = await this.config.blockchain.ddcClusters.findClusterById(bucket.clusterId);
            if (cluster == null) {
                throw new Error(`Failed to get info for cluster ${bucket.clusterId} on blockchain`);
            }
            const nodeKeys = await this.config.blockchain.ddcClusters.listNodeKeys(cluster.clusterId);
            const nodeKey = nodeKeys[Math.floor(Math.random() * nodeKeys.length)];
            const node = await this.config.blockchain.ddcNodes.findStorageNodeByPublicKey(nodeKey);
            if (node == null) {
                throw new Error(`Failed to get info for node ${nodeKey} on blockchain`);
            }
            return new StorageNode({rpcHost: node.params.rpcHost, signer: this.config.signer});
        } else {
            const nodes = this.config.nodes;
            const node = nodes[Math.floor(Math.random() * nodes.length)];

            if (!node) {
                throw new Error('No nodes available to handle the operation');
            }

            return new StorageNode({...node, signer: this.config.signer});
        }
    }
}
