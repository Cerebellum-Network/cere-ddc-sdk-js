import {DdcClient} from "./DdcClient.js";
import {File} from "./model/File.js";
import {Query, Tag} from "@cere-ddc-sdk/content-addressable-storage";
import {randomBytes} from "tweetnacl";
import {randomUUID} from "crypto";
import {u8aToHex} from "@polkadot/util";

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
        const file = new File(data, tags);

        //when
        const uri = await (await testSubject).store(bucketId, file, {encrypt: false});
        const result = await (await testSubject).read(uri, {decrypt: false});

        //then
        file.headCid = uri.cid;
        expect(result).toEqual(file);
    });

    it("store and read encrypted small data", async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag("some-key", "some-value")];
        const file = new File(data, tags);
        const dekPath = "test/piece";

        //when
        const uri = await (await testSubject).store(bucketId, file, {encrypt: true, dekPath: dekPath});
        const result = await (await testSubject).read(uri, {decrypt: true, dekPath: dekPath});

        //then
        file.headCid = uri.cid;
        expect(result).toEqual(file);
    });

    it("store and read by URL", async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag("some-key", "some-value")];
        const file = new File(data, tags);
        const dekPath = "test/piece";

        //when
        const uri = await (await testSubject).store(bucketId, file, {encrypt: false});
        const result = await (await testSubject).read(`/ddc/buc/${uri.bucketId}/ipiece/${uri.cid}`, {decrypt: false});

        //then
        file.headCid = uri.cid;
        expect(result).toEqual(file);
    });

    it("store and read encrypted by URL", async () => {
        //given
        const data = randomBytes(20);
        const tags = [new Tag("some-key", "some-value")];
        const file = new File(data, tags);
        const dekPath = "test/piece/url";

        //when
        const uri = await (await testSubject).store(bucketId, file, {encrypt: true, dekPath: dekPath});
        const result = await (await testSubject).read(new URL(`http://test.com/ddc/buc/${uri.bucketId}/ipiece/${uri.cid}`), {decrypt: true, dekPath: dekPath});

        //then
        file.headCid = uri.cid;
        expect(result).toEqual(file);
    });


    it("store and read unencrypted big data", async () => {
        //given
        const data = randomBytes(100);
        const tags = [new Tag("some-key", "some-value")];
        const file = new File(data, tags);

        //when
        const uri = await (await testSubject).store(bucketId, file, {encrypt: false});
        const result = await (await testSubject).read(uri, {decrypt: false});

        //then
        let offset = 0;
        const expectedData = new Uint8Array(data.length);
        for await (const chunkData of result.dataReader()) {
            expectedData.set(chunkData, offset);
            offset += chunkData.length;
        }

        result.data = expectedData;
        file.headCid = uri.cid;
        expect(result).toEqual(file);
    });

    it("store and read encrypted big data", async () => {
        //given
        const data = randomBytes(100);
        const tags = [new Tag("some-key", "some-value")];
        const file = new File(data, tags);
        const dekPath = "test/piece";

        //when
        const uri = await (await testSubject).store(bucketId, file, {encrypt: true, dekPath: dekPath});
        const result = await (await testSubject).read(uri, {decrypt: true, dekPath: dekPath});

        //then
        let offset = 0;
        const expectedData = new Uint8Array(data.length);
        for await (const chunkData of result.dataReader()) {
            expectedData.set(chunkData, offset);
            offset += chunkData.length;
        }

        result.data = expectedData;
        file.headCid = uri.cid;
        expect(result).toEqual(file);
    });


    it("search data encrypted", async () => {
        //given
        const data = randomBytes(20);
        const key = randomUUID();
        const value = randomUUID();
        const file = new File(data, [new Tag(key, value)]);
        await (await testSubject).store(bucketId, file, {encrypt: true});

        //when
        const result = await (await testSubject).search(new Query(bucketId, [new Tag(key, value)], false));

        //then
        result.forEach(p => p.headCid = undefined);

        file.data = (await testSubject).caStorage.cipher!.encrypt(data, (await testSubject).masterDek);
        file.tags = [new Tag(key, value), new Tag("dekPath", "")]
        expect(result).toEqual([file]);
    });

    it("share data", async () => {
        //given
        const data = randomBytes(20);
        const file = new File(data);
        const dekPath = randomUUID();
        const pieceUri = await (await testSubject).store(bucketId, file, {encrypt: true, dekPath: dekPath});

        //when
        await (await testSubject).shareData(bucketId, dekPath, u8aToHex((await otherClient).boxKeypair.publicKey));
        const result = await (await otherClient).read(pieceUri, {decrypt: true, dekPath: dekPath});

        //then
        file.headCid = pieceUri.cid;
        file.tags = [new Tag("dekPath", dekPath)];
        expect(result).toEqual(file);
    });

    it("share data with high level key", async () => {
        //given
        const data = randomBytes(20);
        const file = new File(data);
        const highDekPath = "some";
        const fullDekPath = highDekPath + "/test/sub/path"
        const pieceUri = await (await testSubject).store(bucketId, file, {encrypt: true, dekPath: fullDekPath});

        //when
        await (await testSubject).shareData(bucketId, highDekPath, u8aToHex((await otherClient).boxKeypair.publicKey));
        const result = await (await otherClient).read(pieceUri, {decrypt: true, dekPath: highDekPath});

        //then
        file.headCid = pieceUri.cid;
        file.tags = [new Tag("dekPath", fullDekPath)]
        expect(result).toEqual(file);
    });

    it("search metadata", async () => {
        //given
        const data = randomBytes(20);
        const key = randomUUID();
        const value = randomUUID();
        const tags = [new Tag(key, value)];
        const file = new File(data, tags);
        const uri = await (await testSubject).store(bucketId, file, {encrypt: false});

        //when
        const result = await (await testSubject).search(new Query(bucketId, tags, true));

        //then
        file.headCid = uri.cid;
        file.data = new Uint8Array();
        expect(result).toEqual([file]);
    });
})