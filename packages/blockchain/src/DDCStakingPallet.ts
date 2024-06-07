import { ApiPromise } from '@polkadot/api';
import { Sendable } from './Blockchain';
import type { AccountId, Amount, ClusterId, StakingLedger, StorageNodePublicKey } from './types';

/**
 * This class provides methods to interact with the DDC Staking pallet on the blockchain.
 *
 * @group Pallets
 * @example
 *
 * ```typescript
 * const storageNodePublicKey = '0x...';
 * const stashAccountId = await blockchain.ddcStaking.findStashAccountIdByStorageNodePublicKey(storageNodePublicKey);
 *
 * console.log(stashAccountId);
 * ```
 */
export class DDCStakingPallet {
  constructor(private apiPromise: ApiPromise) {}

  /**
   * Binds the storage node.
   *
   * @param controller - The account that will control the storage node.
   * @param storageNodePublicKey - The public key of the storage node.
   * @param bondAmount - The amount to bond.
   * @returns An extrinsic to bind the storage node.
   *
   * @example
   *
   * ```typescript
   * const controller = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
   * const storageNodePublicKey = '0x...';
   * const bondAmount = 100n;
   * const tx = blockchain.ddcStaking.bondStorageNode(controller, storageNodePublicKey, bondAmount);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  bondStorageNode(controller: AccountId, storageNodePublicKey: StorageNodePublicKey, bondAmount: Amount) {
    return this.apiPromise.tx.ddcStaking.bond(
      controller,
      { StoragePubKey: storageNodePublicKey },
      bondAmount,
    ) as Sendable;
  }

  /**
   * Chills the controller.
   *
   * @returns An extrinsic to chill the controller.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcStaking.chill();
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  chill() {
    return this.apiPromise.tx.ddcStaking.chill() as Sendable;
  }

  /**
   * Initiates a fast chill of storage.
   *
   * @returns An extrinsic to initiate a fast chill of storage.
   *
   * Example usage:
   * ```typescript
   * const tx = blockchain.ddcStaking.fastChillStorage();
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  fastChillStorage() {
    return this.apiPromise.tx.ddcStaking.fastChill() as Sendable;
  }

  /**
   * Unbonds the amount.
   *
   * @param amount - The amount to unbond.
   * @returns An extrinsic to unbond the amount.
   *
   * @example
   *
   * ```typescript
   * const amount = 100n;
   * const tx = blockchain.ddcStaking.unbond(amount);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  unbond(amount: Amount) {
    return this.apiPromise.tx.ddcStaking.unbond(amount) as Sendable;
  }

  /**
   * Withdraws unbonded funds.
   *
   * @returns An extrinsic to withdraw unbonded funds.
   *
   * @example
   *
   * ```typescript
   * const tx = blockchain.ddcStaking.withdrawUnbonded();
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  withdrawUnbonded() {
    return this.apiPromise.tx.ddcStaking.withdrawUnbonded() as Sendable;
  }

  /**
   * Finds the stash account ID associated with a given storage node public key.
   *
   * @param storageNodePublicKey - The public key of the storage node.
   * @returns A promise that resolves to the stash account ID, or undefined if no stash account is found.
   *
   * @example
   *
   * ```typescript
   * const storageNodePublicKey = '0x...';
   * const stashAccountId = await blockchain.ddcStaking.findStashAccountIdByStorageNodePublicKey(storageNodePublicKey);
   *
   * console.log(stashAccountId);
   * ```
   */
  async findStashAccountIdByStorageNodePublicKey(storageNodePublicKey: StorageNodePublicKey) {
    const result = await this.apiPromise.query.ddcStaking.nodes({ StoragePubKey: storageNodePublicKey });
    return result.toJSON() as unknown as AccountId | undefined;
  }

  /**
   * Returns the list of staked storage nodes, their stash accounts, and their cluster IDs.
   *
   * @returns A promise that resolves to the list of staked storage nodes, their stash accounts, and their cluster IDs.
   *
   * @example
   *
   * ```typescript
   * const stakedStorageNodes = await blockchain.ddcStaking.listStakedStorageNodesStashAccountsAndClusterIds();
   *
   * console.log(stakedStorageNodes);
   * ```
   */
  async listStakedStorageNodesStashAccountsAndClusterIds() {
    const result = await this.apiPromise.query.ddcStaking.storages.entries();
    return result.map(([key, clusterId]) => ({
      stashAccountId: key.args[0].toJSON() as unknown as AccountId,
      clusterId: clusterId.toJSON() as unknown as ClusterId,
    }));
  }

  /**
   * Finds the cluster ID associated with a given CDN node stash account ID.
   *
   * @param stashAccountId - The stash account ID of the CDN node.
   * @returns A promise that resolves to the cluster ID, or undefined if no cluster is found.
   *
   * @example
   *
   * ```typescript
   * const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
   * const clusterId = await blockchain.ddcStaking.findStakedClusterIdByCdnNodeStashAccountId(stashAccountId);
   *
   * console.log(clusterId);
   * ```
   */
  async findStakedClusterIdByCdnNodeStashAccountId(stashAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.cdNs(stashAccountId);
    return result.toJSON() as unknown as ClusterId | undefined;
  }

  /**
   * Returns the list of staked CDN nodes, their stash accounts, and their cluster IDs.
   *
   * @returns A promise that resolves to the list of staked CDN nodes, their stash accounts, and their cluster IDs.
   *
   * @example
   *
   * ```typescript
   * const stakedCdnNodes = await blockchain.ddcStaking.listStakedCdnNodesStashAccountsAndClusterIds();
   *
   * console.log(stakedCdnNodes);
   * ```
   */
  async listStakedCdnNodesStashAccountsAndClusterIds() {
    const result = await this.apiPromise.query.ddcStaking.cdNs.entries();
    return result.map(([key, clusterId]) => ({
      stashAccountId: key.args[0].toJSON() as unknown as AccountId,
      clusterId: clusterId.toJSON() as unknown as ClusterId,
    }));
  }

