import {Piece} from '@cere-ddc-sdk/content-addressable-storage';
import {KeyValueStorage} from '@cere-ddc-sdk/key-value-storage';
import {ROOT_USER_SEED, getContractOptions} from './helpers';

describe('packages/key-value-storage/src/KeyValueStorage.ts', () => {
    const url = 'http://localhost:8081';
    let storage: KeyValueStorage;

    beforeAll(async () => {
        storage = await KeyValueStorage.build(
            {
                smartContract: getContractOptions(),
                clusterAddress: url,
                scheme: 'sr25519',
            },
            ROOT_USER_SEED,
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('upload and read by key', async () => {
        //given
        const data = new Uint8Array([1, 2, 3]);
        const bucketId = 0n;
        const key = 'keyValue';

        //when
        try {
            await storage.store(bucketId, key, new Piece(data));
        } catch {
            console.log('error');
        }

        const storedPieces = await storage.read(bucketId, key);

        //then
        expect(storedPieces).toEqual([new Piece(data)]);
    });

    test('upload and read by key with explicit session', async () => {
        //given
        const data = new Uint8Array([1, 2, 3]);
        const bucketId = 0n;
        const key = 'keyValue';
        const session = await storage.caStorage.createSession();

        //when
        try {
            await storage.store(bucketId, key, new Piece(data), {session});
        } catch {
            console.log('error');
        }

        const storedPieces = await storage.read(bucketId, key, {session});

        //then
        expect(storedPieces).toEqual([new Piece(data)]);
    });
});
