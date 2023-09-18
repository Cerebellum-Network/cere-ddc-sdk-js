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
    cid?: string;
    chunks?: RequestBodyChunk[];
};

const baseUrl = 'http://router.cere.io';
const nodeUrl = 'http://localhost:8081';
const sessionId = 'test-session';

export const setupRouter = async () => {
    fetchMock.post(`${baseUrl}/read-resource-metadata`, async (url, request) => {
        const {requestId, cid}: RequestBody = request.body && JSON.parse(request.body.toString());
        const {links = []} = pieces.find((piece) => piece.cid === cid) || {};

        return {
            status: 200,
            body: {
                requestId,
                routing: [{cid, nodeUrl, sessionId}, ...links.map(({cid}) => ({cid, nodeUrl, sessionId}))],
            },
        };
    });

    fetchMock.post(`${baseUrl}/write-resource-metadata`, (url, request) => {
        const {requestId, cid, chunks = []}: RequestBody = request.body && JSON.parse(request.body.toString());

        return {
            status: 200,
            body: {
                requestId,
                routing: [{cid, nodeUrl, sessionId}, ...chunks.map(({cid}) => ({cid, nodeUrl, sessionId}))],
            },
        };
    });

    fetchMock.post(`${baseUrl}/search-metadata`, (url, request) => {
        const {requestId}: RequestBody = request.body && JSON.parse(request.body.toString());

        return {
            status: 200,
            body: {
                requestId,
                routing: {nodeUrl, sessionId},
            },
        };
    });
};
