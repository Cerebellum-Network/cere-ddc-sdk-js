import type { IKeyringPair } from '@polkadot/types/types';
import type { KeyringPair } from '@polkadot/keyring/types';

export type SignerType = KeyringPair['type'];

export interface Signer extends IKeyringPair {
  readonly type: SignerType;

  isReady(): Promise<boolean>;
}
