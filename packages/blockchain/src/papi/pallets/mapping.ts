import { Binary } from 'polkadot-api';

import { ClusterMember } from '../../types.js';
import type {
  AccountId,
  Cluster,
  ClusterId,
  ClusterNodeKind,
  ClusterParams,
  ClusterProtocolParams,
  ClusterStatus,
  NodePublicKey,
  StorageNode,
  StorageNodeMode,
  StorageNodeProps,
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

/**
 * Domain ClusterMember (+ optional node key) → runtime `DdcClustersGov`
 * member enum. Verified against the live `propose_update_cluster_protocol`/
 * `vote_proposal`/`close_proposal` arg types (`AnonymousEnum<{ ClusterManager:
 * undefined; NodeProvider: AnonymousEnum<{ StoragePubKey: SS58String }> }>`):
 * `ClusterManager` is a bare unit variant, and `NodeProvider`'s value is the
 * SAME `{ StoragePubKey: ... }` sub-enum as `storagePubKey()` builds for
 * `DdcClusters` node keys — not a bare key — so this reuses that helper.
 */
export function buildClusterMember(member: ClusterMember, nodePublicKey?: NodePublicKey) {
  if (member === ClusterMember.ClusterManager) {
    return { type: 'ClusterManager' as const };
  }
  if (!nodePublicKey) {
    throw new Error('Node public key is required to create a NodeProvider cluster member.');
  }
  return { type: 'NodeProvider' as const, value: storagePubKey(nodePublicKey) };
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
/**
 * DdcNodes.StorageNodes value → StorageNode.
 *
 * Verified against a live devnet probe: `pub_key`/`provider_id` decode as
 * BARE SS58 strings — the `NodePubKey` enum wrapping (`{ type:
 * 'StoragePubKey', value }`, see `storagePubKey()` above) only appears on
 * the `create_node`/`set_node_params`/`delete_node` TX ARGS, not on this
 * storage value or its key (the legacy pallet queried `storageNodes` with a
 * bare key too — `findStorageNodeByPublicKey` in `nodes.ts` does the same).
 * `cluster_id` decodes as a bare `0x…` hex string or `undefined` (no
 * `Option` wrapper to unwrap). `props` decodes as the bare `StorageParams`
 * struct — no enum wrapper on the READ side (unlike the write side, see
 * `buildStorageNodeParams`) — and `host`/`domain` decode to raw
 * `Uint8Array`, NOT hex: probe observed
 * `host = Uint8Array[49,55,56,...] → "178.251.228.165"`,
 * `domain = Uint8Array[...] → "storage-7.devnet.ddc-dragon.com"`. `Binary`
 * is a static-function bag (task 1-4 finding, no `.asHex()`/`.asText()`
 * instance methods in papi 2.1.8), so `Binary.toText` is the papi-native
 * inverse.
 */
export function toStorageNode(value: any): StorageNode {
  const p = value.props?.value ?? value.props;
  return {
    pubKey: hex(value.pub_key) as StorageNode['pubKey'],
    providerId: hex(value.provider_id) as StorageNode['providerId'],
    clusterId: value.cluster_id == null ? null : (hex(value.cluster_id) as StorageNode['clusterId']),
    props: {
      host: Binary.toText(p.host),
      domain: Binary.toText(p.domain),
      ssl: !!p.ssl,
      httpPort: Number(p.http_port),
      grpcPort: Number(p.grpc_port),
      p2pPort: Number(p.p2p_port),
      mode: (typeof p.mode === 'string' ? p.mode : p.mode?.type) as StorageNodeMode,
    },
  };
}

/**
 * Domain StorageNodeProps → runtime `create_node`/`set_node_params`
 * `node_params` arg. Unlike the read side, the write side DOES need the
 * `StorageParams` enum wrapper (verified against the live TX arg type:
 * `node_params: Enum<{ StorageParams: {...} }>`). `host`/`domain` encode via
 * `Binary.fromText` (inverse of `toStorageNode`'s `Binary.toText`); `domain`
 * is optional on the domain type but mandatory on the wire, so it's
 * defaulted to `''` (task 3 lesson: never let an optional domain field hit
 * the codec as `undefined`).
 */
export function buildStorageNodeParams(props: StorageNodeProps) {
  return {
    type: 'StorageParams' as const,
    value: {
      host: Binary.fromText(props.host),
      domain: Binary.fromText(props.domain ?? ''),
      ssl: props.ssl ?? false,
      http_port: props.httpPort,
      grpc_port: props.grpcPort,
      p2p_port: props.p2pPort,
      mode: { type: props.mode },
    },
  };
}

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
