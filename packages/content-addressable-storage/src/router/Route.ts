export type RouteChunk = {
    cid: string;
    nodeUrl: string;
    sessionId: string;
};

export class Route {
    constructor(readonly requestId: string, readonly chunks: RouteChunk[]) {}

    private getChunkIndex(cid: string) {
        const index = this.chunks.findIndex((chunk) => chunk.cid === cid);

        if (index < 0) {
            throw new Error(`Cid ${cid} is note in the route`);
        }

        return index;
    }

    getChunk(cid: string) {
        return this.chunks[this.getChunkIndex(cid)];
    }

    isLastChunk(cid: string) {
        return this.getChunkIndex(cid) === this.chunks.length - 1;
    }
}
