import { HexString } from '@polkadot/util/types';

export type ClusterId = HexString;
export type ClusterParams = {
  readonly nodeProviderAuthContract?: AccountId | null;
  readonly erasureCodingRequired: number;
  readonly erasureCodingTotal: number;
  readonly replicationTotal: number;
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
  readonly unitPerMbStored: Amount;
  readonly unitPerMbStreamed: Amount;
  readonly unitPerPutRequest: Amount;
  readonly unitPerGetRequest: Amount;
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
