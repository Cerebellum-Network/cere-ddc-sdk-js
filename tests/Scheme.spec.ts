import { Scheme } from "@cere-ddc-sdk/core";
import {hexToU8a, stringToU8a} from "@polkadot/util";
import {sr25519Verify, waitReady} from "@polkadot/wasm-crypto";

describe("packages/core/src/crypto/signature/Scheme.ts", () => {
  beforeAll(async () => {
    await waitReady();
  });

  it("ed25519", async () => {
    let testSubject = await Scheme.createScheme(
        "ed25519",
        "0x9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"
    );

    //given
    const expectedSignature =
      "0x85f4460e723da28da7d20dad261d4e89737e0daf93b53954b638a1fc540eb33c620e9e49dba7c0ffd1b8c21ee66f0318e3f8ffa9dafd3c223fa645f9c8960a07";

    //when
    const signature = await testSubject.sign(stringToU8a("test_string"));

    //then
    expect(signature).toEqual(hexToU8a(expectedSignature));
  });

  it("sr25519", async () => {
    let testSubject = await Scheme.createScheme(
        "sr25519",
        "0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03"
    );

    //given
    const message = stringToU8a("hello");

    //when
    const signature = await testSubject.sign(message);

    //then
    expect(sr25519Verify(signature, message, hexToU8a(testSubject.publicKeyHex))).toBeTruthy()
  });
});
