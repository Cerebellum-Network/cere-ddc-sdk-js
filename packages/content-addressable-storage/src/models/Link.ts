export class Link {
    cid: string;
    size: bigint;
    name: string;

    constructor(cid: string, size: bigint = 0n, name: string = "") {
        this.cid = cid
        this.size = size
        this.name = name
    }
}
