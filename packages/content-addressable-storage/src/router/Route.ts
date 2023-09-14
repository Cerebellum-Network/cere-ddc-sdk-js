export type RouteChunk = {
    cid: string;
    nodeUrl: string;
    sessionId: string;
};

export class Route {
    constructor(readonly requestId: string, readonly chunks: RouteChunk[]) {}

    private getChunk(cid: string) {
        return this.chunks.find((chunk) => chunk.cid === cid);
    }

    private getChunkIndex(cid: string) {
        const chunk = this.getChunk(cid);

        if (!chunk) {
            throw new Error(`Cid ${cid} is note in the route`);
        }

        return this.chunks.indexOf(chunk);
    }

    isLastChunk(cid: string) {
        return this.getChunkIndex(cid) === this.chunks.length - 1;
    }

    getNodeUrl(cid: string) {
        return this.getChunk(cid)?.nodeUrl;
    }

    getSessionId(cid: string) {
        return this.getChunk(cid)?.sessionId;
    }
}
