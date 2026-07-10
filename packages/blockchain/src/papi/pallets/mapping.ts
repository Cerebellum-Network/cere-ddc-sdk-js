import { Binary } from 'polkadot-api';

import type {
  AccountId,
  Cluster,
  ClusterId,
  ClusterNodeKind,
  ClusterParams,
  ClusterProtocolParams,
  ClusterStatus,
  StorageNodePublicKey,
} from '../../types.js';

/**
 * Normalize a decoded chain value to a `0x…` hex / SS58 string.
 *
 * Verified against a live devnet probe (see task-3-report.md): `DdcClusters`
 * account/cluster-id/node-key fields decode as plain strings (`SizedHex<N>`
 * is `string & {...}` at the type level; account fields are `SS58String`) —
 * there is no `FixedSizeBinary`/`Uint8Array` anywhere in this pallet today.
 * This helper stays defensive for pallets/fields that do decode as raw bytes
 * (papi 2.1.8 has no `.asHex()` instance method — only the `Binary.toHex`
 * static helper converts a `Uint8Array`).
 */
const hex = (v: any): string => {
  if (typeof v === 'string') return v;
  if (v instanceof Uint8Array) return Binary.toHex(v);
  return v?.asHex?.() ?? v;
};

/** DdcClusters.Clusters value (+ its storage key) → Cluster. */
export function toCluster(clusterId: any, value: any): Cluster {
  return {
    clusterId: hex(clusterId) as ClusterId,
    managerId: hex(value.manager_id) as AccountId,
    reserveId: hex(value.reserve_id) as AccountId,
    status: (typeof value.status === 'string' ? value.status : value.status?.type) as ClusterStatus,
    lastPaidEra: value.last_paid_era == null ? undefined : Number(value.last_paid_era),
    props: {
      nodeProviderAuthContract:
        value.props?.node_provider_auth_contract == null ? null : hex(value.props.node_provider_auth_contract),
      erasureCodingRequired: Number(value.props.erasure_coding_required),
      erasureCodingTotal: Number(value.props.erasure_coding_total),
      replicationTotal: Number(value.props.replication_total),
    },
  };
}

/**
 * DdcClusters.ClustersGovParams value → ClusterProtocolParams (Amount = bigint, shares = number).
 *
 * Cross-shape read tolerance: devnet/testnet's runtime (descriptor
 * `I883b57s89bnhm`) types the four core cost fields as `cost_per_mb_stored`/
 * `cost_per_mb_streamed`/`cost_per_put_request`/`cost_per_get_request` and
 * adds gpu/cpu/ram + `customer_deposit_contract`. Mainnet's shipped
 * descriptor (`Idk8g9jf3hucr8`) still types the SAME storage item with the
 * older `unit_per_mb_stored`/`unit_per_mb_streamed`/`unit_per_put_request`/
 * `unit_per_get_request` names and has none of the newer fields. Fall back
 * to the old names so a mainnet read degrades gracefully (optional domain
 * fields become `undefined`) instead of throwing `BigInt(undefined)`.
 */
export function toClusterProtocolParams(v: any): ClusterProtocolParams {
  const mbStored = v.cost_per_mb_stored ?? v.unit_per_mb_stored;
  const mbStreamed = v.cost_per_mb_streamed ?? v.unit_per_mb_streamed;
  const putRequest = v.cost_per_put_request ?? v.unit_per_put_request;
  const getRequest = v.cost_per_get_request ?? v.unit_per_get_request;
  return {
    treasuryShare: Number(v.treasury_share),
    validatorsShare: Number(v.validators_share),
    clusterReserveShare: Number(v.cluster_reserve_share),
    storageBondSize: v.storage_bond_size == null ? 0n : BigInt(v.storage_bond_size),
    storageChillDelay: Number(v.storage_chill_delay),
    storageUnbondingDelay: Number(v.storage_unbonding_delay),
    costPerMbStored: BigInt(mbStored ?? 0),
    costPerMbStreamed: BigInt(mbStreamed ?? 0),
    costPerPutRequest: BigInt(putRequest ?? 0),
    costPerGetRequest: BigInt(getRequest ?? 0),
    costPerGpuUnit: v.cost_per_gpu_unit == null ? undefined : BigInt(v.cost_per_gpu_unit),
    costPerCpuUnit: v.cost_per_cpu_unit == null ? undefined : BigInt(v.cost_per_cpu_unit),
    costPerRamUnit: v.cost_per_ram_unit == null ? undefined : BigInt(v.cost_per_ram_unit),
    customerDepositContract:
      v.customer_deposit_contract == null ? null : (hex(v.customer_deposit_contract) as AccountId),
  };
}

