import {rest} from 'msw';
import {SetupServer} from 'msw/node';

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

const baseUrl = 'https://dev-cluster-management.network-dev.aws.cere.io/router';
const nodeUrl = 'http://localhost:8082';
const workerAddress = 'test-worker-address';
const sessionId = 'test-session';

export const setupRouter = async (server: SetupServer) => {
    server.use(
        rest.post(`${baseUrl}/read-resource-metadata`, async (req, res, ctx) => {
            const {requestId, cid, sessionId, nodeOperationSignature} = await req.json<RequestBody>();
            const {links = []} = pieces.find((piece) => piece.cid === cid) || {};
            const routing = [
                {cid, nodeUrl, sessionId, workerAddress},
                ...links.map(({cid}) => ({cid, nodeUrl, sessionId, workerAddress})),
            ];

            // console.log('Router:', 'read', {cid, routing, nodeOperationSignature, sessionId});

            return res(ctx.status(200), ctx.json({requestId, routing}));
        }),

        rest.post(`${baseUrl}/read-resource-metadata`, async (req, res, ctx) => {
            const {requestId, cid, sessionId, nodeOperationSignature} = await req.json<RequestBody>();
            const {links = []} = pieces.find((piece) => piece.cid === cid) || {};
            const routing = [
                {cid, nodeUrl, sessionId, workerAddress},
                ...links.map(({cid}) => ({cid, nodeUrl, sessionId, workerAddress})),
            ];

            // console.log('Router:', 'read', {cid, routing, nodeOperationSignature, sessionId});

            return res(ctx.status(200), ctx.json({requestId, routing}));
        }),

        rest.post(`${baseUrl}/write-resource-metadata`, async (req, res, ctx) => {
            const {requestId, cid, chunks = []} = await req.json<RequestBody>();
            const routing = [
                {cid, nodeUrl, sessionId, workerAddress},
                ...chunks.map(({cid}) => ({cid, nodeUrl, sessionId, workerAddress})),
            ];

            // console.log('Router:', 'write', {cid, chunks});

            return res(ctx.status(200), ctx.json({requestId, routing}));
        }),

        rest.post(`${baseUrl}/search-metadata`, async (req, res, ctx) => {
            const {requestId} = await req.json<RequestBody>();
            const routing = {nodeUrl, sessionId, workerAddress};

            // console.log('Router:', 'search', {routing});

            return res(ctx.status(200), ctx.json({requestId, routing}));
        }),
    );
};
