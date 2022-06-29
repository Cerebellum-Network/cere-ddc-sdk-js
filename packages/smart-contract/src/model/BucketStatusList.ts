import {BucketStatus} from "./BucketStatus.js";

export class BucketStatusList {
    constructor(
        readonly bucketStatuses: Array<BucketStatus>,
        readonly length: number
    ) {
    }
}