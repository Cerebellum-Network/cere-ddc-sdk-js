import type {IKeyringPair} from '@polkadot/types/types';
import type {KeyringPair} from '@polkadot/keyring/types';

export type SignerType = KeyringPair['type'];

/**
 * TODO: Eraly concept to cover CNS signatures. Need to revice it when more usecases avalilable. We probably better move it into the new blockchain pacakge being developed in parallel
 */
export interface Signer extends Pick<IKeyringPair, 'address' | 'publicKey' | 'sign'> {
    readonly type: SignerType;

    isReady(): Promise<boolean>;
}
