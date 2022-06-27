export class BucketParams {
    replication: number;

    constructor(replication: number = 1) {
        this.replication = replication;
    }
}

const MAX_REPLICATION = 3;
const defaultBucketParams = new BucketParams();

export function initDefaultBucketParams(bucketParams: BucketParams): BucketParams {
    //ToDo temporary limits
    if (bucketParams.replication > MAX_REPLICATION) {
        throw new Error(`Exceed bucket limits: ${JSON.stringify(bucketParams)}`)
    } else if (bucketParams.replication <= 0 ) {
        throw new Error(`Invalid bucket params: ${JSON.stringify(bucketParams)}`);
    }

    return {
        replication: !bucketParams.replication ? defaultBucketParams.replication : bucketParams.replication | 0
    }
}