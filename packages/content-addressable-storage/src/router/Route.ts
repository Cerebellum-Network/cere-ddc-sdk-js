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
    fallbackNodeUrl?: string;
    fallbackSessionId?: string;
};

export class Route {
    private readonly pieces: PieceRouting[];
    private readonly search?: SearchRouting;

    constructor(readonly requestId: string, private options: RouteOptions) {
        this.pieces = options.pieces || [];
        this.search = options.search;
    }

    private get fallbackNodeUrl() {
        if (!this.options.fallbackNodeUrl) {
            throw new Error('Fallback node url was not provided');
        }

        return this.options.fallbackNodeUrl;
    }

    private get fallbackSessionId() {
        if (!this.options.fallbackSessionId) {
            throw new Error('Fallback node url was not provided');
        }

        return this.options.fallbackSessionId;
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
        return this.search?.nodeUrl || this.fallbackNodeUrl;
    }

    get searchSessionId() {
        if (!this.search) {
            throw new Error(`No search route data`);
        }

        return stringToU8a(this.search.sessionId);
    }

    isLastPiece(cid: string) {
        return this.getPieceRouteIndex(cid) === this.pieces.length - 1;
    }

    getNodeUrl(cid: string) {
        return this.getPieceRoute(cid)?.nodeUrl || this.fallbackNodeUrl;
    }

    getSessionId(cid: string) {
        return stringToU8a(this.getPieceRoute(cid)?.sessionId || this.fallbackSessionId);
    }
}
