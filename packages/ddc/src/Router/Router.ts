import {StorageNode, StorageNodeConfig} from '../StorageNode';
import {Blockchain, Bucket, BucketId, Cluster, ClusterId, Signer} from '@cere-ddc-sdk/blockchain';

export enum RouterOperation {
    READ_DAG_NODE = 'read-dag-node',
    STORE_DAG_NODE = 'store-dag-node',
    READ_PIECE = 'read-piece',
    STORE_PIECE = 'read-piece',
}

export type RouterNode = StorageNodeConfig;
export type RouterStaticConfig = {
    signer: Signer;
    nodes: RouterNode[];
};

export type RouterDynamicConfig = {
    signer: Signer;
    blockchain: Blockchain;
};

export type RouterConfig = RouterStaticConfig | RouterDynamicConfig;

export class Router {
    readonly blockchainCache = {
        buckets: {} as Record<string, Bucket>,
        clusters: {} as Record<ClusterId, Cluster>,
    };

    constructor(private config: RouterConfig) {}

    async isRead() {
        return this.config.signer.isReady();
    }

    async getNode(operation: RouterOperation, bucketId: BucketId) {
        await this.isRead();

        if ('blockchain' in this.config) {
            const bucket = await this.getBucket(bucketId);
            if (bucket == null) {
                throw new Error(`Failed to get info for bucket ${bucketId} on blockchain`);
            }
            if (bucket.clusterId == null) {
                throw new Error(`Bucket ${bucketId} is not allocated to any cluster`);
            }
            const cluster = await this.getCluster(bucket.clusterId);
            if (cluster == null) {
                throw new Error(`Failed to get info for cluster ${bucket.clusterId} on blockchain`);
            }
            const nodeKeys = await this.config.blockchain.ddcClusters.listNodeKeys(cluster.clusterId);
            const nodeKey = nodeKeys[Math.floor(Math.random() * nodeKeys.length)];
            const node = await this.config.blockchain.ddcNodes.findStorageNodeByPublicKey(nodeKey);
            if (node == null) {
                throw new Error(`Failed to get info for node ${nodeKey} on blockchain`);
            }

            /**
             * TODO: Revise this implementation to support future `https` endpoints
             */
            return new StorageNode(this.config.signer, {
                grpcUrl: `grpc://${node.props.host}:${node.props.grpcPort}`,
                httpUrl: `http://${node.props.host}:${node.props.httpPort}`,
            });
        } else {
            const nodes = this.config.nodes;
            const node = nodes[Math.floor(Math.random() * nodes.length)];

            if (!node) {
                throw new Error('No nodes available to handle the operation');
            }

            return new StorageNode(this.config.signer, node);
        }
    }

    private async getCluster(clusterId: ClusterId) {
        const cached = this.blockchainCache.clusters[clusterId];
        if (cached) {
            return cached;
        }

        if (!('blockchain' in this.config)) {
            return;
        }

        const cluster = await this.config.blockchain.ddcClusters.findClusterById(clusterId);
        if (cluster) {
            this.blockchainCache.clusters[clusterId] = cluster;
        }

        return cluster;
    }

    private async getBucket(bucketId: BucketId) {
        const cached = this.blockchainCache.buckets[bucketId.toString()];
        if (cached) {
            return cached;
        }

        if (!('blockchain' in this.config)) {
            return;
        }

        const bucket = await this.config.blockchain.ddcCustomers.getBucket(bucketId);
        if (bucket) {
            this.blockchainCache.buckets[bucketId.toString()] = bucket;
        }
        return bucket;
    }
}
