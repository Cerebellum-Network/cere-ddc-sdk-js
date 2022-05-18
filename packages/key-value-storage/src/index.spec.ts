import {KeyValueStorage} from "./index"
import {Scheme} from "@cere-ddc-sdk/core";
import {Piece} from "@cere-ddc-sdk/content-addressable-storage";

describe("key-value-storage integration tests", () => {
    const url = "http://localhost:8080";
    const testSubject = Scheme.createScheme(
        "ed25519",
        "0x93e0153dc0f0bbee868dc00d8d05ddae260e01d418746443fa190c8eacd9544c"
    ).then(scheme => new KeyValueStorage(scheme, url));

    test("upload and read by key", async () => {
        //given
        const storage = await testSubject;
        const data = new Uint8Array([1, 2, 3])
        const bucketId = 2n;
        const key = "keyValue";

        //when
        await storage.store(bucketId, key, new Piece(data));
        const storedPieces = await storage.read(bucketId, key);

        //then
        expect(storedPieces).toEqual([new Piece(data)]);
    });
});