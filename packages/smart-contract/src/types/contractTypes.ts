export type ClusterId = number;
export type BucketId = bigint;
export type AccountId = string;
export type NodeId = number;
export type Resource = bigint;
export type VNode = bigint[];
export type Balance = bigint;
export type Params = string;
export type Offset = number;

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
    url: string;
};

export type ClusterParams = {
    replicationFactor?: number;
};

export type CdnNodeParams = {
    url: string;
    size: number;
    location: string;
    publicKey: string;
};

export type Cluster = {
    managerId: AccountId;
    resourcePerVnode: Resource;
    resourceUsed: Resource;
    revenues: Balance;
    nodeIds: NodeId[];
    vNodes: VNode[];
    totalRent: Balance;
};

export type ClusterStatus = {
    clusterId: ClusterId;
    params: Params;
    cluster: Cluster;
};

export type CdnCluster = {
    managerId: AccountId;
    cdnNodes: NodeId[];
    resourcesUsed: Resource;
    revenues: Balance;
    usdPerGb: Balance;
};

export type CdnClusterStatus = {
    clusterId: ClusterId;
    cluster: CdnCluster;
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
    nodeId: NodeId;
    node: Node;
    params: Params;
};

export type CdnNode = {
    providerId: AccountId;
    undistributedPayment: Balance;
};

export type CdnNodeStatus = {
    nodeId: NodeId;
    node: CdnNode;
    params: Params;
};
