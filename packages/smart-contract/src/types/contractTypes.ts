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

export enum NodeTag {
    UNKNOWN = 'UNKNOWN',
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
    status?: string;
};

export type CdnNodeParams = {
    url?: string;
    size?: number;
    location?: string;
};

export type Cluster = {
    managerId: AccountId;
    clusterParams: Params;
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
    clusterVNodes: VNodeId[];
};

export type Account = {
    deposit: Cash;
    bonded: Cash;
    negative: Cash;
    unbondedAmount: Cash;
    unbonded_timestamp: bigint;
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
    params: Params;
    writerIds: AccountId[];
    readerIds: AccountId[];
    rentCoveredUntilMs: Balance;
};

export type Node = {
    providerId: AccountId;
    rentPerMonth: Balance;
    freeResource: Resource;
    nodeTag: NodeTag;
};

export type NodeStatus = {
    nodeId: NodeKey;
    node: Node;
    params: Params;
};

export type CdnNode = {
    providerId: AccountId;
    undistributedPayment: Balance;
};

export type CdnNodeStatus = {
    nodeId: NodeKey;
    node: CdnNode;
    params: Params;
};

/**
 * Converts Codec instance to primitive js representation
 *
 * TODO: figure out how to auto-map u64 to bigint instead of hex string
 */
export const toJs = (codec: Codec) => {
    return codec.toJSON();
};
