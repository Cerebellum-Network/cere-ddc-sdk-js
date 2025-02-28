import { Cipher } from './Cipher';

/**
 * Cipher that doesn't do any encryption or decryption and upload or download data as is.
 *
 * @group Ciphers
 * @extends Cipher
 * @example
 */
export class NoOpCipher implements Cipher {
  async isReady(): Promise<boolean> {
    return true;
  }

  async encrypt(data: Uint8Array, path?: string | undefined): Promise<Uint8Array> {
    return data;
  }

  async decrypt(encryptedData: Uint8Array, path?: string | undefined): Promise<Uint8Array> {
    return encryptedData;
  }
}
