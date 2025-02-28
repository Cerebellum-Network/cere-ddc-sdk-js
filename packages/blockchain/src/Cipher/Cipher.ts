/**
 * This interface provides a blueprint for creating different types of ciphers.
 *
 * @group Ciphers
 * @example
 *
 * const message = '';
 * const xorCipher = new XorCipher();
 * const isReady = await xorCipher.isReady();
 * console.log(isReady);
 * ```
 */
export interface Cipher {
  isReady(): Promise<boolean>;
  encrypt(data: Uint8Array, path?: string): Promise<Uint8Array>;
  decrypt(encryptedData: Uint8Array, path?: string): Promise<Uint8Array>;
}
