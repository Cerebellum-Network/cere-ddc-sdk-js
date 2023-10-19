import {Keyring} from '@polkadot/keyring';
import {KeyringPair} from '@polkadot/keyring/types';
import {u8aToHex} from '@polkadot/util';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {SchemeInterface, SchemeName} from './Scheme.interface';

export class Scheme implements SchemeInterface {
    private readonly pair: KeyringPair;

    readonly name: SchemeName;
    readonly address: string;

    private constructor(keyringPair: KeyringPair, name: SchemeName) {
        this.pair = keyringPair;
        this.name = name;
        this.address = keyringPair.address;
    }

    static async createScheme(schemeName: SchemeName, secretPhrase: string): Promise<Scheme> {
        if (schemeName != 'sr25519' && schemeName != 'ed25519') {
            throw new Error(`Unsupported scheme name='${schemeName}'`);
        }

        await cryptoWaitReady();

        const keyring = new Keyring({type: schemeName, ss58Format: 54});
        let keyringPair;
        try {
            keyringPair = keyring.addFromMnemonic(secretPhrase);
        } catch (err) {
            throw new Error(`Couldn't create scheme with current secretPhrase`);
        }

        return new Scheme(keyringPair, schemeName);
    }

    get publicKey() {
        return this.pair.publicKey;
    }

    get publicKeyHex() {
        return u8aToHex(this.pair.publicKey);
    }

    async sign(data: Uint8Array) {
        assertSafeMessage(data);

        return this.pair.sign(data);
    }
}

// Validate that the signed data does not conflict with the blockchain extrinsics.
export function assertSafeMessage(data: Uint8Array) {
    // Encoded extrinsics start with the pallet index; reserve up to 48 pallets.
    // Make ASCII "0" the smallest first valid byte.
    if (data[0] < 48) {
        throw new Error('data unsafe to sign');
    }
}
