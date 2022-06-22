import {FileStorage, FileStorageConfig} from "./node.js"

describe("key-value-storage integration tests", () => {
    const url = "http://localhost:8080";
    const testSubject = FileStorage
        .build({clusterAddress: url, scheme: "ed25519"}, new FileStorageConfig(2, 1),
            "0x93e0153dc0f0bbee868dc00d8d05ddae260e01d418746443fa190c8eacd9544c");

    test("upload and read chunked data", async () => {
        //given
        const storage = await testSubject;
        const bucketId = 3n;
        const data = new Uint8Array([1, 2, 3, 4, 5]);

        //when
        const headPieceUri = await storage.upload(bucketId, data);
        const stream = await storage.read(bucketId, headPieceUri.cid);

        //then
        let result = [];
        const reader = stream.getReader();
        let chunk;
        while (!(chunk = await reader.read()).done) {
            expect(1).toEqual(chunk.value.length);
            result.push(...chunk.value);
        }

        expect(data).toEqual(new Uint8Array(result))
    });
});