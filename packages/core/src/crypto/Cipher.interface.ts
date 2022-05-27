export interface CipherInterface {
    encrypt(data: Uint8Array, dek: string): Uint8Array

    decrypt(data: Uint8Array, dek: string): Uint8Array
}