  /**
   * Finds the cluster ID associated with a given storage node stash account ID.
   *
   * @param stashAccountId - The stash account ID of the storage node.
   * @returns A promise that resolves to the cluster ID, or undefined if no cluster is found.
   *
   * @example
   *
   * ```typescript
   * const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
   * const clusterId = await blockchain.ddcStaking.findStakedClusterIdByStorageNodeStashAccountId(stashAccountId);
   *
   * console.log(clusterId);
   * ```
   */
  async findStakedClusterIdByStorageNodeStashAccountId(stashAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.storages(stashAccountId);
    return result.toJSON() as unknown as ClusterId | undefined;
  }

  /**
   * Sets the controller account for the stash account.
   *
   * @param accountId - The account ID of the new controller.
   * @returns An extrinsic to set the controller account.
   *
   * @example
   *
   * ```typescript
   * const newControllerAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
   * const tx = blockchain.ddcStaking.setController(newControllerAccountId);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  setController(accountId: AccountId) {
    return this.apiPromise.tx.ddcStaking.setController(accountId) as Sendable;
  }

  /**
   * Sets the storage node for the stash account.
   *
   * @param storageNodePublicKey - The public key of the storage node.
   * @returns An extrinsic to set the storage node.
   *
   * @example
   *
   * ```typescript
   * const storageNodePublicKey = '0x...';
   * const tx = blockchain.ddcStaking.setStorageNode(storageNodePublicKey);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  setStorageNode(storageNodePublicKey: StorageNodePublicKey) {
    return this.apiPromise.tx.ddcStaking.setNode({ StoragePubKey: storageNodePublicKey }) as Sendable;
  }

  /**
   * Stores the cluster ID.
   *
   * @param clusterId - The ID of the cluster.
   * @returns An extrinsic to store the cluster ID.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const tx = blockchain.ddcStaking.store(clusterId);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  store(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcStaking.store(clusterId) as Sendable;
  }

  /**
   * Serves the cluster.
   *
   * @param clusterId - The ID of the cluster.
   * @returns An extrinsic to serve the cluster.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const tx = blockchain.ddcStaking.serve(clusterId);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  serve(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcStaking.serve(clusterId) as Sendable;
  }

  /**
   * Finds the staking ledger associated with a given controller account ID.
   *
   * @param controllerAccountId - The account ID of the controller.
   * @returns A promise that resolves to the staking ledger, or undefined if no staking ledger is found.
   *
   * @example
   *
   * ```typescript
   * const controllerAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
   * const stakingLedger = await blockchain.ddcStaking.findStakingLedgerByControllerAccountId(controllerAccountId);
   *
   * console.log(stakingLedger);
   * ```
   */
  async findStakingLedgerByControllerAccountId(controllerAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.ledger(controllerAccountId);
    return result.toJSON() as unknown as StakingLedger | undefined;
  }

  /**
   * Finds the controller account associated with a given stash account ID.
   *
   * @param stashAccountId - The account ID of the stash.
   * @returns A promise that resolves to the controller account ID, or undefined if no controller account is found.
   *
   * @example
   *
   * ```typescript
   * const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
   * const controllerAccountId = await blockchain.ddcStaking.findControllerAccountByStashAccountId(stashAccountId);
   *
   * console.log(controllerAccountId);
   * ```
   */
  async findControllerAccountByStashAccountId(stashAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.bonded(stashAccountId);
    return result.toJSON() as unknown as AccountId | undefined;
  }

  /**
   * Finds the node public key associated with a given stash account ID.
   *
   * @param stashAccountId - The account ID of the stash.
   * @returns A promise that resolves to the node public key, or undefined if no node public key is found.
   *
   * @example
   *
   * ```typescript
   * const stashAccountId = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
   * const nodePublicKey = await blockchain.ddcStaking.findNodePublicKeyByStashAccountId(stashAccountId);
   *
   * console.log(nodePublicKey);
   * ```
   */
  async findNodePublicKeyByStashAccountId(stashAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.providers(stashAccountId);

    return result.toJSON() as unknown as { storagePubKey: StorageNodePublicKey } | undefined;
  }

  /**
   * Bonds the cluster.
   *
   * @param clusterId - The cluster ID to bond
   * @returns An extrinsic to bond the cluster.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const tx = blockchain.ddcStaking.bondCluster(clusterId);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  bondCluster(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcStaking.bondCluster(clusterId) as Sendable;
  }

  /**
   * Unbonds the cluster.
   *
   * @param clusterId - The cluster ID to bond
   * @returns An extrinsic to unbond the cluster.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const tx = blockchain.ddcStaking.unbondCluster(clusterId);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  unbondCluster(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcStaking.unbondCluster(clusterId) as Sendable;
  }

  /**
   * Withdraws unbonded cluster funds.
   *
   * @param clusterId - The cluster ID to withdraw
   * @returns An extrinsic to withdraw the cluster funds.
   *
   * @example
   *
   * ```typescript
   * const clusterId = '0x...';
   * const tx = blockchain.ddcStaking.withdrawUnbondedCluster(clusterId);
   *
   * await blockchain.send(tx, { account });
   * ```
   */
  withdrawUnbondedCluster(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcStaking.withdrawUnbondedCluster(clusterId) as Sendable;
  }
}
