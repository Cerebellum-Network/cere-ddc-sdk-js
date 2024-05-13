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

/**
 * This class provides methods to interact with the DDC Clusters pallet on the blockchain.
 *
 * @group Pallets
 * @example
 *
 * ```typescript
 * const clusters = await blockchain.ddcClusters.listClusters();
 *
 * console.log(clusters);
 * ```
 */
export class DDCClustersPallet {
  constructor(private apiPromise: ApiPromise) {}

  /**
   * Lists all clusters.
   *
   * @returns A promise that resolves to an array of clusters.
   *
   * @example
   *
   * ```typescript
   * const clusters = await blockchain.ddcClustersPallet.listClusters();
   *
   * console.log(clusters);
   * ```
   */
  async listClusters() {
    const entries = (await this.apiPromise.query.ddcClusters?.clusters.entries()) || [];

    return entries.map(([, clusterOption]) => clusterOption.toJSON() as unknown as Cluster);
  }

  /**
   * Filters node keys by cluster ID.
   *
   * @param clusterId - The ID of the cluster.
   * @returns A promise that resolves to an array of node keys.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const nodeKeys = await blockchain.ddcClustersPallet.filterNodeKeysByClusterId(clusterId);
   *
   * console.log(nodeKeys);
   * ```
   */
  async filterNodeKeysByClusterId(clusterId: ClusterId) {
    const entries = await this.apiPromise.query.ddcClusters.clustersNodes.entries(clusterId);

    return entries.map(([key]: any) => key.args[1].asStoragePubKey.toJSON() as StorageNodePublicKey);
  }

  /**
   * Checks if a cluster has a storage node.
   *
   * @param clusterId - The ID of the cluster.
   * @param storageNodePublicKey - The public key of the storage node.
   * @returns A promise that resolves to a boolean indicating whether the cluster has the storage node.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const storageNodePublicKey = '0x...';
   * const hasStorageNode = await blockchain.ddcClustersPallet.clusterHasStorageNode(clusterId, storageNodePublicKey);
   *
   * console.log(hasStorageNode);
   * ```
   */
  async clusterHasStorageNode(clusterId: ClusterId, storageNodePublicKey: StorageNodePublicKey) {
    const result = await this.apiPromise.query.ddcClusters.clustersNodes(clusterId, {
      StoragePubKey: storageNodePublicKey,
    });
    return result.toJSON() as boolean;
  }

  /**
   * Creates a new cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @param clusterManagerId - The ID of the cluster manager.
   * @param clusterReserveId - The ID of the cluster reserve.
   * @param clusterProps - The properties of the cluster.
   * @param clusterGovernmentParams - The government parameters of the cluster.
   * @returns An extrinsic to create the cluster.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const clusterManagerId = '0x...';
   * const clusterReserveId = '0x...';
   * const clusterProps = { ... };
   * const clusterGovernmentParams = { ... };
   *
   * const tx = blockchain.ddcClustersPallet.createCluster(
   *   clusterId,
   *   clusterManagerId,
   *   clusterReserveId,
   *   clusterProps,
   *   clusterGovernmentParams
   * );
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  createCluster(
    clusterId: ClusterId,
    clusterManagerId: AccountId,
    clusterReserveId: AccountId,
    clusterProps: Partial<ClusterProps>,
    clusterGovernmentParams: ClusterGovernmentParams,
  ) {
    const clusterPropsDefaults: ClusterProps = {
      nodeProviderAuthContract: null,
      erasureCodingRequired: 16,
      erasureCodingTotal: 48,
      replicationTotal: 20,
    };

    return this.apiPromise.tx.ddcClusters.createCluster(
      clusterId,
      clusterManagerId,
      clusterReserveId,
      { ...clusterPropsDefaults, ...clusterProps },
      clusterGovernmentParams,
    ) as Sendable;
  }

  /**
   * Finds a cluster by ID.
   *
   * @param clusterId - The ID of the cluster.
   * @returns A promise that resolves to the cluster.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const cluster = await blockchain.ddcClustersPallet.findClusterById(clusterId);
   *
   * console.log(cluster);
   * ```
   */
  async findClusterById(clusterId: ClusterId) {
    const result = await this.apiPromise.query.ddcClusters.clusters(clusterId);
    return result.toJSON() as unknown as Cluster;
  }

  /**
   * Sets the properties of a cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @param clusterProps - The properties of the cluster.
   * @returns An extrinsic to set the cluster properties.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const clusterProps = { ... };
   *
   * const tx = blockchain.ddcClustersPallet.setClusterParams(clusterId, clusterProps);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  setClusterParams(clusterId: ClusterId, clusterProps: ClusterProps) {
    return this.apiPromise.tx.ddcClusters.setClusterParams(clusterId, clusterProps) as Sendable;
  }

  /**
   * Adds a storage node to a cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @param storageNodePublicKey - The public key of the storage node.
   * @returns An extrinsic to add the storage node to the cluster.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const storageNodePublicKey = '0x...';
   *
   * const tx = blockchain.ddcClustersPallet.addStorageNodeToCluster(clusterId, storageNodePublicKey);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  addStorageNodeToCluster(clusterId: ClusterId, storageNodePublicKey: StorageNodePublicKey) {
    return this.apiPromise.tx.ddcClusters.addNode(clusterId, { StoragePubKey: storageNodePublicKey }) as Sendable;
  }

  /**
   * Removes a storage node from a cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @param storageNodePublicKey - The public key of the storage node.
   * @returns An extrinsic to remove the storage node from the cluster.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const storageNodePublicKey = '0x...';
   *
   * const tx = blockchain.ddcClustersPallet.removeStorageNodeFromCluster(clusterId, storageNodePublicKey);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  removeStorageNodeFromCluster(clusterId: ClusterId, storageNodePublicKey: StorageNodePublicKey) {
    return this.apiPromise.tx.ddcClusters.removeNode(clusterId, { StoragePubKey: storageNodePublicKey }) as Sendable;
  }

  /**
   * Gets the government parameters of a cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @returns A promise that resolves to the government parameters of the cluster.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const clusterGovernmentParams = await blockchain.ddcClustersPallet.getClusterGovernmentParams(clusterId);
   *
   * console.log(clusterGovernmentParams);
   * ```
   */
  async getClusterGovernmentParams(clusterId: ClusterId) {
    const result = await this.apiPromise.query.ddcClusters.clustersGovParams(clusterId);
    return result.toJSON() as unknown as ClusterGovernmentParams | undefined;
  }
}
