import {FileStorage, FileStorageConfig} from "@cere-ddc-sdk/file-storage"

describe("File storage integration tests", () => {
    const url = "http://localhost:8080";
    let storage: FileStorage;

    beforeAll(async () => {
        storage = await FileStorage
            .build({clusterAddress: url, scheme: "sr25519"}, new FileStorageConfig(2, 1),
                "0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03");
    });

    test("upload and read chunked data", async () => {
        //given
        const bucketId = 3n;
        const data = new Uint8Array([1, 2, 3, 4, 5]);

        //when
        const headPieceUri = await storage.upload(bucketId, data, []);
        const stream = await storage.read(bucketId, headPieceUri.cid, new Uint8Array());

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
