import {ContentAddressableStorage, Piece, Tag, Link} from "./index"
import {Scheme} from "@cere-ddc-sdk/core"
import {
    Piece as PbPiece,
} from "@cere-ddc-sdk/proto";
import {u8aToHex} from "@polkadot/util";
import * as fs from 'fs/promises';
import * as path from 'path';

const VECTOR_FILE = "ddc-schemas/test-vectors/store-request-sdk-js-1.1.0.json";


describe("content-addressable-storage test vector", () => {
    const url = "http://localhost:8080";
    const testSubject = Scheme.createScheme(
        "ed25519",
        "0x93e0153dc0f0bbee868dc00d8d05ddae260e01d418746443fa190c8eacd9544c"
    ).then(scheme => new ContentAddressableStorage(scheme, url));

    test("store request", async () => {
        //given
        const storage = await testSubject;
        const tag = new Tag("some-key", "some-value");
        const link = new Link("some-cid", 11n, "some-name");
        const piece = new Piece(new Uint8Array([1, 2, 3]), [tag], [link]);
        const bucketId = 1n;

        //when
        await storage.store(bucketId, piece, dumpVector);
    });
});


async function dumpVector(pbPiece: PbPiece, body: Uint8Array, cid: string, pieceUri: string, method: string, httppath: string) {

    let request = {
        body: u8aToHex(body),
        cid,
        method,
        path: httppath,
        piece: PbPiece.toJson(pbPiece),
        pieceUri,
    }

    let requestJson = JSON.stringify(request, null, 4);
    await fs.mkdir(path.dirname(VECTOR_FILE), {recursive: true});
    await fs.writeFile(VECTOR_FILE, requestJson);
    console.log("Generated vector file", VECTOR_FILE);
}
