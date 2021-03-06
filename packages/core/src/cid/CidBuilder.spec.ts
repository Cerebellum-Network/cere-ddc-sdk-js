import {CidBuilder} from "./CidBuilder";
import {stringToU8a} from "@polkadot/util";

describe("CID Builder", () => {
    let testSubject = new CidBuilder();

    it("build", async () => {
        //given
        let expectedCid =
            "bafk2bzacea73ycjnxe2qov7cvnhx52lzfp6nf5jcblnfus6gqreh6ygganbws";

        //when
        let cid = await testSubject.build(stringToU8a("Hello world!"));

        //then
        expect(cid).toBe(expectedCid);
    });
});
