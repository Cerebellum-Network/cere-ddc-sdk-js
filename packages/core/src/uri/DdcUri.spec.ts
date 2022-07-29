import {DdcUri, FILE, IFILE, IPIECE} from "./DdcUri";

describe("DDC Uri", () => {
    it("to string", async () => {
        checkDdcUri("/ddc/buc/123/ipiece/cid123", new DdcUri(123n, "cid123", IPIECE));
        checkDdcUri("/ddc/org/my_org/buc/my_bucket/ifile/cid123", new DdcUri("my_bucket", "cid123", IFILE, "my_org"));
        checkDdcUri("/ddc/org/my_org/buc/my_bucket/ifile/cid123?option=yes", new DdcUri("my_bucket", "cid123", IFILE, "my_org", "option=yes"));
        checkDdcUri("/ddc/org/my_org/buc/my_bucket/file/my_folder/image.png?option=yes", new DdcUri("my_bucket", ["my_folder", "image.png"], FILE, "my_org", "option=yes"));
        checkDdcUri("/ddc/org/my_org/buc/my_bucket/file/", new DdcUri("my_bucket", [""], FILE, "my_org"));
    });
});

function checkDdcUri(uri: string, ddcUri: DdcUri) {
    expect(ddcUri.toString()).toBe(uri)
}
