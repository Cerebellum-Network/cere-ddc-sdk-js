import {Keyring} from '@polkadot/keyring';
import {KeyringPair} from '@polkadot/keyring/types';
import {u8aToHex} from '@polkadot/util';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {SchemeInterface, SchemeName} from './Scheme.interface';

export class Scheme implements SchemeInterface {
    private readonly keyringPair: KeyringPair;
    name: SchemeName;
    address: string;

    private constructor(keyringPair: KeyringPair, name: SchemeName) {
        this.keyringPair = keyringPair;
        this.name = name;
        this.address = keyringPair.address;
    }

    static async createScheme(schemeName: SchemeName, secretPhrase: string): Promise<Scheme> {
        if (schemeName != 'sr25519' && schemeName != 'ed25519') {
            throw new Error(`Unsupported scheme name='${schemeName}'`);
        }

        await cryptoWaitReady();

        const keyring = new Keyring({type: schemeName});
        let keyringPair;
        try {
            keyringPair = keyring.addFromMnemonic(secretPhrase);
        } catch (err) {
            throw new Error(`Couldn't create scheme with current secretPhrase`);
        }
        return new Scheme(keyringPair, schemeName);
    }

    get publicKey(): Uint8Array {
        return this.keyringPair.publicKey;
    }

    get publicKeyHex(): string {
        return u8aToHex(this.keyringPair.publicKey);
    }

    async sign(data: Uint8Array): Promise<Uint8Array> {
        assertSafeMessage(data);
        return Promise.resolve(this.keyringPair.sign(data));
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
