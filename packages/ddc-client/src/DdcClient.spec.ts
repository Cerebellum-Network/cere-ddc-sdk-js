import {DdcClient} from "./DdcClient";
import {PieceArray} from "./model/PieceArray";
import {Tag} from "@cere-ddc-sdk/content-addressable-storage";
import {ClientOptions} from "./options/ClientOptions";
import {randomBytes} from "tweetnacl";


describe("DDC client integration tests", () => {
    const secretPhrase = "thought lizard above company tape post nice rack depth appear equal equip";
    const bucketId = 1n;
    const options = {clusterAddress: "http://localhost:8080"}
    const testSubject = DdcClient.buildAndConnect(secretPhrase, options);

    it("store and read unecrypted data", async () => {
        //given
        const data = new Uint8Array(randomBytes(100))
        const tags = [new Tag("some-key", "some-value")]
        const pieceArray = new PieceArray(data, tags)

        //when
        const uri = await (await testSubject).store(bucketId, pieceArray, {encrypt: false});
        const result = await (await testSubject).read(uri, {decrypt: false});

        //then
        pieceArray.cid = uri.cid
        expect(result).toEqual(pieceArray);
    });
})