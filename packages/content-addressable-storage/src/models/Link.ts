export class Link {
    cid: string;
    size: bigint;
    name: string;

    constructor(cid: string, size: bigint, name = "") {
        this.cid = cid
        this.size = size
        this.name = name
    }
}