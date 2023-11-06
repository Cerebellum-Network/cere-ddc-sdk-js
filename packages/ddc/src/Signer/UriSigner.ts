import {SignOptions, KeyringPair, KeyringOptions} from '@polkadot/keyring/types';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {Keyring} from '@polkadot/keyring';

import {Signer} from './Signer';

export type UriSignerOptions = Pick<KeyringOptions, 'type'>;

export class UriSigner implements Signer {
    private pair: KeyringPair;

    constructor(uri: string, options: UriSignerOptions = {type: 'sr25519'}) {
        this.pair = new Keyring({ss58Format: 54, type: options.type}).addFromUri(uri);
    }

    get type() {
        return this.pair.type;
    }

    get address() {
        return this.pair.address;
    }

    get publicKey() {
        return this.pair.publicKey;
    }

    sign(data: Uint8Array, options?: SignOptions) {
        return this.pair.sign(data, options);
    }

    static async create(uri: string, options: UriSignerOptions = {type: 'sr25519'}) {
        await cryptoWaitReady();

        return new UriSigner(uri, options);
    }
}
