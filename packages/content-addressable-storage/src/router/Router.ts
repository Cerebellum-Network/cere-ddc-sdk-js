import {v4 as uuid} from 'uuid';
import {BucketId, ClusterId} from '@cere-ddc-sdk/smart-contract/types';
import {stringToU8a, u8aToHex, u8aConcat} from '@polkadot/util';
import {CidBuilder, SchemeInterface} from '@cere-ddc-sdk/core';
import {PieceUri} from '../models/PieceUri';
import {Route, PieceRouting, RouteOperation} from './Route';
import {Link} from '../models/Link';
import {RouterInterface} from './types';

type UnsignedRequest = {
    opCode: RouteOperation;
    requestId: string;
    clusterId: ClusterId;
    bucketId: BucketId;
    userAddress: string;
    timestamp: number;
    cid?: string;
    chunks?: Link[];
};

type SignedRequest = UnsignedRequest & {
    userSignature: string;
};

type PiecesRoutingResponse = {
    requestId: string;
    routing: PieceRouting[];
};

type SearchRoutingResponse = {
    requestId: string;
    routing: Omit<PieceRouting, 'cid'>;
};

export type RouteParams = {
    clusterId: ClusterId;
    uri: PieceUri;
};

export type RouterOptions = {
    cidBuilder?: CidBuilder;
    signer: SchemeInterface;
    serviceUrl: string;
};

export class Router implements RouterInterface {
    private cidBuilder: CidBuilder;
    private signer: SchemeInterface;

    constructor(private clusterId: ClusterId, private options: RouterOptions) {
        this.cidBuilder = options.cidBuilder || new CidBuilder();
        this.signer = options.signer;
    }

    private async createRequest(
        request: Omit<UnsignedRequest, 'requestId' | 'clusterId' | 'timestamp' | 'userAddress'>,
    ) {
        return this.signRequest({
            ...request,
            clusterId: this.clusterId,
            requestId: uuid(),
            timestamp: Date.now(),
            userAddress: this.signer.address,
        });
    }

    private async signRequest(request: UnsignedRequest) {
        let sigData = [request.requestId, request.timestamp.toString()];

        if (request.cid) {
            sigData = [request.cid, ...sigData];
        }

        const cid = await this.cidBuilder.build(u8aConcat(...sigData));
        const signature = await this.signer.sign(stringToU8a(`<Bytes>${cid}</Bytes>`));
        const signedRequest: SignedRequest = {
            ...request,
            userSignature: u8aToHex(signature),
        };

        return signedRequest;
    }

    private async getPiecesRoute(opCode: RouteOperation, uri: PieceUri, chunks?: Link[]) {
        const request = await this.createRequest({
            opCode,
            chunks,
            cid: uri.cid,
            bucketId: uri.bucketId,
        });

        const {requestId, routing} = await this.requestPiecesRouting(request);

        return new Route(requestId, RouteOperation.READ, {
            pieces: routing,
        });
    }

    async getSearchRoute(bucketId: PieceUri['bucketId']) {
        const request = await this.createRequest({
            bucketId,
            opCode: RouteOperation.SEARCH,
        });

        const {requestId, routing} = await this.requestSearchRouting(request);

        return new Route(requestId, RouteOperation.SEARCH, {
            search: routing,
        });
    }

    async getReadRoute(uri: PieceUri) {
        return this.getPiecesRoute(RouteOperation.READ, uri);
    }

    async getStoreRoute(uri: PieceUri, links: Link[]) {
        return this.getPiecesRoute(RouteOperation.STORE, uri, links);
    }

    private async requestPiecesRouting(request: SignedRequest): Promise<PiecesRoutingResponse> {
        const path = request.opCode === RouteOperation.STORE ? '/write-resource-metadata' : '/read-resource-metadata';

        return this.request(path, request);
    }

    private async requestSearchRouting(request: SignedRequest): Promise<SearchRoutingResponse> {
        return this.request('/search-metadata', request);
    }

    private async request<T>(path: string, body: SignedRequest): Promise<T> {
        const response = await fetch(new URL(path, this.options.serviceUrl), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(body, (key, value) => {
                return typeof value === 'bigint' ? value.toString() : value;
            }),
        });

        return response.json();
    }
}
