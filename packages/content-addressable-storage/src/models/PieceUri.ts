export class PieceUri {
    constructor(
        readonly bucketId: bigint,
        readonly cid: string
    ) {
    }

    toString() {
        return "cns://" + this.bucketId + "/" + this.cid;
    }
}
