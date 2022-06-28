import {BucketParams} from "../options/BucketParams";

export class BucketStatus {
    bucket_id: number;
    bucket: Bucket;
    params: BucketParams;
    writer_ids: Array<string>;
    rent_covered_until_ms: string;

    constructor(bucket_id: number, bucket: Bucket, params: BucketParams, writer_ids: Array<string>, rent_covered_until_ms: string) {
        this.bucket_id = bucket_id;
        this.bucket = bucket;
        this.params = params;
        this.writer_ids = writer_ids;
        this.rent_covered_until_ms = rent_covered_until_ms;
    }
}

export class Bucket {
    owner_id: string;
    cluster_id: number;
    resource_reserved: number;

    constructor(owner_id: string, cluster_id: number, resource_reserved: number) {
        this.owner_id = owner_id;
        this.cluster_id = cluster_id;
        this.resource_reserved = resource_reserved;
    }
}