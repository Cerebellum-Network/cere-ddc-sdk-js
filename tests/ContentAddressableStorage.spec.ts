import {webcrypto} from 'node:crypto';
import {
    ContentAddressableStorage,
    Piece,
    Tag,
    SearchType,
    Query,
    Session,
} from '@cere-ddc-sdk/content-addressable-storage';
import {delay} from './delay';

const seed = '0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03';

describe('packages/content-addressable-storage/src/ContentAddressableStorage.ts', () => {
    const url = 'http://localhost:8080';
    let storage: ContentAddressableStorage;
    let randomPieceData = new Uint8Array();
    let session: Session;
    let ackSpy: jest.SpyInstance;

    beforeEach(async () => {
        storage = await ContentAddressableStorage.build(
            {
                clusterAddress: url,
                scheme: 'sr25519',
                ackTimeout: 0,
            },
            seed,
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
        const bucketId = 1n;

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
        const bucketId = 1n;

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
        const bucketId = 1n;
        const storeRequest = await storage.store(bucketId, piece);
        expect(storeRequest.cid).toBeDefined();
        await delay(20);
        expect(ackSpy).toBeCalled();
    });

    test('store/read with explicit session', async () => {
        //given
        const tag = new Tag('some-key', 'some-value', SearchType.NOT_SEARCHABLE);
        const piece = new Piece(randomPieceData, [tag]);
        const bucketId = 1n;

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
        const bucketId = 1n;
        const piece = new Piece(new Uint8Array([1, 2, 3]), tags);

        await storage.store(bucketId, piece);

        //when
        await delay(20);
        const searchResult = await storage.search(new Query(bucketId, tags));

        //then
        piece.cid = 'bafk2bzacechpzp7rzthbhnjyxmkt3qlcyc24ruzormtvmnvdp5dsvjubh7vcc';

        expect(ackSpy).toBeCalled();
        expect(searchResult.pieces).toEqual([piece]);
    });

    test('search with explicit session', async () => {
        //given
        const tags = [new Tag('testKey', 'testValue')];
        const bucketId = 1n;
        const piece = new Piece(new Uint8Array([1, 2, 3]), tags);
        await storage.store(bucketId, piece, {session});

        //when
        const searchResult = await storage.search(new Query(bucketId, tags), {session});

        //then
        piece.cid = 'bafk2bzacechpzp7rzthbhnjyxmkt3qlcyc24ruzormtvmnvdp5dsvjubh7vcc';

        expect(ackSpy).toBeCalled();
        expect(searchResult.pieces).toEqual([piece]);
    });

    test('search not searchable', async () => {
        //given
        const tags = [new Tag('testKey2', 'testValue2', SearchType.NOT_SEARCHABLE)];
        const bucketId = 1n;
        const piece = new Piece(new Uint8Array([1, 2, 3]), tags);
        await storage.store(bucketId, piece);

        //when
        const searchResult = await storage.search(new Query(bucketId, tags));

        //then
        expect(searchResult.pieces).toStrictEqual([]);
    });
});
