export type ClusterId = number;
export type BucketId = number;
export type AccountId = string;
export type NodeId = number;
export type Resource = number;
export type VNode = bigint[];
export type Balance = bigint;

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

export type BucketParams = {
    replication: number;
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
    params: string;
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
    params: string;
    writerIds: AccountId[];
    readerIds: AccountId[];
    rentCoveredUntilMs: bigint;
};
