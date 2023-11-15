import {setupServer} from 'msw/node';

import {setupRouter} from './routing';
import {setupCollectionPoint} from './collectionPoint';

const server = setupServer();

beforeAll(async () => {
    /**
     * Emulate browser environment
     */
    globalThis.self = globalThis as any;
    globalThis.WebSocket = require('ws').WebSocket;

    await setupRouter(server);
    await setupCollectionPoint(server);

    server.listen({
        onUnhandledRequest() {},
    });
});

afterAll(async () => {
    server.close();
});
