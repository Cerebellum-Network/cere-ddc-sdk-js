import {CidBuilder} from "./CidBuilder";
import {stringToU8a} from "@cere-ddc-sdk/util";

describe("CID Builder", () => {
    let testSubject = new CidBuilder();

    it("build", async () => {
        //given
        let expectedCid =
            "bafkreigaknpexyvxt76zgkitavbwx6ejgfheup5oybpm77f3pxzrvwpfdi";

        //when
        let cid = testSubject.build(stringToU8a("Hello world!"));

        //then
        expect(cid).toBe(expectedCid);
    });
});
