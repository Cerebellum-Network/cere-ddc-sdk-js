import {CidBuilder, SchemeInterface} from '@cere-ddc-sdk/core';
import {stringToU8a, u8aConcat, u8aToHex} from '@polkadot/util';
import {Piece as PbPiece} from '@cere-ddc-sdk/proto';

import {Route, RouteOperation} from '../router';
import {Piece} from '../models/Piece';
import {BucketId} from '@cere-ddc-sdk/smart-contract/types';

export type CollectionPointOptions = {
    cidBuilder?: CidBuilder;
    signer: SchemeInterface;
    serviceUrl: string;
};

enum AckCode {
    NEXT = 0,
    FINAL = 1,
    CANCEL = 2,
}

type UnsignedAck = {
    cid: string;
    sessionId: string;
    requestId: string;
    bytesProcessed: number;
    opCode: RouteOperation;
    ackCode: AckCode;
    workerAddress: string;
    timestamp: number;
};

type SignedAck = UnsignedAck & {
    userAddress: string;
    userSignature: string;
};

type AcknowledgePieceOptions = {
    cid?: string;
    bucketId?: BucketId;
    bytesProcessed?: number;
};

export class CollectionPoint {
    private cidBuilder: CidBuilder;
    private signer: SchemeInterface;

    constructor(private options: CollectionPointOptions) {
        this.cidBuilder = options.cidBuilder || new CidBuilder();
        this.signer = options.signer;
    }

    private async signAck(ack: UnsignedAck) {
        const sigData = [ack.cid, ack.sessionId, ack.requestId, ack.timestamp.toString()];

        const cid = await this.cidBuilder.build(u8aConcat(...sigData));
        const signature = await this.signer.sign(stringToU8a(cid));
        const signedRequest: SignedAck = {
            ...ack,
            userSignature: u8aToHex(signature),
            userAddress: this.signer.address,
        };

        return signedRequest;
    }

    private async request(path: string, body: SignedAck) {
        const baseUrl = this.options.serviceUrl.replace(/\/+$/, '') + '/';
        const response = await fetch(new URL(path, baseUrl), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const payload = await response.json();

            throw new Error(
                [`Collection Ponit request failed (/${path}):`, JSON.stringify(payload, null, 2)].join('\n'),
            );
        }
    }

    private async unsafeAcknowledgePiece(piece: Piece, route: Route, options: AcknowledgePieceOptions) {
        const cid = options.cid || piece.cid;

        if (!cid) {
            throw new Error('Cannot acknowledge piece with unknown CID');
        }

        const bytesProcessed = options.bucketId
            ? PbPiece.toBinary(piece.toProto(options.bucketId)).byteLength
            : options.bytesProcessed;

        if (!bytesProcessed) {
            throw new Error('Cannot calculate processed bytes length');
        }

        const isSearchResult = route.operation === RouteOperation.SEARCH;

        /**
         * Use READ operation code in case of search result
         */
        const opCode = isSearchResult ? RouteOperation.READ : route.operation;

        /**
         * Use search worker address in case of search result
         */
        const workerAddress = isSearchResult ? route.searchWorkerAddress : route.getWorkerAddress(cid);

        /**
         * Use search seassionId in case of search result
         */
        const sessionId = isSearchResult ? route.searchSessionId : route.getSessionId(cid);

        /**
         * Search result pieces are separate jobs so always last
         */
        const isLast = isSearchResult || route.isLastPiece(cid);

        const signedAck = await this.signAck({
            cid,
            opCode,
            bytesProcessed,
            workerAddress,
            sessionId,
            timestamp: Date.now(),
            requestId: route.requestId,
            ackCode: isLast ? AckCode.FINAL : AckCode.NEXT,
        });

        return this.request('acknowledgment', signedAck);
    }

    async acknowledgePiece(piece: Piece, route: Route, options: AcknowledgePieceOptions) {
        try {
            return this.unsafeAcknowledgePiece(piece, route, options);
        } catch (error) {
            console.warn(error instanceof Error ? error.message : error);
        }
    }
}
