export class BucketCreatedEvent {
    bucketId: bigint

    constructor(bucketId: bigint) {
        this.bucketId = bucketId;
    }
}