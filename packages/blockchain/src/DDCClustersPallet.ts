import {ApiPromise} from '@polkadot/api';
import {HexString, Sendable} from './Blockchain';
import {AccountId32} from '@polkadot/types/interfaces/runtime';
import {PalletDdcClustersCluster} from '@polkadot/types/lookup';

export class DDCClustersPallet {
    constructor(private apiPromise: ApiPromise) {}

    listClusters() {
        return this.apiPromise.query.ddcClusters.clusters.entries();
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

    addNodeToCluster(clusterId: ClusterId, nodePublicKey: string) {
        return this.apiPromise.tx.ddcClusters.addNode(clusterId, nodePublicKey) as Sendable;
    }

    removeNodeFromCluster(clusterId: ClusterId, nodePublicKey: string) {
        return this.apiPromise.tx.ddcClusters.removeNode(clusterId, nodePublicKey) as Sendable;
    }
}

export type ClusterId = HexString;
export type ClusterParams = {
    readonly params: string;
    readonly nodeProviderAuthContract: string; //AccountId32;
};
export type Cluster = PalletDdcClustersCluster;
