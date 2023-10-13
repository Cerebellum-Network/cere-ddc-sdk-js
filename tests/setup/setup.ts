import {setupServer} from 'msw/node';

import {setupRouter} from './routing';
import {setupCollectionPoint} from './collectionPoint';

const server = setupServer();

beforeAll(async () => {
    await setupRouter(server);
    await setupCollectionPoint(server);

    server.listen({
        onUnhandledRequest() {},
    });
});

afterAll(async () => {
    server.close();
});
