import {DdcClient} from "./DdcClient";
import {PieceArray} from "./model/PieceArray";
import {Query, Tag} from "@cere-ddc-sdk/content-addressable-storage";
import {randomBytes} from "tweetnacl";
import {randomUUID} from "crypto";
import {u8aToHex} from "@polkadot/util";

describe("DDC client integration tests", () => {
    const secretPhrase = "thought lizard above company tape post nice rack depth appear equal equip";
    const bucketId = 1n;
    const options = {clusterAddress: "http://localhost:8080", chunkSizeInBytes: 30};
    const testSubject = DdcClient.buildAndConnect(secretPhrase, options);
    const otherClient = DdcClient.buildAndConnect("wheat wise addict group walk park desk yard render scare false measure", options);

    afterAll(async () => {
        await (await testSubject).diconnect();
        await (await otherClient).diconnect();
    });

    it("store and read unencrypted small data", async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag("some-key", "some-value")];
        const pieceArray = new PieceArray(data, tags);

        //when
        const uri = await (await testSubject).store(bucketId, pieceArray, {encrypt: false});
        const result = await (await testSubject).read(uri, {decrypt: false});

        //then
        pieceArray.headCid = uri.cid;
        expect(result).toEqual(pieceArray);
    });

    it("store and read encrypted small data", async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag("some-key", "some-value")];
        const pieceArray = new PieceArray(data, tags);
        const dekPath = "test/piece";

        //when
        const uri = await (await testSubject).store(bucketId, pieceArray, {encrypt: true, dekPath: dekPath});
        const result = await (await testSubject).read(uri, {decrypt: true, dekPath: dekPath});

        //then
        pieceArray.headCid = uri.cid;
        expect(result).toEqual(pieceArray);
    });


    it("store and read unencrypted big data", async () => {
        //given
        const data = randomBytes(100);
        const tags = [new Tag("some-key", "some-value")];
        const pieceArray = new PieceArray(data, tags);

        //when
        const uri = await (await testSubject).store(bucketId, pieceArray, {encrypt: false});
        const result = await (await testSubject).read(uri, {decrypt: false});

        //then
        let offset = 0;
        const expectedData = new Uint8Array(data.length);
        for await (const chunkData of result.dataReader()) {
            expectedData.set(chunkData, offset);
            offset += chunkData.length;
        }

        result.data = expectedData;
        pieceArray.headCid = uri.cid;
        expect(result).toEqual(pieceArray);
    });

    it("store and read encrypted big data", async () => {
        //given
        const data = randomBytes(100);
        const tags = [new Tag("some-key", "some-value")];
        const pieceArray = new PieceArray(data, tags);
        const dekPath = "test/piece";

        //when
        const uri = await (await testSubject).store(bucketId, pieceArray, {encrypt: true, dekPath: dekPath});
        const result = await (await testSubject).read(uri, {decrypt: true, dekPath: dekPath});

        //then
        let offset = 0;
        const expectedData = new Uint8Array(data.length);
        for await (const chunkData of result.dataReader()) {
            expectedData.set(chunkData, offset);
            offset += chunkData.length;
        }

        result.data = expectedData;
        pieceArray.headCid = uri.cid;
        expect(result).toEqual(pieceArray);
    });


    it("search data encrypted", async () => {
        //given
        const data = randomBytes(20);
        const key = randomUUID();
        const value = randomUUID();
        const pieceArray = new PieceArray(data, [new Tag(key, value)]);
        await (await testSubject).store(bucketId, pieceArray, {encrypt: true});

        //when
        const result = await (await testSubject).search(new Query(bucketId, [new Tag(key, value)], false));

        //then
        result.forEach(p => p.headCid = undefined);

        pieceArray.data = (await testSubject).cipher.encrypt(data, (await testSubject).masterDek);
        pieceArray.tags = [new Tag(key, value), new Tag("dekPath", "")]
        expect(result).toEqual([pieceArray]);
    });

    it("share data", async () => {
        //given
        const data = randomBytes(20);
        const pieceArray = new PieceArray(data);
        const dekPath = randomUUID();
        const pieceUri = await (await testSubject).store(bucketId, pieceArray, {encrypt: true, dekPath: dekPath});

        //when
        await (await testSubject).shareData(bucketId, dekPath, u8aToHex((await otherClient).boxKeypair.publicKey));
        const result = await (await otherClient).read(pieceUri, {decrypt: true, dekPath: dekPath});

        //then
        pieceArray.headCid = pieceUri.cid;
        pieceArray.tags = [new Tag("dekPath", dekPath)];
        expect(result).toEqual(pieceArray);
    });

    it("share data with high level key", async () => {
        //given
        const data = randomBytes(20);
        const pieceArray = new PieceArray(data);
        const highDekPath = "some";
        const fullDekPath = highDekPath + "/test/sub/path"
        const pieceUri = await (await testSubject).store(bucketId, pieceArray, {encrypt: true, dekPath: fullDekPath});

        //when
        await (await testSubject).shareData(bucketId, highDekPath, u8aToHex((await otherClient).boxKeypair.publicKey));
        const result = await (await otherClient).read(pieceUri, {decrypt: true, dekPath: highDekPath});

        //then
        pieceArray.headCid = pieceUri.cid;
        pieceArray.tags = [new Tag("dekPath", fullDekPath)]
        expect(result).toEqual(pieceArray);
    });

    it("search metadata", async () => {
        //given
        const data = randomBytes(20);
        const key = randomUUID();
        const value = randomUUID();
        const tags = [new Tag(key, value)];
        const pieceArray = new PieceArray(data, tags);
        const uri = await (await testSubject).store(bucketId, pieceArray, {encrypt: false});

        //when
        const result = await (await testSubject).search(new Query(bucketId, tags, true));

        //then
        pieceArray.headCid = uri.cid;
        pieceArray.data = new Uint8Array();
        expect(result).toEqual([pieceArray]);
    });
})