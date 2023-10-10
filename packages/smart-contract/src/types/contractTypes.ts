import {Codec} from '@polkadot/types/types';
export type ClusterId = number;
export type BucketId = bigint;
export type AccountId = string;
export type NodeKey = string;
export type Resource = bigint;
export type VNodeId = bigint;
export type Balance = bigint;
export type Params = string;
export type Offset = bigint;

type Schedule = {
    rate: Balance;
    offset: Balance;
};

type Cash = {
    value: Balance;
};

type Flow = {
    from: AccountId;
    schedule: Schedule;
};

export enum NodeStatusInCluster {
    ACTIVE = 'ACTIVE',
    ADDING = 'ADDING',
    DELETING = 'DELETING',
    OFFLINE = 'OFFLINE',
}

export type BucketParams = {
    replication: number;
};

export type NodeParams = {
    publicKey?: string;
    url?: string;
    email?: string;
    nodeCountryISOCode?: string;
    status?: string;
};

export type ClusterParams = {
    replicationFactor?: number;
    unstakeTime?: number;
    depositSize?: number;
};

export type CdnNodeParams = {
    url?: string;
    size?: number;
    location?: string;
};

export type NodeVNodesInfo = {
    nodeKey: NodeKey;
    vNodes: VNodeId[];
};

export type Cluster = {
    managerId: AccountId;
    clusterParams: ClusterParams;
    nodesKeys: NodeKey[];
    resourcePerVNode: Resource;
    resourceUsed: Resource;
    revenues: Cash;
    totalRent: Balance;
    cdnNodesKeys: NodeKey[];
    cdnRevenues: Cash;
    cdnUsdPerGb: Balance;
};

export type ClusterInfo = {
    clusterId: ClusterId;
    cluster: Cluster;
    clusterVNodes: NodeVNodesInfo[];
};

export type Account = {
    deposit: Cash;
    bonded: Cash;
    negative: Cash;
    unbondedAmount: Cash;
    unbondedTimestamp: bigint;
    payableSchedule: Schedule;
};

export type Bucket = {
    ownerId: AccountId;
    clusterId: ClusterId;
    flow: Flow;
    resourceReserved: Resource;
    publicAvailability: boolean;
    resourceСonsumptionСap: Resource;
};

export type BucketStatus = {
    bucketId: BucketId;
    bucket: Bucket;
    params: BucketParams;
    writerIds: AccountId[];
    readerIds: AccountId[];
    rentCoveredUntilMs: Balance;
};

export type CdnNode = {
    providerId: AccountId;
    undistributedPayment: Balance;
    cdnNodeParams: CdnNodeParams;
    clusterId: ClusterId | null;
    statusInCluster: NodeStatusInCluster | null;
};

export type Node = {
    providerId: AccountId;
    rentVNodePerMonth: Balance;
    freeResource: Resource;
    nodeParams: NodeParams;
    clusterId: ClusterId | null;
    statusInCluster: NodeStatusInCluster | null;
};

export type CdnNodeInfo = {
    cdnNodeKey: NodeKey;
    cdnNode: CdnNode;
};

export type NodeInfo = {
    nodeKey: NodeKey;
    node: Node;
    vNodes: VNodeId[];
};

/**
 * Converts Codec instance to primitive js representation
 *
 * TODO: figure out how to auto-map u64 to bigint instead of hex string
 */
export const toJs = (codec: Codec) => {
    return codec.toJSON();
};
