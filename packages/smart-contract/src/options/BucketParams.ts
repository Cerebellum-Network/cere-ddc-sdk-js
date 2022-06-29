export interface BucketParams {
    replication: number;
}

export const DEFAULT_BUCKET_PARAMS: BucketParams = {
    replication: 1
};

const MAX_REPLICATION = 3;

export function initDefaultBucketParams(bucketParams: BucketParams): BucketParams {
    //ToDo temporary limits
    if (bucketParams.replication > MAX_REPLICATION) {
        throw Error(`Exceed bucket limits: ${JSON.stringify(bucketParams)}`)
    } else if (bucketParams.replication <= 0) {
        throw Error(`Invalid bucket params: ${JSON.stringify(bucketParams)}`);
    }

    return {
        replication: !bucketParams.replication ? DEFAULT_BUCKET_PARAMS.replication : bucketParams.replication | 0
    }
}