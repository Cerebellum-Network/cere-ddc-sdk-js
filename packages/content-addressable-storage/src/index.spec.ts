import {ContentAddressableStorage, Piece, Query} from "./index.js"


describe("content-addressable-storage integration tests", () => {
    const url = "http://localhost:8080";
    const testSubject = ContentAddressableStorage
        .build({
            clusterAddress: url,
            scheme: "ed25519",
        }, "0x93e0153dc0f0bbee868dc00d8d05ddae260e01d418746443fa190c8eacd9544c");


    test("upload and read", async () => {
        //given
        const storage = await testSubject;
        const piece = new Piece(new Uint8Array([1, 2, 3]));
        const bucketId = 1n;

        //when
        const uri = await storage.store(bucketId, piece);
        const storedPiece = await storage.read(bucketId, uri.cid);

        //then
        piece.cid = "bafk2bzacecapv4eqjea5eznq5rksnltctqp5iff6scxejhhhlypqoo24fokyi"
        expect(storedPiece).toStrictEqual(piece);
    });

    test("search", async () => {
        //given
        const storage = await testSubject;
        const tags = [{key: "testKey", value: "testValue"}]
        const bucketId = 1n;
        const piece = new Piece(new Uint8Array([1, 2, 3]), tags);
        await storage.store(bucketId, piece);

        //when
        const searchResult = await storage.search(new Query(bucketId, tags));

        //then
        piece.cid = "bafk2bzacechpzp7rzthbhnjyxmkt3qlcyc24ruzormtvmnvdp5dsvjubh7vcc"
        expect(searchResult.pieces).toStrictEqual([piece]);
    });
});