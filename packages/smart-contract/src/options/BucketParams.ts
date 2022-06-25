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

export function initDefaultOptions(bucketParams: BucketParams): BucketParams {
    //ToDo temporary limits
    if (bucketParams.resource > MAX_RESOURCE || bucketParams.replication > MAX_REPLICATION) {
        throw new Error(`Exceed bucket limits: ${bucketParams}`)
    } else if (!bucketParams.replication || !bucketParams.resource) {
        throw new Error(`Invalid bucket params: ${bucketParams}`);
    }

    return {
        replication: bucketParams.replication < 0 ? defaultBucketParams.replication : bucketParams.replication | 0,
        resource: bucketParams.resource < 0 ? defaultBucketParams.resource : bucketParams.resource
    }
}