import {v4 as uuid} from 'uuid';
import {BucketId, ClusterId} from '@cere-ddc-sdk/smart-contract/types';
import {stringToU8a, u8aToHex, u8aConcat} from '@polkadot/util';
import {CidBuilder, SchemeInterface} from '@cere-ddc-sdk/core';
import {PieceUri} from '../models/PieceUri';
import {Route, PieceRoute} from './Route';
import {Link} from '../models/Link';

type UnsignedRequest = {
    requestId: string;
    cid: string;
    clusterId: ClusterId;
    bucketId: BucketId;
    userAddress: string;
    timestamp: number;
    links: Link[];
};

type SignedRequest = UnsignedRequest & {
    userSignature: string;
};

type Response = {
    requestId: string;
    routing: PieceRoute[];
};

export type RouteParams = {
    clusterId: ClusterId;
    uri: PieceUri;
};

export type RouterOptions = {
    cidBuilder?: CidBuilder;
    signer: SchemeInterface;
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

    private createRequest(uri: PieceUri, links: Link[] = []) {
        return this.signRequest({
            links,
            clusterId: this.clusterId,
            cid: uri.cid,
            bucketId: uri.bucketId,
            requestId: uuid(),
            timestamp: Date.now(),
            userAddress: this.signer.address,
        });
    }

    private async requestRoutingData(request: SignedRequest): Promise<Response> {
        throw new Error('Not implemented');
    }

    async getRoute(uri: PieceUri, links: Link[] = []) {
        const request = await this.createRequest(uri, links);
        const respose = await this.requestRoutingData(request);

        return new Route(respose.requestId, respose.routing);
    }
}
