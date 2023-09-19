import {PieceUri} from '@cere-ddc-sdk/content-addressable-storage';
import {FileStorage} from '@cere-ddc-sdk/file-storage';
import {ReadableStream} from 'stream/web';

describe('packages/file-storage/src/index.ts', () => {
    const bucketId = 1n;
    const fileData = new Uint8Array([1, 2, 3, 4, 5]);
    let headPieceUri: PieceUri;

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

    describe('Unrouted', () => {
        let storage: FileStorage;
        const cdnNodeUrl = 'http://localhost:8080';

        beforeAll(async () => {
            storage = await FileStorage.build(
                {
                    clusterAddress: cdnNodeUrl,
                    scheme: 'sr25519',
                },
                {
                    parallel: 2,
                    pieceSizeInBytes: 1,
                },
                '0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03',
            );
        });

        test('upload chunked data', async () => {
            headPieceUri = await storage.upload(bucketId, fileData, []);
        });

        test('read chunked data', async () => {
            const stream = storage.read(bucketId, headPieceUri.cid);

            await assertReadStream(stream);
        });
    });

    describe('Routed', () => {
        let storage: FileStorage;
        const clusterId = 0;

        beforeAll(async () => {
            storage = await FileStorage.build(
                {
                    clusterAddress: clusterId,
                    scheme: 'sr25519',
                    routerServiceUrl: 'http://router.cere.io',
                },
                {
                    parallel: 2,
                    pieceSizeInBytes: 1,
                },
                '0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03',
            );
        });

        test('upload chunked data', async () => {
            const headPiece = await storage.createHeadPiece(bucketId, fileData);
            const route = await storage.caStorage.router.getStoreRoute(
                new PieceUri(bucketId, headPiece.cid!),
                headPiece.links,
            );

            headPieceUri = await storage.upload(bucketId, fileData, [], {route});
        });

        test('read chunked data', async () => {
            const route = await storage.caStorage.router.getReadRoute(headPieceUri);
            const stream = storage.read(bucketId, headPieceUri.cid, {route});

            await assertReadStream(stream);
        });
    });
});
