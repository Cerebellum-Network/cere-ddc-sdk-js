import {Tag} from "./Tag.js";

export class Query {
  bucketId: bigint;
  tags: Array<Tag>;
  skipData: boolean;

  constructor(bucketId: bigint, tags: Array<Tag>, skipData: boolean = false) {
    this.bucketId = bucketId;
    this.tags = tags;
    this.skipData = skipData;
  }
}
