import {Tag} from "./Tag";

export class Query {
  bucketId: bigint;
  tags: Array<Tag>;
  loadData: boolean;

  constructor(bucketId: bigint, tags: Array<Tag>, loadData: boolean = false) {
    this.bucketId = bucketId;
    this.tags = tags;
    this.loadData = loadData;
  }
}
