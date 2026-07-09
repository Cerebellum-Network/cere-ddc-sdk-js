import { HexString } from '@polkadot/util/types';

export type ClusterId = HexString;
export type ClusterParams = {
  readonly nodeProviderAuthContract?: AccountId | null;
  readonly erasureCodingRequired: number;
  readonly erasureCodingTotal: number;
  readonly replicationTotal: number;
  readonly inspectionDryRunParams?: unknown | null;
};

/**
 * @deprecated Use ClusterParams instead.
 */
export type ClusterProps = ClusterParams;

export enum ClusterStatus {
  Unbonded = 'Unbonded',
  Bonded = 'Bonded',
  Activated = 'Activated',
  Unbonding = 'Unbonding',
}

export type Cluster = {
  readonly clusterId: ClusterId;
  readonly managerId: AccountId;
  readonly reserveId: AccountId;
  readonly props: ClusterParams;
  readonly status: ClusterStatus;
  readonly lastPaidEra?: number;
};

export type PartsBerBillion = number;
export type BlockInterval = number;
export type ClusterProtocolParams = {
  readonly treasuryShare: PartsBerBillion;
  readonly validatorsShare: PartsBerBillion;
  readonly clusterReserveShare: PartsBerBillion;
  readonly storageBondSize: Amount;
  readonly storageChillDelay: BlockInterval;
  readonly storageUnbondingDelay: BlockInterval;
  // NOTE: live runtime (verified against devnet) encodes/decodes these fee fields as
  // costPer* — the previous unitPer* names were silently dropped by polkadot.js Struct
  // encoding (unknown keys are ignored), causing fees to encode as 0 and reads to be
  // undefined.
  readonly costPerMbStored: Amount;
  readonly costPerMbStreamed: Amount;
  readonly costPerPutRequest: Amount;
  readonly costPerGetRequest: Amount;
  readonly costPerGpuUnit?: Amount;
  readonly costPerCpuUnit?: Amount;
  readonly costPerRamUnit?: Amount;
  readonly customerDepositContract?: AccountId | null;
};

/**
 * @deprecated Use ClusterProtocolParams instead.
 */
export type ClusterGovernmentParams = ClusterProtocolParams;

export enum ClusterMember {
  ClusterManager = 'ClusterManager',
  NodeProvider = 'NodeProvider',
}

export type ReferendumIndex = number;

export type BucketId = bigint;
export type BucketParams = {
  isPublic: boolean;
};

export type Bucket = {
  readonly bucketId: BucketId;
  readonly ownerId: AccountId;
  readonly clusterId: ClusterId;
  readonly isPublic: boolean;
  readonly isRemoved: boolean;
};

export type AccountId = string;
export type StakingInfo = {
  readonly owner: AccountId;
  readonly total: bigint;
  readonly active: bigint;
};

export type NodePublicKey = AccountId;
export type StorageNodePublicKey = NodePublicKey;

export enum StorageNodeMode {
  Full = 'Full',
  Storage = 'Storage',
  Cache = 'Cache',
}

export type StorageNodeProps = {
  readonly host: string;
  readonly httpPort: number;
  readonly grpcPort: number;
  readonly p2pPort: number;
  readonly mode: StorageNodeMode;
  readonly domain?: string;
  readonly ssl?: boolean;
};

export type StorageNode = {
  readonly pubKey: StorageNodePublicKey;
  readonly providerId: AccountId;
  readonly clusterId: ClusterId | null | undefined;
  readonly props: StorageNodeProps;
};

export type Amount = bigint;

export type BlockNumber = number;

export type StakingLedger = {
  stash: AccountId;
  total: Amount;
  active: Amount;
  chilling: BlockNumber | undefined | null;
  unlocking: any[];
};

export enum ClusterNodeKind {
  Genesis = 'Genesis',
  External = 'External',
}
