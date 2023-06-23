import {randomBytes} from 'tweetnacl';
import {randomUUID} from 'crypto';
import {u8aToHex} from '@polkadot/util';
import {DdcClient, File, Session} from '@cere-ddc-sdk/ddc-client';
import {DdcUri} from '@cere-ddc-sdk/core';
import {Piece, Query, Tag} from '@cere-ddc-sdk/content-addressable-storage';
import {saveWithEmptyNonce} from './save-with-empty-nonce';
import {unwrap} from './unwrap';

describe('packages/ddc-client/src/DdcClient.ts', () => {
    const seed = '0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03';
    const otherSecretPhrase = 'wheat wise addict group walk park desk yard render scare false measure';
    const bucketId = 1n;
    const options = {clusterAddress: 'http://localhost:8080', chunkSizeInBytes: 30, readAttempts: 3};
    let mainClient: DdcClient;
    let secondClient: DdcClient;
    let session: Session;
    let ackMainSpy: jest.SpyInstance;
    let ackSecondSpy: jest.SpyInstance;

    beforeAll(async () => {
        mainClient = await DdcClient.buildAndConnect(options, seed);
        secondClient = await DdcClient.buildAndConnect(options, otherSecretPhrase);
        session = await mainClient.createSession();
    });

    afterAll(async () => {
        await mainClient.disconnect();
        await secondClient.disconnect();
    });

    beforeEach(() => {
        ackMainSpy = jest.spyOn(mainClient.caStorage as any, 'ack');
        ackSecondSpy = jest.spyOn(secondClient.caStorage as any, 'ack');

        /**
         * TODO: Remove when ack fixed
         */
        ackMainSpy.mockResolvedValue(undefined);
        ackSecondSpy.mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should read scheme address', () => {
        expect(mainClient.caStorage.scheme.address).toBeDefined();
    });

    it('store and read unencrypted small data', async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag('some-key', 'some-value')];
        const piece = new Piece(data, tags);

        //when
        const uri = await mainClient.store(bucketId, session, piece, {encrypt: false});
        const result = await mainClient.read(uri, session, {decrypt: false});

        //then
        piece.cid = uri.path as string;
        expect(result).toEqual(piece);
        expect(Piece.isPiece(result)).toBeTruthy();
    });

    it('store and read encrypted small data', async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag('some-key', 'some-value')];
        const piece = new Piece(data, tags);
        const dekPath = 'test/piece';

        //when
        const uri = await mainClient.store(bucketId, session, piece, {encrypt: true, dekPath});
        const result = await mainClient.read(uri, session, {decrypt: true, dekPath});

        //then
        piece.cid = uri.path as string;
        expect(result).toEqual(piece);
        expect(Piece.isPiece(result)).toBeTruthy();
    });

    it('store and read by URL', async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag('some-key', 'some-value')];
        const piece = new Piece(data, tags);

        //when
        const uri = await mainClient.store(bucketId, session, piece, {encrypt: false});
        const result = await mainClient.read(DdcUri.parse(`/ddc/buc/${uri.bucket}/ipiece/${uri.path}`), session, {
            decrypt: false,
        });

        //then
        piece.cid = uri.path as string;
        expect(result).toEqual(piece);
        expect(Piece.isPiece(result)).toBeTruthy();
    });

    it('store and read encrypted by URL', async () => {
        //given
        const data = randomBytes(40);
        const tags = [new Tag('some-key', 'some-value')];
        const file = new File(data, tags);
        const dekPath = 'test/piece/url';

        //when
        const uri = await mainClient.store(bucketId, session, file, {encrypt: true, dekPath: dekPath});
        const result = await mainClient.read(
            DdcUri.parse(new URL(`http://test.com/ddc/buc/${uri.bucket}/ifile/${uri.path}`)),
            session,
            {decrypt: true, dekPath: dekPath},
        );

        //then
        let offset = 0;
        const expectedData = new Uint8Array(data.length);
        for await (const chunkData of (result as File).dataReader()) {
            expectedData.set(chunkData, offset);
            offset += chunkData.length;
        }

        result.data = expectedData;
        file.cid = uri.path as string;
        expect(result).toEqual(file);
        expect(File.isFile(result)).toBeTruthy();
    });

    it('store and read unencrypted big data', async () => {
        //given
        const data = randomBytes(100);
        const tags = [new Tag('some-key', 'some-value')];
        const file = new File(data, tags);

        //when
        const uri = await mainClient.store(bucketId, session, file, {encrypt: false});
        const result = await mainClient.read(uri, session, {decrypt: false});

        //then
        expect(File.isFile(result)).toBeTruthy();

        let offset = 0;
        const expectedData = new Uint8Array(data.length);
        for await (const chunkData of (result as File).dataReader()) {
            expectedData.set(chunkData, offset);
            offset += chunkData.length;
        }

        result.data = expectedData;
        file.cid = uri.path as string;
        expect(result).toEqual(file);
    });

    it('store and read encrypted big data', async () => {
        //given
        const data = randomBytes(100);
        const tags = [new Tag('some-key', 'some-value')];
        const file = new File(data, tags);
        const dekPath = 'test/piece';

        //when
        const uri = await mainClient.store(bucketId, session, file, {encrypt: true, dekPath: dekPath});
        const result = await mainClient.read(uri, session, {decrypt: true, dekPath: dekPath});

        //then
        expect(File.isFile(result)).toBeTruthy();

        let offset = 0;
        const expectedData = new Uint8Array(data.length);
        for await (const chunkData of (result as File).dataReader()) {
            expectedData.set(chunkData, offset);
            offset += chunkData.length;
        }

        result.data = expectedData;
        file.cid = uri.path as string;
        expect(result).toEqual(file);
    });

    it('search data encrypted', async () => {
        //given
        const data = randomBytes(20);
        const key = randomUUID();
        const value = randomUUID();
        const file = new File(data, [new Tag(key, value)]);
        await mainClient.store(bucketId, session, file, {encrypt: true});

        //when
        const result = await mainClient.search(new Query(bucketId, [new Tag(key, value)], false), session);

        //then
        result.forEach((p) => (p.cid = undefined));

        const expectPiece = new Piece(
            (await mainClient).caStorage.cipher.encrypt(new Uint8Array([]), (await mainClient).masterDek),
        );
        expectPiece.tags = [new Tag(key, value), new Tag('dekPath', '')];
        expectPiece.links = result[0].links;
        expect(result).toEqual([expectPiece]);
    });

    /*it('share data', async () => {
        //given
        const data = randomBytes(20);
        const file = new File(data);
        const dekPath = randomUUID();
        const pieceUri = await mainClient.store(bucketId, session, file, {encrypt: true, dekPath});

        //when
        await mainClient.shareData(bucketId, dekPath, u8aToHex(secondClient.boxKeypair.publicKey), session);
        const result = await secondClient.read(pieceUri, session, {decrypt: true, dekPath});

        //then
        expect(File.isFile(result)).toBeTruthy();

        file.cid = pieceUri.path as string;
        file.tags = [new Tag('dekPath', dekPath)];

        let offset = 0;
        const resultData = new Uint8Array(data.length);
        for await (const chunkData of (result as File).dataReader()) {
            resultData.set(chunkData, offset);
            offset += chunkData.length;
        }
        result.data = resultData;

        expect(result).toEqual(file);
    });*/
    /*
    it('share data with high level key', async () => {
        //given
        const data = randomBytes(20);
        const file = new File(data);
        const highDekPath = 'some';
        const fullDekPath = highDekPath + '/test/sub/path';
        const pieceUri = await mainClient.store(bucketId, session, file, {encrypt: true, dekPath: fullDekPath});

        //when
        await mainClient.shareData(bucketId, highDekPath, u8aToHex(secondClient.boxKeypair.publicKey), session);
        const result = await secondClient.read(pieceUri, session, {decrypt: true, dekPath: highDekPath});

        //then
        expect(File.isFile(result)).toBeTruthy();

        file.cid = pieceUri.path as string;
        file.tags = [new Tag('dekPath', fullDekPath)];

        let offset = 0;
        const resultData = new Uint8Array(data.length);
        for await (const chunkData of (result as File).dataReader()) {
            resultData.set(chunkData, offset);
            offset += chunkData.length;
        }
        result.data = resultData;

        expect(result).toEqual(file);
    });*/

    it('search metadata', async () => {
        //given
        const data = randomBytes(20);
        const key = randomUUID();
        const value = randomUUID();
        const tags = [new Tag(key, value)];
        const piece = new Piece(data, tags);
        const uri = await mainClient.store(bucketId, session, piece, {encrypt: false});

        //when
        const result = await mainClient.search(new Query(bucketId, tags, true), session);

        //then
        expect(result).toEqual([new Piece(new Uint8Array([]), tags, [], uri.path as string)]);
    });

    describe('test encryption backward compatibility', () => {
        it('encryption should work for data without nonce', async () => {
            const data = randomBytes(20);
            const key = randomUUID();
            const value = randomUUID();
            const tags = [new Tag(key, value)];
            const piece = new Piece(data, tags);
            const dekPath = 'test/piece';
            const uri = await saveWithEmptyNonce(mainClient, bucketId, session, piece, {
                encrypt: true,
                dekPath,
            });
            const result = await mainClient.read(uri, session, {decrypt: true, dekPath});
            result.tags.forEach((tag) => {
                console.log(tag.keyString);
                console.log(tag.valueString);
            });
            const tag = tags.find((t) => t.keyString === key);
            expect(tag).toBeDefined();
            expect(unwrap(tag).valueString).toBe(value);
            expect(piece.data).toEqual(piece.data);
        });
    });
});