/**
 * Wrap a storage node key in the runtime's NodePubKey enum variant. Verified
 * against the live `ClustersNodes` key + `add_node`/`remove_node` arg types
 * (`AnonymousEnum<{ StoragePubKey: SS58String }>`): the value is a plain
 * SS58 address string, not `Binary`/`FixedSizeBinary` — no wrapping needed.
 */
export function storagePubKey(key: StorageNodePublicKey) {
  return { type: 'StoragePubKey' as const, value: key };
}

/** Domain ClusterNodeKind → runtime enum variant. */
export function clusterNodeKind(kind: ClusterNodeKind) {
  return { type: kind } as { type: ClusterNodeKind };
}

/** Domain cluster params (+ the legacy defaults) → runtime create_cluster/set_cluster_params arg. */
export function buildClusterParams(params: Partial<ClusterParams>) {
  const merged: ClusterParams = {
    nodeProviderAuthContract: null,
    erasureCodingRequired: 16,
    erasureCodingTotal: 48,
    replicationTotal: 20,
    ...params,
  };
  return {
    node_provider_auth_contract: merged.nodeProviderAuthContract ?? undefined,
    erasure_coding_required: merged.erasureCodingRequired,
    erasure_coding_total: merged.erasureCodingTotal,
    replication_total: merged.replicationTotal,
  };
}

/**
 * Domain protocol params → runtime protocol-params arg (inverse of
 * toClusterProtocolParams). NOTE: `treasury_share`/`validators_share`/
 * `cluster_reserve_share` are `Perquintill` (u64) on the wire — the generated
 * papi codec requires an actual `bigint` there (verified live: passing the
 * domain `number` fails papi's structural value-compat check with
 * "Incompatible runtime entry Tx(DdcClusters.create_cluster)", even though
 * `assertCompatible` reports the call itself as compatible). The domain type
 * (`ClusterProtocolParams`/`PartsBerBillion = number`, in `types.ts`, reused
 * as-is) keeps the legacy `number` shape, so convert here on the way out.
 *
 * WRITE-PATH LIMITATION: this emits the current devnet/testnet `cost_per_*`
 * + mandatory `customer_deposit_contract` shape (descriptor `I883b57s89bnhm`).
 * Mainnet's shipped runtime still types this storage item with the older
 * `unit_per_*` shape (descriptor `Idk8g9jf3hucr8`: no gpu/cpu/ram, no
 * `customer_deposit_contract`) — writing against that runtime is NOT
 * supported here and is deferred to the testnet/mainnet compat backlog (2b
 * tests run on devnet only).
 */
export function buildProtocolParams(p: ClusterProtocolParams) {
  if (p.customerDepositContract == null) {
    throw new Error('customerDepositContract is required to build ClusterProtocolParams for this runtime');
  }
  return {
    treasury_share: BigInt(p.treasuryShare),
    validators_share: BigInt(p.validatorsShare),
    cluster_reserve_share: BigInt(p.clusterReserveShare),
    storage_bond_size: p.storageBondSize,
    storage_chill_delay: p.storageChillDelay,
    storage_unbonding_delay: p.storageUnbondingDelay,
    cost_per_mb_stored: p.costPerMbStored,
    cost_per_mb_streamed: p.costPerMbStreamed,
    cost_per_put_request: p.costPerPutRequest,
    cost_per_get_request: p.costPerGetRequest,
    cost_per_gpu_unit: BigInt(p.costPerGpuUnit ?? 0),
    cost_per_cpu_unit: BigInt(p.costPerCpuUnit ?? 0),
    cost_per_ram_unit: BigInt(p.costPerRamUnit ?? 0),
    customer_deposit_contract: p.customerDepositContract,
  };
}
