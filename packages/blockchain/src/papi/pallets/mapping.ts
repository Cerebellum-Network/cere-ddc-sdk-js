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

/** DdcClusters.ClustersGovParams value → ClusterProtocolParams (Amount = bigint, shares = number). */
export function toClusterProtocolParams(v: any): ClusterProtocolParams {
  return {
    treasuryShare: Number(v.treasury_share),
    validatorsShare: Number(v.validators_share),
    clusterReserveShare: Number(v.cluster_reserve_share),
    storageBondSize: BigInt(v.storage_bond_size),
    storageChillDelay: Number(v.storage_chill_delay),
    storageUnbondingDelay: Number(v.storage_unbonding_delay),
    costPerMbStored: BigInt(v.cost_per_mb_stored),
    costPerMbStreamed: BigInt(v.cost_per_mb_streamed),
    costPerPutRequest: BigInt(v.cost_per_put_request),
    costPerGetRequest: BigInt(v.cost_per_get_request),
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
 */
export function buildProtocolParams(p: ClusterProtocolParams) {
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
    cost_per_gpu_unit: p.costPerGpuUnit,
    cost_per_cpu_unit: p.costPerCpuUnit,
    cost_per_ram_unit: p.costPerRamUnit,
    customer_deposit_contract: p.customerDepositContract ?? undefined,
  };
}
