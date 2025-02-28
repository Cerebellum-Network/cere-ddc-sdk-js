import type { EmbedWallet } from '@cere/embed-wallet';
import { Cipher } from './Cipher';

/**
 * Cipher that uses Cere Wallet to encrypt and decrypt messages.
 *
 * @group Ciphers
 * @extends Cipher
 * @example
 *
 * ```typescript
 * import { EmbedWallet } from '@cere/embed-wallet';
 *
 * const cereWallet = new EmbedWallet({ env: 'dev' });
 * await cereWallet.init();
 *
 * const cereWalletCipher = new CereWalletCipher(cereWallet);
 * const encryptedData = await cereWalletCipher.encrypt(new TextEncoder().encode('data'));
 * console.log(encryptedData);
 *
 * const data = await cereWalletCipher.decrypt(new TextEncoder().encode('kasf1ase3'));
 * console.log(data);
 * ```
 */
export class CereWalletCipher implements Cipher {
  constructor(private wallet: EmbedWallet) {}

  async isReady() {
    await this.wallet.isConnected;
    return true;
  }

  async encrypt(data: Uint8Array, path?: string): Promise<Uint8Array> {
    return new TextEncoder().encode(await this.wallet.naclSecretbox(new TextDecoder().decode(data), path));
  }

  async decrypt(encryptedData: Uint8Array, path?: string): Promise<Uint8Array> {
    return new TextEncoder().encode(await this.wallet.naclSecretboxOpen(new TextDecoder().decode(encryptedData), path));
  }
}
