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
        const nodeUrl = this.search?.nodeUrl || this.options.fallbackNodeUrl;

        if (!nodeUrl) {
            throw new Error(`nodeUrl is not in routing data for search request`);
        }

        return nodeUrl;
    }

    get searchSessionId() {
        const sessionId = this.search?.sessionId || this.options.fallbackSessionId;

        if (!sessionId) {
            throw new Error(`sessionId is not in routing data for search request`);
        }

        return sessionId;
    }

    get searchWorkerAddress() {
        const workerAddress = this.search?.workerAddress || this.options.fallbackWorkerAddress;

        if (!workerAddress) {
            throw new Error(`workerAddress is not in routing data for search request`);
        }

        return workerAddress;
    }

    getNodeUrl(cid: string) {
        const nodeUrl = this.getPieceRoute(cid)?.nodeUrl || this.options.fallbackNodeUrl;

        if (!nodeUrl) {
            throw new Error(`nodeUrl is not in routing data for CID=${cid}`);
        }

        return nodeUrl;
    }

    getSessionId(cid: string) {
        const sessionId = this.getPieceRoute(cid)?.sessionId || this.options.fallbackSessionId;

        if (!sessionId) {
            throw new Error(`sessionId is not in routing data for CID=${cid}`);
        }

        return sessionId;
    }

    getWorkerAddress(cid: string) {
        const workerAddress = this.getPieceRoute(cid)?.workerAddress || this.options.fallbackWorkerAddress;

        if (!workerAddress) {
            throw new Error(`workerAddress is not in routing data for CID=${cid}`);
        }

        return workerAddress;
    }

    isLastPiece(cid: string) {
        return this.getPieceRouteIndex(cid) === this.pieces.length - 1;
    }
}
