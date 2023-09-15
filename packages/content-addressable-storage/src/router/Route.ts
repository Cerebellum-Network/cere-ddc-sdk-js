import {stringToU8a} from '@polkadot/util';

export type PieceRouting = {
    cid: string;
    nodeUrl: string;
    sessionId: string;
};

export type SearchRouting = {
    nodeUrl: string;
    sessionId: string;
};

export type RouteOptions = {
    pieces?: PieceRouting[];
    search?: SearchRouting;
};

export class Route {
    private readonly pieces: PieceRouting[];
    private readonly search?: SearchRouting;

    constructor(readonly requestId: string, {pieces, search}: RouteOptions) {
        this.pieces = pieces || [];
        this.search = search;
    }

    private getPieceRoute(cid: string) {
        return this.pieces.find((chunk) => chunk.cid === cid);
    }

    private getPieceRouteIndex(cid: string) {
        const chunk = this.getPieceRoute(cid);

        if (!chunk) {
            throw new Error(`Cid ${cid} is note in the route`);
        }

        return this.pieces.indexOf(chunk);
    }

    get searchNodeUrl() {
        return this.search?.nodeUrl;
    }

    get searchSessionId() {
        return this.search?.sessionId && stringToU8a(this.search?.sessionId);
    }

    isLastPiece(cid: string) {
        return this.getPieceRouteIndex(cid) === this.pieces.length - 1;
    }

    getNodeUrl(cid: string) {
        return this.getPieceRoute(cid)?.nodeUrl;
    }

    getSessionId(cid: string) {
        const sessionId = this.getPieceRoute(cid)?.sessionId;

        return sessionId && stringToU8a(sessionId);
    }
}
