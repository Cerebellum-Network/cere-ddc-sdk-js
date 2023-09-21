import {stringToU8a} from '@polkadot/util';

export type PieceRouting = {
    cid: string;
    nodeUrl: string;
    sessionId: string;
    workerAddress: string;
};

export type SearchRouting = Omit<PieceRouting, 'cid'>;

export type RouteOptions = {
    pieces?: PieceRouting[];
    search?: SearchRouting;
    fallbackNodeUrl?: string;
    fallbackSessionId?: string;
    fallbackWorkerAddress?: string;
};

export enum RouteOperation {
    READ = 1,
    STORE = 2,
    SEARCH = 3,
}

export class Route {
    private readonly pieces: PieceRouting[];
    private readonly search?: SearchRouting;

    constructor(readonly requestId: string, readonly operation: RouteOperation, private options: RouteOptions) {
        this.pieces = options.pieces || [];
        this.search = options.search;
    }

    private get fallbackNodeUrl() {
        if (!this.options.fallbackNodeUrl) {
            throw new Error('Node URL was not found in the routing data');
        }

        return this.options.fallbackNodeUrl;
    }

    private get fallbackSessionId() {
        if (!this.options.fallbackSessionId) {
            throw new Error('Session was not found in the routing data');
        }

        return this.options.fallbackSessionId;
    }

    private get fallbackWorkerAddress() {
        if (!this.options.fallbackWorkerAddress) {
            throw new Error('Worker address was not found in the routing data');
        }

        return this.options.fallbackWorkerAddress;
    }

    private getPieceRoute(cid: string) {
        return this.pieces.find((chunk) => chunk.cid === cid);
    }

    private getPieceRouteIndex(cid: string) {
        const chunk = this.getPieceRoute(cid);

        if (!chunk) {
            throw new Error(`Cid ${cid} is not in the routing data`);
        }

        return this.pieces.indexOf(chunk);
    }

    get searchNodeUrl() {
        return this.search?.nodeUrl || this.fallbackNodeUrl;
    }

    get searchSessionId() {
        return this.search?.sessionId || this.fallbackSessionId;
    }

    get searchWorkerAddress() {
        return this.search?.workerAddress || this.fallbackWorkerAddress;
    }

    isLastPiece(cid: string) {
        return this.getPieceRouteIndex(cid) === this.pieces.length - 1;
    }

    getNodeUrl(cid: string) {
        return this.getPieceRoute(cid)?.nodeUrl || this.fallbackNodeUrl;
    }

    getSessionId(cid: string) {
        return this.getPieceRoute(cid)?.sessionId || this.fallbackSessionId;
    }

    getWorkerAddress(cid: string) {
        return this.getPieceRoute(cid)?.workerAddress || this.fallbackWorkerAddress;
    }
}
