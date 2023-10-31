import {ApiPromise} from '@polkadot/api';
import {HexString, Sendable} from './Blockchain';
import {PalletDdcClustersCluster} from '@polkadot/types/lookup';
import {CdnNodePublicKey, NodePublicKey, StorageNodePublicKey} from './DDCNodesPallet';

export class DDCClustersPallet {
    constructor(private apiPromise: ApiPromise) {}

    async listClusters() {
        const entries = await this.apiPromise.query.ddcClusters.clusters.entries();

        return entries.map(([keyValue, _]) => keyValue[1] as unknown as Cluster);
    }

    async listNodeKeys(clusterId: ClusterId) {
        const entries = await this.apiPromise.query.ddcClusters.clustersNodes.entries(clusterId);
        return entries
            .filter(([_, inCluster]) => inCluster.toPrimitive() === true)
            .map(([keyValue, _]) => keyValue[1] as unknown as NodePublicKey);
    }

    clusterHasCdnNode(clusterId: ClusterId, cdnNodePublicKey: CdnNodePublicKey) {
        return this.apiPromise.query.ddcClusters.clustersNodes(clusterId, {CDNPubKey: cdnNodePublicKey});
    }

    clusterHasStorageNode(clusterId: ClusterId, storageNodePublicKey: StorageNodePublicKey) {
        return this.apiPromise.query.ddcClusters.clustersNodes(clusterId, {StoragePubKey: storageNodePublicKey});
    }

    createCluster(clusterId: ClusterId, clusterParams: ClusterParams) {
        return this.apiPromise.tx.ddcClusters.createCluster(clusterId, clusterParams) as Sendable;
    }

    async findClusterById(clusterId: ClusterId) {
        const result = await this.apiPromise.query.ddcClusters.clusters(clusterId);
        return result.unwrapOr(undefined)?.toJSON() as unknown as Cluster;
    }

    setClusterParams(clusterId: ClusterId, clusterParams: ClusterParams) {
        return this.apiPromise.tx.ddcClusters.setClusterParams(clusterId, clusterParams) as Sendable;
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
}

export type ClusterId = HexString;
export type ClusterParams = {
    readonly params: string;
    readonly nodeProviderAuthContract: string; //AccountId32;
};
export type Cluster = PalletDdcClustersCluster;
