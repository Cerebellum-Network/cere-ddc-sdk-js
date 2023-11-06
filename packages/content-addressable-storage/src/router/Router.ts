import {v4 as uuid} from 'uuid';
import {fetch} from 'cross-fetch';
import {Request as PbRequest} from '@cere-ddc-sdk/proto';
import {encode} from 'varint';
import {BucketId, ClusterId} from '@cere-ddc-sdk/smart-contract/types';
import {stringToU8a, u8aToHex, u8aConcat} from '@polkadot/util';
import {CidBuilder, SchemeInterface} from '@cere-ddc-sdk/core';
import {PieceUri} from '../models/PieceUri';
import {Route, PieceRouting, RouteOperation} from './Route';
import {Link} from '../models/Link';
import {RouterInterface} from './types';
import {BASE_PATH_PIECES} from '../constants';
import {concatArrays} from '../lib/concat-arrays';

type UnsignedRequest = {
    opCode: RouteOperation;
    requestId: string;
    clusterId: ClusterId;
    bucketId: BucketId;
    userAddress: string;
    timestamp: number;
    sessionId: string;
    cid?: string;
    chunks?: Link[];
};

type SignedRequest = UnsignedRequest & {
    userSignature: string;
    nodeOperationSignature?: string;
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
        request: Omit<UnsignedRequest, 'requestId' | 'clusterId' | 'timestamp' | 'userAddress' | 'sessionId'>,
    ) {
        return this.signRequest({
            ...request,
            clusterId: this.clusterId,
            requestId: uuid(),
            sessionId: uuid(),
            timestamp: Date.now(),
            userAddress: this.signer.address,
        });
    }

    /**
     * Creates CDN Node operation signature to forward it to the Router service.
     * The signature will later be used by the router to request data from CDN Node.
     *
     * TODO: It is a temp soluation whiath should be revised after the router will be a part of CDN Node
     */
    private async createNodeOperationSignature(request: UnsignedRequest) {
        if (request.opCode !== RouteOperation.READ) {
            return; // Only READ operation signature needed on Router service
        }

        const link = `${BASE_PATH_PIECES}/${request.cid}?bucketId=${request.bucketId}`;
        const method = 'GET';

        const {body, sessionId} = PbRequest.create({
            sessionId: stringToU8a(request.sessionId),
        });

        const path = concatArrays(
            new Uint8Array(encode(method.length)),
            stringToU8a(method),
            new Uint8Array(encode(link.length)),
            stringToU8a(link),
        );

        const cid = await this.cidBuilder.build(
            concatArrays(
                path,
                new Uint8Array(encode(body.length)),
                body,
                new Uint8Array(encode(request.sessionId.length)),
                sessionId,
            ),
        );

        return this.signer.sign(stringToU8a(`<Bytes>${cid}</Bytes>`));
    }

    private async signRequest(request: UnsignedRequest) {
        const sigData = [request.cid, request.sessionId, request.requestId, request.timestamp]
            .filter(Boolean)
            .map(String);

        const cid = await this.cidBuilder.build(u8aConcat(...sigData));
        const signature = await this.signer.sign(stringToU8a(cid));
        const nodeOperationSignature = await this.createNodeOperationSignature(request);
        const signedRequest: SignedRequest = {
            ...request,
            userSignature: u8aToHex(signature),
            nodeOperationSignature: nodeOperationSignature && u8aToHex(nodeOperationSignature),
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
            fallbackSessionId: request.sessionId,
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
            fallbackSessionId: request.sessionId,
        });
    }

    async getReadRoute(uri: PieceUri) {
        return this.getPiecesRoute(RouteOperation.READ, uri);
    }

    async getStoreRoute(uri: PieceUri, links: Link[]) {
        return this.getPiecesRoute(RouteOperation.STORE, uri, links);
    }

    private async requestPiecesRouting(request: SignedRequest): Promise<PiecesRoutingResponse> {
        const path = request.opCode === RouteOperation.STORE ? 'write-resource-metadata' : 'read-resource-metadata';

        return this.request(path, request);
    }

    private async requestSearchRouting(request: SignedRequest): Promise<SearchRoutingResponse> {
        return this.request('search-metadata', request);
    }

    private async request<T>(path: string, request: SignedRequest): Promise<T> {
        const baseUrl = this.options.serviceUrl.replace(/\/+$/, '') + '/';
        const body = JSON.stringify(request, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2);

        const response = await fetch(new URL(path, baseUrl), {
            body,
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = JSON.stringify(await response.json(), null, 2);

            throw new Error(`Router request(/${path}):\n${body}\n\nFailed with error:\n${error}`);
        }

        return response.json();
    }
}
