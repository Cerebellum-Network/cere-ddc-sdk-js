import { Scheme } from "./Scheme";
import {stringToU8a} from "@cere-ddc-sdk/util";

describe("Scheme", () => {
  let testSubject = new Scheme(
    "sr25519",
    "0x500c89905aba00fc5211a2876b6105001ad8c77218b37b649ee38b4996e0716d6d5c7e03bbedbf39ca3588b5e6e0768e70a4507cd9e089f625929f9efae051f2"
  );

  it("sr25519", async () => {
    //given
    let expectedSignature =
      "0x92d20f82f149976ac58c67425368cd45940418b770bd1c19b777057c10a6fc662bf250fc587df78bf0150dec9c3219c42dbeb5e531714ad2800814482ddac887";

    //when
    let signature = testSubject.sign(stringToU8a("hello"));

    //then
    expect(signature).toBe(expectedSignature);
  });
});
