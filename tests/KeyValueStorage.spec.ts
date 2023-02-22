import {Piece} from '@cere-ddc-sdk/content-addressable-storage';
import {KeyValueStorage} from '@cere-ddc-sdk/key-value-storage';

describe('packages/key-value-storage/src/KeyValueStorage.ts', () => {
    const url = 'http://localhost:8080';
    let storage: KeyValueStorage;

    beforeAll(async () => {
        storage = await KeyValueStorage.build(
            {
                clusterAddress: url,
                scheme: 'sr25519',
            },
            '0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03',
        );
    });

    test('upload and read by key', async () => {
        //given
        const data = new Uint8Array([1, 2, 3]);
        const bucketId = 2n;
        const key = 'keyValue';

        //when
        await storage.store(bucketId, session, key, new Piece(data));
        const storedPieces = await storage.read(bucketId, session, key);

        //then
        expect(storedPieces).toEqual([new Piece(data)]);
    });
});
