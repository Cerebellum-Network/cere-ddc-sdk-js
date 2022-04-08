export class PieceUri {
  bucketId: bigint;
  cid: string;

  constructor(bucketId: bigint, cid: string) {
    this.bucketId = bucketId;
    this.cid = cid;
  }

  toString() {
    return "cns://" + this.bucketId + "/" + this.cid;
  }
}
