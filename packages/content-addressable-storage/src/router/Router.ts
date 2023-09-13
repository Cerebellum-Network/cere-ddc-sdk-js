import {BucketId, ClusterId} from '@cere-ddc-sdk/smart-contract/types';
import {randomAsU8a} from '@polkadot/util-crypto';
import {stringToU8a, u8aToHex, u8aConcat} from '@polkadot/util';
import {CidBuilder, SchemeInterface} from '@cere-ddc-sdk/core';
import {PieceUri} from '../models/PieceUri';
import {Route} from './Route';

const REQUEST_ID_SIZE = 32;

type UnsignedRequest = {
    requestId: string;
    cid: string;
    clusterId: ClusterId;
    bucketId: BucketId;
    userAddress: string;
    timestamp: number;
};

type SignedRequest = UnsignedRequest & {
    userSignature: string;
};

export type RouteParams = {
    clusterId: ClusterId;
    uri: PieceUri;
};

export type RouterOptions = {
    cidBuilder: CidBuilder;
    signer: SchemeInterface;

    /**
     * Temp options
     *
     * TODO: Remove after the router endpoint is ready
     */
    fallbackNodeUrl: string;
    fallbackSessionId: string;
};

export class Router {
    constructor(private clusterId: ClusterId, private options: RouterOptions) {}

    private createRequestId() {
        return randomAsU8a(REQUEST_ID_SIZE).toString();
    }

    private async signRequest(request: UnsignedRequest) {
        const {cidBuilder, signer} = this.options;

        const cid = await cidBuilder.build(u8aConcat(request.cid, request.requestId, request.timestamp.toString()));
        const signature = await signer.sign(stringToU8a(`<Bytes>${cid}</Bytes>`));

        const signedRequest: SignedRequest = {
            ...request,
            userSignature: u8aToHex(signature),
        };

        return signedRequest;
    }

    private createRequest(uri: PieceUri) {
        const {signer} = this.options;

        return this.signRequest({
            clusterId: this.clusterId,
            cid: uri.cid,
            bucketId: uri.bucketId,
            requestId: this.createRequestId(),
            timestamp: Date.now(),
            userAddress: signer.address,
        });
    }

    async getRoute(uri: PieceUri) {
        const request = await this.createRequest(uri);

        /**
         * TODO: Request router data to create a real route
         */
        return new Route(request.requestId, [
            {
                cid: uri.cid,
                nodeUrl: this.options.fallbackNodeUrl,
                sessionId: this.options.fallbackSessionId,
            },
        ]);
    }
}
