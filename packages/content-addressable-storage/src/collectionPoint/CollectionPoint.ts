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

    private async request(path: string, request: SignedAck) {
        const baseUrl = this.options.serviceUrl.replace(/\/+$/, '') + '/';
        const body = JSON.stringify(request, null, 2);
        const response = await fetch(new URL(path, baseUrl), {
            body,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            const error = JSON.stringify(await response.json(), null, 2);

            throw new Error(`Collection point request(/${path}):\n${body}\n\nFailed with error:\n${error}`);
        }
    }

    private async unsafeAcknowledgePiece(piece: Piece, route: Route, options: AcknowledgePieceOptions) {
        const cid = options.cid || piece.cid;

        if (!cid) {
            throw new Error('Cannot acknowledge piece with unknown CID');
        }

        const bytesProcessed =
            !options.bytesProcessed && options.bucketId !== undefined
                ? PbPiece.toBinary(piece.toProto(options.bucketId)).byteLength
                : options.bytesProcessed;

        if (!bytesProcessed) {
            throw new Error('Cannot calculate processed bytes length');
        }

        const signedAck = await this.signAck({
            cid,
            bytesProcessed,
            workerAddress: route.getWorkerAddress(cid),
            sessionId: route.getSessionId(cid),
            timestamp: Date.now(),
            opCode: route.operation,
            requestId: route.requestId,
            ackCode: route.isLastPiece(cid) ? AckCode.FINAL : AckCode.NEXT,
        });

        return this.request('acknowledgment', signedAck);
    }

    async acknowledgePiece(piece: Piece, route: Route, options: AcknowledgePieceOptions) {
        try {
            await this.unsafeAcknowledgePiece(piece, route, options);
        } catch (error) {
            console.warn(error instanceof Error ? error.message : error);
        }
    }
}
