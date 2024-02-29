import { Signer as BlockchainSigner } from '@polkadot/types/types';
import type { KeyringPair } from '@polkadot/keyring/types';

export type SignerType = KeyringPair['type'];

/**
 * This abstract class provides a blueprint for creating different types of signers.
 *
 * @group Signers
 * @example
 *
 * ```typescript
 * class MySigner extends Signer {
 *   // Implement abstract properties and methods...
 * }
 *
 * const mySigner = new MySigner();
 * const isReady = await mySigner.isReady();
 * console.log(isReady);
 * ```
 */
export abstract class Signer {
  /**
   * The type of the signer ('ed25519' or 'sr25519').
   */
  abstract readonly type: SignerType;

  /**
   * The address of the signer.
   */
  abstract readonly address: string;

  /**
   * The public key of the signer.
   */
  abstract readonly publicKey: Uint8Array;

  /**
   * Gets blockchain the signer.
   *
   * @internal
   * @returns A promise that resolves to the signer.
   */
  abstract getSigner(): Promise<BlockchainSigner>;

  /**
   * Checks if the signer is ready.
   * @returns A promise that resolves to a boolean indicating whether the signer is ready.
   */
  abstract isReady(): Promise<boolean>;

  /**
   * Signs data with the signer.
   *
   * @param data - The data to sign.
   * @returns A promise that resolves to the signature.
   */
  abstract sign(data: Uint8Array | string): Promise<Uint8Array>;

  /**
   * Checks if an object is a signer.
   *
   * @param signer - The object to check.
   * @returns A boolean indicating whether the object is a signer.
   */
  static isSigner(signer: unknown): signer is Signer {
    if (!signer || typeof signer !== 'object') {
      return false;
    }

    return signer instanceof Signer || ('isReady' in signer && 'sign' in signer && 'getSigner' in signer);
  }
}
