import {PieceUri, Router} from '@cere-ddc-sdk/content-addressable-storage';
import {FileStorage} from '@cere-ddc-sdk/file-storage';
import {ReadableStream} from 'stream/web';

describe('packages/file-storage/src/index.ts', () => {
    const clusterId = 1;
    const bucketId = 1n;
    const cdnNodeUrl = 'http://localhost:8080';
    const fileData = new Uint8Array([1, 2, 3, 4, 5]);

    let headPieceUri: PieceUri;
    let storage: FileStorage;

    const assertReadStream = async (stream: ReadableStream) => {
        let result = [];
        const reader = stream.getReader();

        let chunk;
        while (!(chunk = await reader.read()).done) {
            expect(1).toEqual(chunk.value.length);

            result.push(...chunk.value);
        }

        expect(fileData).toEqual(new Uint8Array(result));
    };

    beforeAll(async () => {
        storage = await FileStorage.build(
            {clusterAddress: cdnNodeUrl, scheme: 'sr25519'},
            {parallel: 2, pieceSizeInBytes: 1},
            '0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03',
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('Unrouted', () => {
        test('upload chunked data', async () => {
            headPieceUri = await storage.upload(bucketId, fileData, []);
        });

        test('read chunked data', async () => {
            const stream = storage.read(bucketId, headPieceUri.cid);

            await assertReadStream(stream);
        });
    });

    describe.only('Routed', () => {
        let router: Router;

        beforeAll(() => {
            router = new Router(clusterId, {
                fallbackNodeUrl: cdnNodeUrl,
                fallbackSessionId: 'test-session',
                signer: storage.caStorage.scheme,
            });
        });

        test('upload chunked data', async () => {
            headPieceUri = await storage.upload(bucketId, fileData, []);
        });

        test('read chunked data', async () => {
            const route = await router.getRoute(headPieceUri);
            const stream = storage.read(bucketId, headPieceUri.cid, {route});

            await assertReadStream(stream);
        });
    });
});
