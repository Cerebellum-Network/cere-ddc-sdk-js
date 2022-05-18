import {ContentAddressableStorage, Piece, Query} from "./index"
import {Scheme} from "@cere-ddc-sdk/core"


describe("content-addressable-storage integration tests", () => {
    const url = "http://localhost:8080";
    const testSubject = Scheme.createScheme(
        "ed25519",
        "0x93e0153dc0f0bbee868dc00d8d05ddae260e01d418746443fa190c8eacd9544c"
    ).then(scheme => new ContentAddressableStorage(scheme, url));

    test("upload and read", async () => {
        //given
        const storage = await testSubject;
        const piece = new Piece(new Uint8Array([1, 2, 3]));
        const bucketId = 1n;

        //when
        const uri = await storage.store(bucketId, piece);
        const storedPiece = await storage.read(bucketId, uri.cid);

        //then
        expect(storedPiece).toStrictEqual(piece);
    });

    test("search", async () => {
        //given
        const storage = await testSubject;
        const tags = [{key: "testKey", value:"testValue"}]
        const bucketId = 1n;
        const piece = new Piece(new Uint8Array([1, 2, 3]), tags);
        await storage.store(bucketId, piece);

        //when
        const searchResult = await storage.search(new Query(bucketId, tags));

        //then
        expect(searchResult.pieces).toStrictEqual([piece]);
    });
});