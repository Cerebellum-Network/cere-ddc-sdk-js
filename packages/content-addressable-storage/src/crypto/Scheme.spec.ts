import { Scheme } from "./Scheme";
import {stringToU8a} from "@cere-ddc-sdk/util";

describe("Scheme", () => {

  it("ed25519", async () => {
    let testSubject = await Scheme.createScheme(
        "ed25519",
        "0x93e0153dc0f0bbee868dc00d8d05ddae260e01d418746443fa190c8eacd9544c"
    );

    //given
    let expectedSignature =
      "0x52adce265ce10b8e7b5da97dc296d3f2e058c200643fab391dc9180c25ccf2d05e00a6660658151ea70974aaeec11ea04f476984423b3a8e67d1ab5d4354fe06";

    //when
    let signature = await testSubject.sign(stringToU8a("hello"));

    //then
    expect(signature).toBe(expectedSignature);
  });
});
