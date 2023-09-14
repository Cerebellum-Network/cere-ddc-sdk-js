import {stringToU8a} from '@polkadot/util';

export type PieceRoute = {
    cid: string;
    nodeUrl: string;
    sessionId: string;
};

export class Route {
    constructor(readonly requestId: string, readonly pieces: PieceRoute[]) {}

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
