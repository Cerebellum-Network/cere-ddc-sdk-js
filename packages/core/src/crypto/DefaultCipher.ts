import {CipherInterface} from "./Cipher.interface";

export class DefaultCipher implements CipherInterface {
    mnemonic: string;

    constructor(mnemonic: string) {
        this.mnemonic = mnemonic;
    }

    encrypt(data: Uint8Array, dek: string): Uint8Array {
        return data
    }

    decrypt(data: Uint8Array, dek: string): Uint8Array {
        return data
    }
}
