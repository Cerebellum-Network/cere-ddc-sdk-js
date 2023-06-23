import {Piece, Session} from '@cere-ddc-sdk/content-addressable-storage';
import {KeyValueStorage} from '@cere-ddc-sdk/key-value-storage';

describe('packages/key-value-storage/src/KeyValueStorage.ts', () => {
    const url = 'http://localhost:8080';
    let storage: KeyValueStorage;
    let session: Session;
    let ackSpy: jest.SpyInstance;

    beforeAll(async () => {
        storage = await KeyValueStorage.build(
            {
                clusterAddress: url,
                scheme: 'sr25519',
            },
            '0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03',
        );

        session = await storage.caStorage.createSession();
        ackSpy = jest.spyOn(storage.caStorage as any, 'ack');

        /**
         * TODO: Remove when ack fixed
         */
        ackSpy.mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('upload and read by key', async () => {
        //given
        const data = new Uint8Array([1, 2, 3]);
        const bucketId = 2n;
        const key = 'keyValue';

        //when
        try {
            await storage.store(bucketId, session, key, new Piece(data));
        } catch {
            console.log('error');
        }

        const storedPieces = await storage.read(bucketId, session, key);

        //then
        expect(storedPieces).toEqual([new Piece(data)]);
    });
});
