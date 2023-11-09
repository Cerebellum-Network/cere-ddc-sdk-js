import {HexString} from '@polkadot/util/types';

export type ClusterId = HexString;
export type ClusterProps = {
    readonly params: string;
    readonly nodeProviderAuthContract: AccountId;
};
export type Cluster = /*PalletDdcClustersCluster;*/ {
    readonly clusterId: ClusterId;
    readonly managerId: AccountId;
    readonly props: ClusterProps;
};

export type BucketId = number;
export type Bucket = /*PalletDdcCustomersBucket;*/ {
    readonly bucketId: BucketId;
    readonly ownerId: AccountId;
    readonly clusterId: ClusterId | null | undefined;
    readonly publicAvailability: boolean;
    readonly resourcesReserved: bigint;
};
export type AccountId = string;
export type StakingInfo = /*PalletDdcCustomersAccountsLedger;*/ {
    readonly owner: AccountId;
    readonly total: bigint;
    readonly active: bigint;
};

export type NodePublicKey = string;
export type CdnNodePublicKey = NodePublicKey;
export type StorageNodePublicKey = NodePublicKey;
export type NodeParams = string;
export type CdnNodeParams = NodeParams;
export type StorageNodeParams = {grpcUrl: string};
export type CdnNode = /*PalletDdcNodesCdnNode;*/ {
    readonly pubKey: CdnNodePublicKey;
    readonly providerId: AccountId;
    readonly clusterId: ClusterId;
    readonly props: {
        readonly params: CdnNodeParams;
    };
};
export type StorageNode = /*PalletDdcNodesStorageNode;*/ {
    readonly pubKey: StorageNodePublicKey;
    readonly providerId: AccountId;
    readonly clusterId: ClusterId;
    readonly props: {
        params: StorageNodeParams;
    };
};

export type Amount = bigint;
