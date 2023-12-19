import { ApiPromise } from '@polkadot/api';
import { Sendable } from './Blockchain';
import type {
  AccountId,
  Cluster,
  ClusterGovernmentParams,
  ClusterId,
  ClusterProps,
  StorageNodePublicKey,
} from './types';

export class DDCClustersPallet {
  constructor(private apiPromise: ApiPromise) {}

  async listClusters() {
    const entries = (await this.apiPromise.query.ddcClusters?.clusters.entries()) || [];

    return entries.map(([, clusterOption]) => clusterOption.toJSON() as unknown as Cluster);
  }

  async filterNodeKeysByClusterId(clusterId: ClusterId) {
    const entries = await this.apiPromise.query.ddcClusters.clustersNodes.entries(clusterId);

    return entries.map(([key]: any) => key.args[1].asStoragePubKey.toJSON() as StorageNodePublicKey);
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
    return result.toJSON() as unknown as Cluster;
  }

  setClusterParams(clusterId: ClusterId, clusterProps: ClusterProps) {
    return this.apiPromise.tx.ddcClusters.setClusterParams(clusterId, clusterProps) as Sendable;
  }

  addStorageNodeToCluster(clusterId: ClusterId, storageNodePublicKey: StorageNodePublicKey) {
    return this.apiPromise.tx.ddcClusters.addNode(clusterId, { StoragePubKey: storageNodePublicKey }) as Sendable;
  }

  removeStorageNodeFromCluster(clusterId: ClusterId, storageNodePublicKey: StorageNodePublicKey) {
    return this.apiPromise.tx.ddcClusters.removeNode(clusterId, { StoragePubKey: storageNodePublicKey }) as Sendable;
  }

  async getClusterGovernmentParams(clusterId: ClusterId) {
    const result = await this.apiPromise.query.ddcClusters.clustersGovParams(clusterId);
    return result.toJSON() as unknown as ClusterGovernmentParams | undefined;
  }
}
