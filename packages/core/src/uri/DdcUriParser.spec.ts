import {DdcUri} from "./DdcUri.js";
import {DdcUriParser} from "./DdcUriParser.js";

describe("DDC Uri", () => {
    it("to string", async () => {
        checkDdcUriParser("/ddc/buc/123/ipiece/cid123", new DdcUri(123n, "ipiece", "cid123"));
        checkDdcUriParser("/ddc/org/my_org/buc/my_bucket/ifile/cid123", new DdcUri("my_bucket", "ifile", "cid123", "my_org"));
        checkDdcUriParser("/ddc/org/my_org/buc/my_bucket/ifile/cid123?option=yes", new DdcUri("my_bucket", "ifile", "cid123", "my_org", "option=yes"));
        checkDdcUriParser("/ddc/org/my_org/buc/my_bucket/file/my_folder/image.png?option=yes", new DdcUri("my_bucket", "file", ["my_folder", "image.png"], "my_org", "option=yes"));
    });
});

function checkDdcUriParser(url: string, ddcUri: DdcUri) {
    const parser = new DdcUriParser();
    expect(parser.parse(url)).toEqual(ddcUri);
}