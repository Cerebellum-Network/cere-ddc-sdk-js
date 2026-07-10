import type { CereApi } from '../api-types.js';
import type { Sendable } from '../tx.js';
import type { AccountId, Amount, ClusterId, StakingLedger, StorageNodePublicKey } from '../../types.js';
import { storagePubKey, toStakingLedger } from './mapping.js';

// Storage-item values in this pallet decode as plain SS58 strings (verified against
// a live devnet probe), never `Binary`/`FixedSizeBinary`, but this stays defensive
// the same way `mapping.ts`'s `hex()` does for other pallets, and guards `null`/
// `undefined` (an absent storage entry) so callers get `undefined`, never a throw.
const strOrUndef = (v: any): any => (v == null ? undefined : typeof v === 'string' ? v : (v.asHex?.() ?? v));

/**
 * Wrap a bare account id in the runtime's `MultiAddress` lookup-source enum.
 * Verified against the live `bond`/`set_controller` arg types (`controller:
 * AnonymousEnum<{ Id: SS58String; Index: number; Raw: Uint8Array; Address32:
 * SizedHex<32>; Address20: SizedHex<20> }>`) — unlike `DdcClusters`'s bare
 * `manager_id`/`reserve_id` account fields, `DdcStaking`'s `controller` arg is
 * looked up via `T::Lookup` and needs the `Id` variant wrapper to encode.
 */
const lookupId = (id: AccountId) => ({ type: 'Id' as const, value: id });

export interface StakingPallet {
  bondStorageNode(controller: AccountId, key: StorageNodePublicKey, bondAmount: Amount): Sendable;
  chill(): Sendable;
  fastChillStorage(): Sendable;
  unbond(amount: Amount): Sendable;
  withdrawUnbonded(): Sendable;
  setController(accountId: AccountId): Sendable;
  setStorageNode(key: StorageNodePublicKey): Sendable;
  store(clusterId: ClusterId): Sendable;
  bondCluster(clusterId: ClusterId): Sendable;
  unbondCluster(clusterId: ClusterId): Sendable;
  withdrawUnbondedCluster(clusterId: ClusterId): Sendable;
  findStashAccountIdByStorageNodePublicKey(key: StorageNodePublicKey): Promise<AccountId | undefined>;
  listStakedStorageNodesStashAccountsAndClusterIds(): Promise<{ stashAccountId: AccountId; clusterId: ClusterId }[]>;
  findStakedClusterIdByStorageNodeStashAccountId(stash: AccountId): Promise<ClusterId | undefined>;
  findStakingLedgerByControllerAccountId(controller: AccountId): Promise<StakingLedger | undefined>;
  findControllerAccountByStashAccountId(stash: AccountId): Promise<AccountId | undefined>;
  findNodePublicKeyByStashAccountId(stash: AccountId): Promise<{ storagePubKey: StorageNodePublicKey } | undefined>;
}

/**
 * DdcStaking pallet. NOTE: unlike the legacy `@polkadot/api` surface, this runtime's
 * `DdcStaking` (descriptor storage list: `Bonded`/`Ledger`/`Storages`/`Nodes`/
 * `Providers`/`LeavingStorages`/`ClusterBonded`/`ClusterLedger`) has NO `CDNs`
 * storage item and no CDN-node calls — CDN-node staking was removed from this
 * pallet. The CDN-facing reads in the task brief (`findStakedClusterIdByCdnNode…`/
 * `listStakedCdnNodes…`) are dropped from this interface; only storage-node +
 * cluster staking are implemented, matching what's actually on-chain.
 */
export function createStakingPallet(api: CereApi): StakingPallet {
  return {
    bondStorageNode(controller, key, bondAmount) {
      return api.tx.DdcStaking.bond({
        controller: lookupId(controller),
        node: storagePubKey(key),
        value: bondAmount,
      } as any) as Sendable;
    },
    // `chill`/`fast_chill`/`withdraw_unbonded` are typed `TxDescriptor<undefined>`
    // (zero-arg calls) — papi's `TxEntry` requires calling them with no arguments
    // at all (`()`), not `({})` (verified against `polkadot-api`'s `TxEntry` type:
    // `(...args: Arg extends undefined ? [] : [data: Arg])`).
    chill() {
      return api.tx.DdcStaking.chill() as Sendable;
    },
    fastChillStorage() {
      return api.tx.DdcStaking.fast_chill() as Sendable;
    },
    unbond(amount) {
      return api.tx.DdcStaking.unbond({ value: amount } as any) as Sendable;
    },
    withdrawUnbonded() {
      return api.tx.DdcStaking.withdraw_unbonded() as Sendable;
    },
    setController(accountId) {
      return api.tx.DdcStaking.set_controller({ controller: lookupId(accountId) } as any) as Sendable;
    },
    setStorageNode(key) {
      return api.tx.DdcStaking.set_node({ new_node: storagePubKey(key) } as any) as Sendable;
    },
    store(clusterId) {
      return api.tx.DdcStaking.store({ cluster_id: clusterId } as any) as Sendable;
    },
    bondCluster(clusterId) {
      return api.tx.DdcStaking.bond_cluster({ cluster_id: clusterId } as any) as Sendable;
    },
    unbondCluster(clusterId) {
      return api.tx.DdcStaking.unbond_cluster({ cluster_id: clusterId } as any) as Sendable;
    },
    withdrawUnbondedCluster(clusterId) {
      return api.tx.DdcStaking.withdraw_unbonded_cluster({ cluster_id: clusterId } as any) as Sendable;
    },
    // `DdcStaking.Nodes` is keyed by the `NodePubKey` enum (verified live — see
    // `storagePubKey()` in mapping.ts), unlike `Storages`/`Bonded`/`Ledger`, which
    // are keyed by a bare stash `AccountId`.
    async findStashAccountIdByStorageNodePublicKey(key) {
      return strOrUndef(await api.query.DdcStaking.Nodes.getValue(storagePubKey(key) as any));
    },
    async listStakedStorageNodesStashAccountsAndClusterIds() {
      const entries = await api.query.DdcStaking.Storages.getEntries();
      return entries.map((e: any) => ({ stashAccountId: strOrUndef(e.keyArgs[0]), clusterId: strOrUndef(e.value) }));
    },
    async findStakedClusterIdByStorageNodeStashAccountId(stash) {
      return strOrUndef(await api.query.DdcStaking.Storages.getValue(stash as any));
    },
    async findStakingLedgerByControllerAccountId(controller) {
      const value = await api.query.DdcStaking.Ledger.getValue(controller as any);
      return value == null ? undefined : toStakingLedger(value);
    },
    async findControllerAccountByStashAccountId(stash) {
      return strOrUndef(await api.query.DdcStaking.Bonded.getValue(stash as any));
    },
    // `DdcStaking.Providers` value decodes to the SAME `{ type: 'StoragePubKey',
    // value }` `NodePubKey` enum as `Nodes`'s key (verified live) — reconcile it
    // to the domain `{ storagePubKey }` shape here.
    async findNodePublicKeyByStashAccountId(stash) {
      const value: any = await api.query.DdcStaking.Providers.getValue(stash as any);
      if (value == null) return undefined;
      const k = strOrUndef(value.value ?? value);
      return { storagePubKey: k as StorageNodePublicKey };
    },
  };
}
