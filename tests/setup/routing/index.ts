import fetchMock from 'fetch-mock-jest';

import pieces from '../../fixtures/ddc/pieces.json';

type RequestBodyChunk = {
    cid: string;
    size: string;
};

type RequestBody = {
    requestId: string;
    clusterId: number;
    bucketId: string;
    userAddress: string;
    timestamp: number;
    sessionId: string;
    nodeOperationSignature?: string;
    cid?: string;
    chunks?: RequestBodyChunk[];
};

const baseUrl = 'http://router.cere.io';
const nodeUrl = 'http://localhost:8082';
const workerAddress = 'test-worker-address';
const sessionId = 'test-session';

export const setupRouter = async () => {
    fetchMock.post(`${baseUrl}/read-resource-metadata`, async (url, request) => {
        const {requestId, cid, sessionId}: RequestBody = request.body && JSON.parse(request.body.toString());
        const {links = []} = pieces.find((piece) => piece.cid === cid) || {};
        const routing = [
            {cid, nodeUrl, sessionId, workerAddress},
            ...links.map(({cid}) => ({cid, nodeUrl, sessionId, workerAddress})),
        ];

        // console.log('Router:', 'read', {cid, routing, nodeOperationSignature, sessionId});

        return {
            status: 200,
            body: {requestId, routing},
        };
    });

    fetchMock.post(`${baseUrl}/write-resource-metadata`, (url, request) => {
        const {requestId, cid, chunks = []}: RequestBody = request.body && JSON.parse(request.body.toString());
        const routing = [
            {cid, nodeUrl, sessionId, workerAddress},
            ...chunks.map(({cid}) => ({cid, nodeUrl, sessionId, workerAddress})),
        ];

        // console.log('Router:', 'write', {cid, chunks});

        return {
            status: 200,
            body: {
                requestId,
                routing,
            },
        };
    });

    fetchMock.post(`${baseUrl}/search-metadata`, (url, request) => {
        const {requestId}: RequestBody = request.body && JSON.parse(request.body.toString());
        const routing = {nodeUrl, sessionId, workerAddress};

        // console.log('Router:', 'search', {routing});

        return {
            status: 200,
            body: {requestId, routing},
        };
    });
};
