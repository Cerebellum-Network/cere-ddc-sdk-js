import {BucketStatus} from "./BucketStatus.js";

export class BucketStatusList {
    bucketStatuses: Array<BucketStatus>;
    length: number;

    constructor(bucketStatuses: Array<BucketStatus>, length: number) {
        this.bucketStatuses = bucketStatuses;
        this.length = length;
    }
}