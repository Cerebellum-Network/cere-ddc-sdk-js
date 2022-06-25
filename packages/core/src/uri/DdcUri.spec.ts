import {DdcUri} from "./DdcUri.js";

describe("DDC Uri", () => {
    it("to string", async () => {
        checkDdcUri("/ddc/buc/123/ipiece/cid123", new DdcUri(123n, "ipiece", "cid123", ));
        checkDdcUri("/ddc/org/my_org/buc/my_bucket/ifile/cid123", new DdcUri("my_bucket", "ifile", "cid123", "my_org"));
        checkDdcUri("/ddc/org/my_org/buc/my_bucket/ifile/cid123?option=yes", new DdcUri("my_bucket", "ifile", "cid123", "my_org", "option=yes"));
        checkDdcUri("/ddc/org/my_org/buc/my_bucket/file/my_folder/image.png?option=yes", new DdcUri("my_bucket", "file", ["my_folder", "image.png"], "my_org", "option=yes"));
        checkDdcUri("/ddc/org/my_org/buc/my_bucket/file/", new DdcUri("my_bucket", "file", [""], "my_org"));
    });
});

function checkDdcUri(uri: string, ddcUri: DdcUri) {
    expect(ddcUri.toString()).toBe(uri)
}