import {DdcUri, FILE, IFILE, IPIECE} from "./DdcUri.js";
import {DdcUriParser} from "./DdcUriParser.js";

describe("DDC Uri", () => {
    it("to string", async () => {
        checkDdcUriParser("/ddc/buc/123/ipiece/cid123", new DdcUri(123n, "cid123", IPIECE));
        checkDdcUriParser("/ddc/org/my_org/buc/my_bucket/ifile/cid123", new DdcUri("my_bucket", "cid123", IFILE, "my_org"));
        checkDdcUriParser("/ddc/org/my_org/buc/my_bucket/ifile/cid123?option=yes", new DdcUri("my_bucket", "cid123", IFILE, "my_org", "option=yes"));
        checkDdcUriParser("/ddc/org/my_org/buc/my_bucket/file/my_folder/image.png?option=yes", new DdcUri("my_bucket", ["my_folder", "image.png"], FILE, "my_org", "option=yes"));
    });
});

function checkDdcUriParser(url: string, ddcUri: DdcUri) {
    expect(DdcUriParser.parse(url).toString()).toEqual(ddcUri.toString());
}