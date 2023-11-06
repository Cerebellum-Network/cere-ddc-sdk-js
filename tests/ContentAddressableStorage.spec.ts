import {webcrypto, randomBytes} from 'node:crypto';
import {
    ContentAddressableStorage,
    Piece,
    Tag,
    SearchType,
    Query,
    Session,
} from '@cere-ddc-sdk/content-addressable-storage';

import {ROOT_USER_SEED, getContractOptions} from './helpers';
import {delay} from './delay';

describe('packages/content-addressable-storage/src/ContentAddressableStorage.ts', () => {
    const url = 'http://localhost:8081';
    const bucketId = 0n;

    let storage: ContentAddressableStorage;
    let randomPieceData = new Uint8Array();
    let session: Session;
    let ackSpy: jest.SpyInstance;

    beforeEach(async () => {
        storage = await ContentAddressableStorage.build(
            {
                smartContract: getContractOptions(),
                clusterAddress: url,
                scheme: 'sr25519',
                ackTimeout: 0,
            },
            ROOT_USER_SEED,
        );
        randomPieceData = new Uint8Array(10);
        webcrypto.getRandomValues(randomPieceData);
        session = await storage.createSession();
        ackSpy = jest.spyOn(storage as any, 'ack');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('store/read', async () => {
        //given
        const tag = new Tag('some-key', 'some-value', SearchType.NOT_SEARCHABLE);
        const piece = new Piece(randomPieceData, [tag]);

        //when
        const storeRequest = await storage.store(bucketId, piece);
        expect(storeRequest.cid).toBeDefined();

        const readRequest = await storage.read(bucketId, storeRequest.cid);
        await delay(20);
        expect(ackSpy).toBeCalled();
        expect(new Uint8Array(readRequest.data)).toEqual(randomPieceData);
    });

    it('should validate cid on reading', async () => {
        const tag = new Tag('some-key', 'some-value', SearchType.NOT_SEARCHABLE);
        const piece = new Piece(randomPieceData, [tag]);

        //when
        const storeRequest = await storage.store(bucketId, piece);
        expect(storeRequest.cid).toBeDefined();

        jest.spyOn(storage as any, 'verifySignedPiece').mockResolvedValue(false);

        expect.assertions(2);
        try {
            await storage.read(bucketId, storeRequest.cid);
        } catch (e) {
            expect(e).toMatchObject(expect.any(Error));
        }
    });

    it('should call ack on store', async () => {
        //given
        const tag = new Tag('some-key', 'some-value', SearchType.NOT_SEARCHABLE);
        const piece = new Piece(randomPieceData, [tag]);
        const storeRequest = await storage.store(bucketId, piece);
        expect(storeRequest.cid).toBeDefined();
        await delay(20);
        expect(ackSpy).toBeCalled();
    });

    test('store/read with explicit session', async () => {
        //given
        const tag = new Tag('some-key', 'some-value', SearchType.NOT_SEARCHABLE);
        const piece = new Piece(randomPieceData, [tag]);

        //when
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const storeRequest = await storage.store(bucketId, piece, {session});
        expect(storeRequest.cid).toBeDefined();

        const readRequest = await storage.read(bucketId, storeRequest.cid, {session});
        await delay(20);
        expect(ackSpy).toBeCalled();
        expect(new Uint8Array(readRequest.data)).toEqual(randomPieceData);
    });

    test('search', async () => {
        //given
        const tags = [new Tag('testKey', 'testValue')];
        const piece1 = new Piece(new Uint8Array(randomBytes(3)), tags);
        const piece2 = new Piece(new Uint8Array(randomBytes(3)), tags);

        const {cid: cid1} = await storage.store(bucketId, piece1);
        const {cid: cid2} = await storage.store(bucketId, piece2);

        //when
        await delay(20);
        const searchResult = await storage.search(new Query(bucketId, tags));

        //then
        piece1.cid = cid1;
        piece2.cid = cid2;

        expect(ackSpy).toBeCalledTimes(4);
        expect(searchResult.pieces).toEqual(expect.arrayContaining([piece1, piece2]));
    });

    test('search with explicit session', async () => {
        //given
        const tags = [new Tag('testKeyWithSession', 'testValueWithSession')];
        const piece = new Piece(new Uint8Array(randomBytes(3)), tags);
        const {cid} = await storage.store(bucketId, piece, {session});

        //when
        const searchResult = await storage.search(new Query(bucketId, tags), {session});

        //then
        piece.cid = cid;

        expect(ackSpy).toBeCalled();
        expect(searchResult.pieces).toEqual([piece]);
    });

    test('search not searchable', async () => {
        //given
        const tags = [new Tag('testKey2', 'testValue2', SearchType.NOT_SEARCHABLE)];
        const piece = new Piece(new Uint8Array([1, 2, 3]), tags);
        await storage.store(bucketId, piece);

        //when
        const searchResult = await storage.search(new Query(bucketId, tags));

        //then
        expect(searchResult.pieces).toStrictEqual([]);
    });
});
