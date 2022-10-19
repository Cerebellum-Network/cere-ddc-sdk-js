import {Piece} from '@cere-ddc-sdk/content-addressable-storage';
import {KeyValueStorage} from '@cere-ddc-sdk/key-value-storage';

describe('key-value-storage integration tests', () => {
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
        await storage.store(bucketId, key, new Piece(data));
        const storedPieces = await storage.read(bucketId, key);

        //then
        expect(storedPieces).toEqual([new Piece(data)]);
    });
});
