export class Link {
    constructor(
        readonly cid: string,
        readonly size: bigint = 0n,
        readonly name: string = ""
    ) {
    }
}
