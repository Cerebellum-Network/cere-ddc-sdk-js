import {Tag} from "./Tag";

export class Query {
  bucketId: bigint;
  tags: Array<Tag>;

  constructor(bucketId: bigint, tags: Array<Tag>) {
    this.bucketId = bucketId;
    this.tags = tags;
  }
}
