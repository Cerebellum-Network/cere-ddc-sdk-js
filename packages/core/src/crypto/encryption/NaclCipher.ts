import {CipherInterface} from "./Cipher.interface.js";
import nacl from "tweetnacl";
import {naclDecrypt, naclEncrypt} from "@polkadot/util-crypto";
import {hexToU8a} from "@polkadot/util";

const emptyNonce = new Uint8Array(nacl.box.nonceLength);

export class NaclCipher implements CipherInterface {

    encrypt(data: Uint8Array, dek: string | Uint8Array): Uint8Array {
        if (typeof dek === "string") {
            dek = hexToU8a(dek);
        }

        const {encrypted} = naclEncrypt(data, dek, emptyNonce);

        return encrypted
    }

    decrypt(data: Uint8Array, dek: string | Uint8Array): Uint8Array {
        if (typeof dek === "string") {
            dek = hexToU8a(dek);
        }

        const result = naclDecrypt(data, emptyNonce, dek);

        if (result === null) {
            throw new Error("Can't decrypt data");
        }

        return result;
    }

}
