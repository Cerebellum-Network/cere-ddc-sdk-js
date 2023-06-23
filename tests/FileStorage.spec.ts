import {FileStorage, FileStorageConfig} from '@cere-ddc-sdk/file-storage';
import {Session} from '@cere-ddc-sdk/content-addressable-storage';

describe('packages/file-storage/src/index.ts', () => {
    const url = 'http://localhost:8080';
    let storage: FileStorage;
    let session: Session;
    let ackSpy: jest.SpyInstance;

    beforeAll(async () => {
        storage = await FileStorage.build(
            {clusterAddress: url, scheme: 'sr25519'},
            new FileStorageConfig(2, 1),
            '0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03',
        );
        session = await storage.caStorage.createSession();
    });

    beforeEach(() => {
        ackSpy = jest.spyOn(storage.caStorage as any, 'ack');

        /**
         * TODO: Remove when ack fixed
         */
        ackSpy.mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('upload and read chunked data', async () => {
        //given
        const bucketId = 1n;
        const data = new Uint8Array([1, 2, 3, 4, 5]);

        //when
        const headPieceUri = await storage.upload(bucketId, session, data, []);
        const stream = storage.read(bucketId, session, headPieceUri.cid);

        //then
        let result = [];
        const reader = stream.getReader();
        let chunk;
        while (!(chunk = await reader.read()).done) {
            expect(1).toEqual(chunk.value.length);
            result.push(...chunk.value);
        }

        expect(data).toEqual(new Uint8Array(result));
    });
});
