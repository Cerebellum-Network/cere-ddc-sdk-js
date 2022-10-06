import {DdcClient} from "./DdcClient";
import {File} from "./model/File";
import {Piece, Query, Tag} from "@cere-ddc-sdk/content-addressable-storage";
import {randomBytes} from "tweetnacl";
import {randomUUID} from "crypto";
import {u8aToHex} from "@polkadot/util";
import {DdcUri} from "@cere-ddc-sdk/core";

describe("DDC client integration tests", () => {
    const secretPhrase = "0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03";
    const otherSecretPhrase = "wheat wise addict group walk park desk yard render scare false measure";
    const bucketId = 1n;
    const options = {clusterAddress: "http://localhost:8080", chunkSizeInBytes: 30};
    const testSubject = DdcClient.buildAndConnect(options, secretPhrase);
    const otherClient = DdcClient.buildAndConnect(options, otherSecretPhrase);

    afterAll(async () => {
        await (await testSubject).disconnect();
        await (await otherClient).disconnect();
    });

    it("store and read unencrypted small data", async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag("some-key", "some-value")];
        const piece = new Piece(data, tags);

        //when
        const uri = await (await testSubject).store(bucketId, piece,  {encrypt: false}, new Uint8Array());
        const result = await (await testSubject).read(uri, {decrypt: false}, new Uint8Array());

        //then
        piece.cid = uri.path as string;
        expect(result).toEqual(piece);
        expect(Piece.isPiece(result)).toBeTruthy();
    });

    it("store and read encrypted small data", async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag("some-key", "some-value")];
        const piece = new Piece(data, tags);
        const dekPath = "test/piece";

        //when
        const uri = await (await testSubject).store(bucketId, piece, {encrypt: true, dekPath: dekPath}, new Uint8Array());
        const result = await (await testSubject).read(uri, {decrypt: true, dekPath: dekPath} , new Uint8Array());

        //then
        piece.cid = uri.path as string;
        expect(result).toEqual(piece);
        expect(Piece.isPiece(result)).toBeTruthy();
    });

    it("store and read by URL", async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag("some-key", "some-value")];
        const piece = new Piece(data, tags);

        //when
        const uri = await (await testSubject).store(bucketId, piece, {encrypt: false}, new Uint8Array());
        const result = await (await testSubject).read(DdcUri.parse(`/ddc/buc/${uri.bucket}/ipiece/${uri.path}`), {decrypt: false}, new Uint8Array());

        //then
        piece.cid = uri.path as string;
        expect(result).toEqual(piece);
        expect(Piece.isPiece(result)).toBeTruthy();
    });

    it("store and read encrypted by URL", async () => {
        //given
        const data = randomBytes(40);
        const tags = [new Tag("some-key", "some-value")];
        const file = new File(data, tags);
        const dekPath = "test/piece/url";

        //when
        const uri = await (await testSubject).store(bucketId, file, {encrypt: true, dekPath: dekPath}, new Uint8Array());
        const result = await (await testSubject).read(DdcUri.parse(new URL(`http://test.com/ddc/buc/${uri.bucket}/ifile/${uri.path}`)), {decrypt: true, dekPath: dekPath}, new Uint8Array());

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


    it("store and read unencrypted big data", async () => {
        //given
        const data = randomBytes(100);
        const tags = [new Tag("some-key", "some-value")];
        const file = new File(data, tags);

        //when
        const uri = await (await testSubject).store(bucketId, file, {encrypt: false},new Uint8Array());
        const result = await (await testSubject).read(uri, {decrypt: false}, new Uint8Array());

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

    it("store and read encrypted big data", async () => {
        //given
        const data = randomBytes(100);
        const tags = [new Tag("some-key", "some-value")];
        const file = new File(data, tags);
        const dekPath = "test/piece";

        //when
        const uri = await (await testSubject).store(bucketId, file, {encrypt: true, dekPath: dekPath}, new Uint8Array());
        const result = await (await testSubject).read(uri, {decrypt: true, dekPath: dekPath}, new Uint8Array());

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


    it("search data encrypted", async () => {
        //given
        const data = randomBytes(20);
        const key = randomUUID();
        const value = randomUUID();
        const file = new File(data, [new Tag(key, value)]);
        await (await testSubject).store(bucketId, file, {encrypt: true}, new Uint8Array());

        //when
        const result = await (await testSubject).search(new Query(bucketId, [new Tag(key, value)], false));

        //then
        result.forEach(p => p.cid = undefined);

        const expectPiece = new Piece((await testSubject).caStorage.cipher!.encrypt(new Uint8Array([]), (await testSubject).masterDek));
        expectPiece.tags = [new Tag(key, value), new Tag("dekPath", "")];
        expectPiece.links = result[0].links;
        expect(result).toEqual([expectPiece]);
    });

    it("share data", async () => {
        //given
        const data = randomBytes(20);
        const file = new File(data);
        const dekPath = randomUUID();
        const pieceUri = await (await testSubject).store(bucketId, file, {encrypt: true, dekPath: dekPath}, new Uint8Array());

        //when
        await (await testSubject).shareData(bucketId, dekPath, u8aToHex((await otherClient).boxKeypair.publicKey), new Uint8Array());
        const result = await (await otherClient).read(pieceUri, {decrypt: true, dekPath: dekPath}, new Uint8Array());

        //then
        expect(File.isFile(result)).toBeTruthy();

        file.cid = pieceUri.path as string;
        file.tags = [new Tag("dekPath", dekPath)];

        let offset = 0;
        const resultData = new Uint8Array(data.length);
        for await (const chunkData of (result as File).dataReader()) {
            resultData.set(chunkData, offset);
            offset += chunkData.length;
        }
        result.data = resultData;

        expect(result).toEqual(file);
    });

    it("share data with high level key", async () => {
        //given
        const data = randomBytes(20);
        const file = new File(data);
        const highDekPath = "some";
        const fullDekPath = highDekPath + "/test/sub/path"
        const pieceUri = await (await testSubject).store(bucketId, file, {encrypt: true, dekPath: fullDekPath}, new Uint8Array());

        //when
        await (await testSubject).shareData(bucketId, highDekPath, u8aToHex((await otherClient).boxKeypair.publicKey), new Uint8Array());
        const result = await (await otherClient).read(pieceUri, {decrypt: true, dekPath: highDekPath}, new Uint8Array());

        //then
        expect(File.isFile(result)).toBeTruthy();

        file.cid = pieceUri.path as string;
        file.tags = [new Tag("dekPath", fullDekPath)];

        let offset = 0;
        const resultData = new Uint8Array(data.length);
        for await (const chunkData of (result as File).dataReader()) {
            resultData.set(chunkData, offset);
            offset += chunkData.length;
        }
        result.data = resultData;

        expect(result).toEqual(file);
    });

    it("search metadata", async () => {
        //given
        const data = randomBytes(20);
        const key = randomUUID();
        const value = randomUUID();
        const tags = [new Tag(key, value)];
        const piece = new Piece(data, tags);
        const uri = await (await testSubject).store(bucketId, piece, {encrypt: false}, new Uint8Array());

        //when
        const result = await (await testSubject).search(new Query(bucketId, tags, true));

        //then
        expect(result).toEqual([new Piece(new Uint8Array([]), tags, [], uri.path as string)]);
    });
})
