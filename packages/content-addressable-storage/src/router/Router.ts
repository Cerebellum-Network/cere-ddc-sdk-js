import {v4 as uuid} from 'uuid';
import {BucketId, ClusterId} from '@cere-ddc-sdk/smart-contract/types';
import {stringToU8a, u8aToHex, u8aConcat} from '@polkadot/util';
import {CidBuilder, SchemeInterface} from '@cere-ddc-sdk/core';
import {PieceUri} from '../models/PieceUri';
import {Route} from './Route';

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
    cidBuilder?: CidBuilder;
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
    private cidBuilder: CidBuilder;
    private signer: SchemeInterface;

    constructor(private clusterId: ClusterId, private options: RouterOptions) {
        this.cidBuilder = options.cidBuilder || new CidBuilder();
        this.signer = options.signer;
    }

    private async signRequest(request: UnsignedRequest) {
        const sigData = u8aConcat(request.cid, request.requestId, request.timestamp.toString());
        const cid = await this.cidBuilder.build(sigData);
        const signature = await this.signer.sign(stringToU8a(`<Bytes>${cid}</Bytes>`));
        const signedRequest: SignedRequest = {
            ...request,
            userSignature: u8aToHex(signature),
        };

        return signedRequest;
    }

    private createRequest(uri: PieceUri) {
        return this.signRequest({
            clusterId: this.clusterId,
            cid: uri.cid,
            bucketId: uri.bucketId,
            requestId: uuid(),
            timestamp: Date.now(),
            userAddress: this.signer.address,
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
