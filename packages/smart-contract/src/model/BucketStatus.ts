import {BucketParams} from "../options/BucketParams";

export class BucketStatus {
    constructor(
        readonly bucket_id: number,
        readonly bucket: Bucket,
        readonly params: BucketParams,
        readonly writer_ids: Array<string>,
        readonly rent_covered_until_ms: string
    ) {
    }
}

export class Bucket {
    constructor(
        readonly owner_id: string,
        readonly cluster_id: number,
        readonly resource_reserved: number
    ) {
    }
}