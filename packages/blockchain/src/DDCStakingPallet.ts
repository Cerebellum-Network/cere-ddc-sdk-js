import { ApiPromise } from '@polkadot/api';
import { Sendable } from './Blockchain';
import type { AccountId, Amount, CdnNodePublicKey, ClusterId, StorageNodePublicKey } from './types';
export class DDCStakingPallet {
  constructor(private apiPromise: ApiPromise) {}

  bondStorageNode(controller: AccountId, storageNodePublicKey: StorageNodePublicKey, bondAmount: Amount) {
    return this.apiPromise.tx.ddcStaking.bond(
      controller,
      { StoragePubKey: storageNodePublicKey },
      bondAmount,
    ) as Sendable;
  }

  bondCdnNode(controller: AccountId, cdnNodePublicKey: CdnNodePublicKey, bondAmount: Amount) {
    return this.apiPromise.tx.ddcStaking.bond(controller, { CDNPubKey: cdnNodePublicKey }, bondAmount) as Sendable;
  }

  chill() {
    return this.apiPromise.tx.ddcStaking.chill() as Sendable;
  }

  fastChillCdn(cdnNodePublicKey: CdnNodePublicKey) {
    return this.apiPromise.tx.ddcStaking.fastChill({ CDNPubKey: cdnNodePublicKey }) as Sendable;
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

  async findStashAccountIdByCdnNodePublicKey(cdnNodePublicKey: CdnNodePublicKey) {
    const result = await this.apiPromise.query.ddcStaking.nodes({ CDNPubKey: cdnNodePublicKey });
    return result.toJSON() as unknown as AccountId | undefined;
  }

  async findStashAccountIdByStorageNodePublicKey(storageNodePublicKey: StorageNodePublicKey) {
    const result = await this.apiPromise.query.ddcStaking.nodes({ StoragePubKey: storageNodePublicKey });
    return result.toJSON() as unknown as AccountId | undefined;
  }

  async findStakedClusterIdByCdnNodeStashAccountId(stashAccountId: AccountId) {
    const result = await this.apiPromise.query.ddcStaking.cdNs(stashAccountId);
    return result.toJSON() as unknown as ClusterId | undefined;
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

  setCdnNode(cdnNodePublicKey: CdnNodePublicKey) {
    return this.apiPromise.tx.ddcStaking.setNode({ CDNPubKey: cdnNodePublicKey }) as Sendable;
  }

  store(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcStaking.store(clusterId) as Sendable;
  }

  serve(clusterId: ClusterId) {
    return this.apiPromise.tx.ddcStaking.serve(clusterId) as Sendable;
  }
}
