import {Keyring} from "@polkadot/keyring";
import {KeyringPair} from "@polkadot/keyring/types";
import {u8aToHex} from "@polkadot/util";
import {waitReady} from "@polkadot/wasm-crypto";
import {SchemeInterface} from "./Scheme.interface";

export type SchemeType = "sr25519" | "ed25519"

export class Scheme implements SchemeInterface{
    keyringPair: KeyringPair;
    name: string;
    publicKeyHex: string;

    constructor(keyringPair: KeyringPair, name: string, publicKeyHex: string) {
        this.keyringPair = keyringPair;
        this.name = name;
        this.publicKeyHex = publicKeyHex;
    }

    static async createScheme(scheme: SchemeType, seedHex: string): Promise<Scheme> {
        if (scheme != "sr25519" && scheme != "ed25519") {
            throw new Error("Unsupported scheme");
        }

        await waitReady()

        let keyring = new Keyring({type: scheme})
        let keyringPair = keyring.addFromMnemonic(seedHex)

        return new Scheme(keyringPair, scheme, u8aToHex(keyring.publicKeys[0]))
    }

    async sign(data: Uint8Array): Promise<string> {
        return Promise.resolve(u8aToHex(this.keyringPair.sign(data)));
    }
}
