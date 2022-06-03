import {CipherInterface} from "./Cipher.interface";

export class DefaultCipher implements CipherInterface {
    private readonly secretPhrase: string;

    constructor(secretPhrase: string) {
        this.secretPhrase = secretPhrase;
    }

    encrypt(data: Uint8Array, dek: string | Uint8Array): Uint8Array {
        return data
    }

    decrypt(data: Uint8Array, dek: string | Uint8Array): Uint8Array {
        return data
    }
}
