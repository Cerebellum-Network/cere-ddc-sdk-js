export class BucketParams {
    replication: number;
    resource: number; // Resource reservation in GB

    constructor(replication: number = 1, resource: number = 1) {
        this.replication = replication;
        this.resource = resource;
    }
}

const MAX_REPLICATION = 3;
const MAX_RESOURCE = 5;
const defaultBucketParams = new BucketParams();

export function initDefaultBucketParams(bucketParams: BucketParams): BucketParams {
    //ToDo temporary limits
    if (bucketParams.resource > MAX_RESOURCE || bucketParams.replication > MAX_REPLICATION) {
        throw new Error(`Exceed bucket limits: ${JSON.stringify(bucketParams)}`)
    } else if (bucketParams.replication <= 0 || bucketParams.resource <= 0) {
        throw new Error(`Invalid bucket params: ${JSON.stringify(bucketParams)}`);
    }

    return {
        replication: !bucketParams.replication ? defaultBucketParams.replication : bucketParams.replication | 0,
        resource: !bucketParams.resource ? defaultBucketParams.resource : bucketParams.resource
    }
}