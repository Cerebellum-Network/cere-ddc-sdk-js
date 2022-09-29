import {ContentAddressableStorage, Piece, Tag, SearchType, Link} from "./index"
import {
    Piece as PbPiece,
} from "@cere-ddc-sdk/proto";
import {u8aToHex, hexToU8a} from "@polkadot/util";
import * as fs from 'fs/promises';
import * as path from 'path';

// To generate a new version of the test vector, change the filename, re-run
// the test, and commit the new value in the ddc-schemas repo (git submodule).
const VECTOR_FILE = "ddc-schemas/test-vectors/store-request-sdk-js-1.2.9.json";

const fakeTimestamp = new Date('2022-01-01');


describe("content-addressable-storage test vector", () => {
    jest.useFakeTimers().setSystemTime(fakeTimestamp);
    const url = "http://localhost:8080";
    const testSubject = ContentAddressableStorage
        .build({
            clusterAddress: url,
            scheme: "ed25519",
        }, "0x93e0153dc0f0bbee868dc00d8d05ddae260e01d418746443fa190c8eacd9544c");

    test("store request", async () => {
        //given
        const storage = await testSubject;
        const tag = new Tag("some-key", "some-value", SearchType.NOT_SEARCHABLE);
        const link = new Link("some-cid", 11n, "some-name");
        const piece = new Piece(new Uint8Array([1, 2, 3]), [tag], [link]);
        const bucketId = 1n;

        //when
        const request: any = await storage.buildStoreRequest(bucketId, piece, new Uint8Array());
        // @ts-ignore
        request.piece = PbPiece.toJson(piece.toProto(bucketId));

        // Re-generate the test vector if it does not exist.
        await writeVectorIfNotExists(request);

        //then
        const requestExpect = await readVector();

        request.piece = null; // No need to test the JSON form.
        request.timestamp = fakeTimestamp;
        requestExpect.piece = null;
        expect(request).toEqual(requestExpect);
    });
});


async function writeVectorIfNotExists(request: any) {
    const exists = await fs.stat(VECTOR_FILE).catch(() => false);
    if(!exists) {
        const requestJson = JSON.stringify(
            Object.assign({}, request, {
                body: u8aToHex(request.body),
                timestamp: fakeTimestamp
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
    request.timestamp = new Date(request.timestamp);
    return request;
}
