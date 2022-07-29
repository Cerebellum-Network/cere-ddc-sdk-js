import {NaclCipher} from "./NaclCipher";
import {hexToU8a, u8aToHex} from "@polkadot/util";
import {blake2AsU8a} from "@polkadot/util-crypto";

describe("Nacl Cipher", () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const encryptedData = hexToU8a("0xf1c74e3988d5626a5587570478c2a078ae3ec95897");
    const dek = blake2AsU8a(new Uint8Array([1, 2]));
    const testSubject = new NaclCipher();

    it("encrypt with dek bytes", async () => {
        //when
        const result = testSubject.encrypt(data, dek);

        //then
        expect(result).toEqual(encryptedData)
    });

    it("encrypt with dek hex", async () => {
        //when
        const result = testSubject.encrypt(data, u8aToHex(dek));

        //then
        expect(result).toEqual(encryptedData)
    });

    it("decrypt with dek bytes", async () => {
        //when
        const result = testSubject.decrypt(encryptedData, dek);

        //then
        expect(result).toEqual(data)
    });

    it("decrypt with dek hex", async () => {
        //when
        const result = testSubject.decrypt(encryptedData, u8aToHex(dek));

        //then
        expect(result).toEqual(data)
    });

});
