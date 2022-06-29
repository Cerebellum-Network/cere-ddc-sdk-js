import {ContentAddressableStorage, Piece} from "./index.js"
import {u8aToHex, hexToU8a} from "@polkadot/util";
import * as fs from 'fs/promises';
import * as path from 'path';

// To generate a new version of the test vector, change the filename, re-run
// the test, and commit the new value in the ddc-schemas repo (git submodule).
const VECTOR_FILE = "ddc-schemas/test-vectors/store-request-sdk-js-1.2.8.json";


describe("content-addressable-storage test vector", () => {
    const url = "http://localhost:8080";
    const testSubject = ContentAddressableStorage
        .build({
            clusterAddress: url,
            scheme: "ed25519",
        }, "0x93e0153dc0f0bbee868dc00d8d05ddae260e01d418746443fa190c8eacd9544c");

    test("store request", async () => {
        //given
        const storage = await testSubject;
        const piece = new Piece(new Uint8Array([1, 2, 3]));
        const bucketId = 1n;

        //when
        const request = await storage.buildStoreRequest(bucketId, piece);

        // Re-generate the test vector if it does not exist.
        await writeVectorIfNotExists(request);

        //then
        const requestExpect = await readVector();

        expect(request).toStrictEqual(requestExpect);
    });
});


async function writeVectorIfNotExists(request: any) {
    const exists = await fs.stat(VECTOR_FILE).catch(() => false);
    if(!exists) {
        const requestJson = JSON.stringify(
            Object.assign({}, request, {
                body: u8aToHex(request.body),
            }),
            null, 4);
        await fs.mkdir(path.dirname(VECTOR_FILE), {recursive: true});
        await fs.writeFile(VECTOR_FILE, requestJson);
        console.log("Generated vector file", VECTOR_FILE);
    }
}

async function readVector(): Promise<any> {
    const requestJson = await fs.readFile(VECTOR_FILE, {encoding: "utf-8"});
    const request = JSON.parse(requestJson);
    request.body = hexToU8a(request.body);
    return request;
}
