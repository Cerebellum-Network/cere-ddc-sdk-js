import {KeyringPair} from '@polkadot/keyring/types';

export type SchemeName = 'sr25519' | 'ed25519';

export const isSchemeName = (val: unknown): val is SchemeName =>
    typeof val === 'string' && (val === 'sr25519' || val === 'ed25519');

export interface SchemeInterface {
    readonly name: SchemeName;
    readonly address: string;
    readonly publicKey: Uint8Array;
    readonly publicKeyHex: string;
    readonly pair: KeyringPair;

    sign(data: Uint8Array): Promise<Uint8Array>;
}
