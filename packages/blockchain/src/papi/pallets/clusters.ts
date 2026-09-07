import type { CereApi } from '../api-types.js';
import type { Sendable } from '../tx.js';
import type {
  AccountId,
  Cluster,
  ClusterId,
  ClusterNodeKind,
  ClusterParams,
  ClusterProtocolParams,
  StorageNodePublicKey,
} from '../../types.js';
import {
  buildClusterParams,
  buildProtocolParams,
  clusterNodeKind,
  storagePubKey,
  toCluster,
  toClusterProtocolParams,
} from './mapping.js';

export interface ClustersPallet {
  listClusters(): Promise<Cluster[]>;
  findClusterById(clusterId: ClusterId): Promise<Cluster | undefined>;
  filterNodeKeysByClusterId(clusterId: ClusterId): Promise<StorageNodePublicKey[]>;
  clusterHasStorageNode(clusterId: ClusterId, key: StorageNodePublicKey): Promise<boolean>;
  getClusterGovernmentParams(clusterId: ClusterId): Promise<ClusterProtocolParams | undefined>;
  createCluster(
    clusterId: ClusterId,
    reserveId: AccountId,
    params: Partial<ClusterParams>,
    gov: ClusterProtocolParams,
  ): Sendable;
  setClusterParams(clusterId: ClusterId, params: Partial<ClusterParams>): Sendable;
  addStorageNodeToCluster(clusterId: ClusterId, key: StorageNodePublicKey, kind: ClusterNodeKind): Sendable;
  removeStorageNodeFromCluster(clusterId: ClusterId, key: StorageNodePublicKey): Sendable;
}

export function createClustersPallet(api: CereApi): ClustersPallet {
  return {
    async listClusters() {
      const entries = await api.query.DdcClusters.Clusters.getEntries();
      return entries.map((e) => toCluster(e.keyArgs[0], e.value));
    },
    async findClusterById(clusterId) {
      const value = await api.query.DdcClusters.Clusters.getValue(clusterId as any);
      return value == null ? undefined : toCluster(clusterId, value);
    },
    async filterNodeKeysByClusterId(clusterId) {
      const entries = await api.query.DdcClusters.ClustersNodes.getEntries(clusterId as any);
      return entries
        .map((e: any) => e.keyArgs[1])
        .filter((k: any) => k?.type === 'StoragePubKey')
        .map((k: any) => k.value as StorageNodePublicKey);
    },
    async clusterHasStorageNode(clusterId, key) {
      const value = await api.query.DdcClusters.ClustersNodes.getValue(clusterId as any, storagePubKey(key) as any);
      return value != null;
    },
    async getClusterGovernmentParams(clusterId) {
      const value = await api.query.DdcClusters.ClustersGovParams.getValue(clusterId as any);
      return value == null ? undefined : toClusterProtocolParams(value);
    },
    createCluster(clusterId, reserveId, params, gov) {
      return api.tx.DdcClusters.create_cluster({
        cluster_id: clusterId,
        cluster_reserve_id: reserveId,
        cluster_params: buildClusterParams(params),
        initial_protocol_params: buildProtocolParams(gov),
      } as any) as Sendable;
    },
    setClusterParams(clusterId, params) {
      return api.tx.DdcClusters.set_cluster_params({
        cluster_id: clusterId,
        cluster_params: buildClusterParams(params),
      } as any) as Sendable;
    },
    addStorageNodeToCluster(clusterId, key, kind) {
      return api.tx.DdcClusters.add_node({
        cluster_id: clusterId,
        node_pub_key: storagePubKey(key),
        node_kind: clusterNodeKind(kind),
      } as any) as Sendable;
    },
    removeStorageNodeFromCluster(clusterId, key) {
      return api.tx.DdcClusters.remove_node({
        cluster_id: clusterId,
        node_pub_key: storagePubKey(key),
      } as any) as Sendable;
    },
  };
}
