import { HexString } from '@polkadot/util/types';

export type ClusterId = /*H160;*/ HexString;
export type ClusterProps = /*PalletDdcClustersClusterClusterProps;*/ {
  readonly nodeProviderAuthContract?: AccountId | null;
  readonly erasureCodingRequired: number;
  readonly erasureCodingTotal: number;
  readonly replicationTotal: number;
};
export type Cluster = /*PalletDdcClustersCluster;*/ {
  readonly clusterId: ClusterId;
  readonly managerId: AccountId;
  readonly reserveId: AccountId;
  readonly props: ClusterProps;
};
export type PartsBerBillion = /*PerBill*/ number;
export type BlockInterval = number;
export type ClusterGovernmentParams = /*PalletDdcClustersClusterClusterGovParams;*/ {
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

export type BucketId = /*u64;*/ bigint;
export type BucketParams = /*PalletDdcCustomersBucketParams;*/ {
  isPublic: boolean;
};

export type Bucket = /*PalletDdcCustomersBucket;*/ {
  readonly bucketId: BucketId;
  readonly ownerId: AccountId;
  readonly clusterId: ClusterId;
  readonly isPublic: boolean;
  readonly isRemoved: boolean;
};

export type AccountId = /*AccountId32;*/ string;
export type StakingInfo = /*PalletDdcCustomersAccountsLedger;*/ {
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
