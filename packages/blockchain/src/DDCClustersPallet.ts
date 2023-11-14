import {ApiPromise} from '@polkadot/api';
import {Sendable} from './Blockchain';
import type {
    AccountId,
    CdnNodePublicKey,
    Cluster,
    ClusterGovernmentParams,
    ClusterId,
    ClusterProps,
    StorageNodePublicKey,
} from './types';

export class DDCClustersPallet {
    constructor(private apiPromise: ApiPromise) {}

    async listClusters() {
        const entries = await this.apiPromise.query.ddcClusters.clusters.entries();

        return entries.map(([_, clusterOption]) => clusterOption.unwrapOr(undefined)?.toJSON() as unknown as Cluster);
    }

    async listNodeKeys(clusterId: ClusterId) {
        const entries = await this.apiPromise.query.ddcClusters.clustersNodes.entries(clusterId);
        return entries.map(([key, _]) =>
            key.args[1].isCdnPubKey
                ? (key.args[1].asCdnPubKey.toJSON() as unknown as CdnNodePublicKey)
                : (key.args[1].asStoragePubKey.toJSON() as unknown as StorageNodePublicKey),
        );
    }

    async clusterHasCdnNode(clusterId: ClusterId, cdnNodePublicKey: CdnNodePublicKey) {
        const result = await this.apiPromise.query.ddcClusters.clustersNodes(clusterId, {CDNPubKey: cdnNodePublicKey});
        return result.toJSON() as boolean;
    }

    async clusterHasStorageNode(clusterId: ClusterId, storageNodePublicKey: StorageNodePublicKey) {
        const result = await this.apiPromise.query.ddcClusters.clustersNodes(clusterId, {
            StoragePubKey: storageNodePublicKey,
        });
        return result.toJSON() as boolean;
    }

    createCluster(
        clusterId: ClusterId,
        clusterManagerId: AccountId,
        clusterReserveId: AccountId,
        clusterProps: ClusterProps,
        clusterGovernmentParams: ClusterGovernmentParams,
    ) {
        return this.apiPromise.tx.ddcClusters.createCluster(
            clusterId,
            clusterManagerId,
            clusterReserveId,
            clusterProps,
            clusterGovernmentParams,
        ) as Sendable;
    }

    async findClusterById(clusterId: ClusterId) {
        const result = await this.apiPromise.query.ddcClusters.clusters(clusterId);
        return result.unwrapOr(undefined)?.toJSON() as unknown as Cluster;
    }

    setClusterParams(clusterId: ClusterId, clusterProps: ClusterProps) {
        return this.apiPromise.tx.ddcClusters.setClusterParams(clusterId, clusterProps) as Sendable;
    }

    addStorageNodeToCluster(clusterId: ClusterId, storageNodePublicKey: StorageNodePublicKey) {
        return this.apiPromise.tx.ddcClusters.addNode(clusterId, {StoragePubKey: storageNodePublicKey}) as Sendable;
    }

    addCdnNodeToCluster(clusterId: ClusterId, cdnNodePublicKey: CdnNodePublicKey) {
        return this.apiPromise.tx.ddcClusters.addNode(clusterId, {CDNPubKey: cdnNodePublicKey}) as Sendable;
    }

    removeCdnNodeFromCluster(clusterId: ClusterId, cdnNodePublicKey: CdnNodePublicKey) {
        return this.apiPromise.tx.ddcClusters.removeNode(clusterId, {CDNPubKey: cdnNodePublicKey}) as Sendable;
    }

    removeStorageNodeFromCluster(clusterId: ClusterId, storageNodePublicKey: StorageNodePublicKey) {
        return this.apiPromise.tx.ddcClusters.removeNode(clusterId, {StoragePubKey: storageNodePublicKey}) as Sendable;
    }

    async getClusterGovernmentParams(clusterId: ClusterId) {
        const result = await this.apiPromise.query.ddcClusters.clustersGovParams(clusterId);
        return result.unwrapOr(undefined)?.toJSON() as unknown as ClusterGovernmentParams | undefined;
    }
}
