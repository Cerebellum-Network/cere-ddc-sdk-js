import {Keyring} from "@polkadot/keyring";
import {KeyringPair} from "@polkadot/keyring/types";
import {u8aToHex} from "@polkadot/util";
import {waitReady} from "@polkadot/wasm-crypto";
import {SchemeInterface, SchemeName} from "./Scheme.interface.js";

export class Scheme implements SchemeInterface{
    keyringPair: KeyringPair;
    name: SchemeName;
    publicKeyHex: string;

    private constructor(keyringPair: KeyringPair, name: SchemeName, publicKeyHex: string) {
        this.keyringPair = keyringPair;
        this.name = name;
        this.publicKeyHex = publicKeyHex;
    }

    static async createScheme(schemeName: SchemeName, secretPhrase: string): Promise<Scheme> {
        if (schemeName != "sr25519" && schemeName != "ed25519") {
            throw new Error(`Unsupported scheme name='${schemeName}'`);
        }

        await waitReady();

        const keyring = new Keyring({type: schemeName});
        let keyringPair;
        try {
            keyringPair = keyring.addFromMnemonic(secretPhrase);
        } catch (err) {
            throw new Error(`Couldn't create scheme with current secretPhrase`)
        }

        return new Scheme(keyringPair, schemeName, u8aToHex(keyring.publicKeys[0]));
    }

    async sign(data: Uint8Array): Promise<string> {
        return Promise.resolve(u8aToHex(this.keyringPair.sign(data)));
    }
}
