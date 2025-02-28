import { Cipher } from './Cipher';

/**
 * Cipher that uses XOR bitwise operator to encrypt and decrypt messages.
 *
 * @group Ciphers
 * @extends Cipher
 * @example
 *
 * ```typescript
 * const cereWalletCipher = new XorCipher(42);
 * const encryptedData = await cereWalletCipher.encrypt(new TextEncoder().encode('data'));
 * console.log(encryptedData);
 *
 * const data = await cereWalletCipher.decrypt(new TextEncoder().encode('NK^K'));
 * console.log(data);
 * ```
 */
export class XorCipher implements Cipher {
  constructor(private key: number) {
    if (!Number.isInteger(key) || key < 0 || key > 255) {
      throw new Error('XorCipher key must be an integer between 0 and 255');
    }
  }

  async isReady(): Promise<boolean> {
    return true;
  }

  async encrypt(data: Uint8Array, path?: string | undefined): Promise<Uint8Array> {
    return this.xor(data);
  }

  async decrypt(encryptedData: Uint8Array, path?: string | undefined): Promise<Uint8Array> {
    return this.xor(encryptedData);
  }

  private xor(data: Uint8Array): Uint8Array {
    return new Uint8Array(data.map((byte) => byte ^ this.key));
  }
}
