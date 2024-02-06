import { Signer as BcSigner } from '@polkadot/types/types';
import type { KeyringPair } from '@polkadot/keyring/types';

export type SignerType = KeyringPair['type'];

export abstract class Signer {
  abstract readonly type: SignerType;
  abstract readonly address: string;
  abstract readonly publicKey: Uint8Array;

  abstract isReady(): Promise<boolean>;
  abstract sign(data: Uint8Array | string): Promise<Uint8Array>;
  abstract getSigner(): Promise<BcSigner>;

  static isSigner(signer: unknown): signer is Signer {
    if (!signer || typeof signer !== 'object') {
      return false;
    }

    return signer instanceof Signer || ('isReady' in signer && 'sign' in signer);
  }
}
