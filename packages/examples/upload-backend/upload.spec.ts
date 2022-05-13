import { FileApi } from "./FileSource";

describe("CID Builder", () => {

    const setup = () => {
        const gatewayUrl = "blah";
        const scheme = "blah";
        const bucketId = 1n;
        const api = FileApi(gatewayUrl, scheme);

        // TODO: setup local mock DDC nodes

        return api.upload(bucketId);
    }
    
    const upload = setup();

    it("upload test", async () => {

        const fileName = "mytest.input.txt";
        // TODO: create file "mytest.input.txt"
        // ...

        const cid = await upload(fileName);

        // TODO: download from cid
        // TODO: verify

    });
});
