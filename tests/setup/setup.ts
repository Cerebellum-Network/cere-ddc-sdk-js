import fetchMock from 'fetch-mock-jest';

import {setupRouter} from './routing';
import {setupCollectionPoint} from './collectionPoint';

fetchMock.config.fallbackToNetwork = true;

beforeAll(async () => {
    await setupRouter();
    await setupCollectionPoint();
});

afterAll(async () => {
    fetchMock.restore();
});
