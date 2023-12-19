import { ApiPromise } from '@polkadot/api';
import { Sendable } from './Blockchain';
import type { AccountId, Amount, ClusterId, StakingLedger, StorageNodePublicKey } from './types';

export class DDCStakingPallet {
  constructor(private apiPromise: ApiPromise) {}

  bondStorageNode(controller: AccountId, storageNodePublicKey: StorageNodePublicKey, bondAmount: Amount) {
    return this.apiPromise.tx.ddcStaking.bond(
      controller,
      { StoragePubKey: storageNodePublicKey },
      bondAmount,
    ) as Sendable;
  }

  chill() {
    return this.apiPromise.tx.ddcStaking.chill() as Sendable;
  }

  fastChillStorage(storageNodePubKey: StorageNodePublicKey) {
    return this.apiPromise.tx.ddcStaking.fastChill({ StoragePubKey: storageNodePubKey }) as Sendable;
  }

  unbond(amount: Amount) {
    return this.apiPromise.tx.ddcStaking.unbond(amount) as Sendable;
  }

  withdrawUnbonded() {
    return this.apiPromise.tx.ddcStaking.withdrawUnbonded() as Sendable;
  }

  async findStashAccountIdByStorageNodePublicKey(storageNodePublicKey: StorageNodePublicKey) {
    const result = await this.apiPromise.query.ddcStaking.nodes({ StoragePubKey: storageNodePublicKey });
    return result.toJSON() as unknown as AccountId | undefined;
  }

  async listStakedStorageNodesStashAccountsAndClusterIds() {
    const result = await this.apiPromise.query.ddcStaking.storages.entries();
    return result.map(([key, clusterId]) => ({
      stashAccountId: key.args[0].toJSON() as unknown as AccountId,
      clusterId: clusterId.toJSON() as unknown as ClusterId,
    }));
  }

  async findStakedClusterIdByCdnNodeStashAccountId(stashAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.cdNs(stashAccountId);
    return result.toJSON() as unknown as ClusterId | undefined;
  }

  async listStakedCdnNodesStashAccountsAndClusterIds() {
    const result = await this.apiPromise.query.ddcStaking.cdNs.entries();
    return result.map(([key, clusterId]) => ({
      stashAccountId: key.args[0].toJSON() as unknown as AccountId,
      clusterId: clusterId.toJSON() as unknown as ClusterId,
    }));
  }

  async findStakedClusterIdByStorageNodeStashAccountId(stashAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.storages(stashAccountId);
    return result.toJSON() as unknown as ClusterId | undefined;
  }

  setController(accountId: AccountId) {
    return this.apiPromise.tx.ddcStaking.setController(accountId) as Sendable;
  }

  setStorageNode(storageNodePublicKey: StorageNodePublicKey) {
    return this.apiPromise.tx.ddcStaking.setNode({ StoragePubKey: storageNodePublicKey }) as Sendable;
  }

  store(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcStaking.store(clusterId) as Sendable;
  }

  serve(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcStaking.serve(clusterId) as Sendable;
  }

  async findStakingLedgerByControllerAccountId(controllerAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.ledger(controllerAccountId);
    return result.toJSON() as unknown as StakingLedger | undefined;
  }

  async findControllerAccountByStashAccountId(stashAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.bonded(stashAccountId);
    return result.toJSON() as unknown as AccountId | undefined;
  }

  async findNodePublicKeyByStashAccountId(stashAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.providers(stashAccountId);

    return result.toJSON() as unknown as { storagePubKey: StorageNodePublicKey } | undefined;
  }
}
