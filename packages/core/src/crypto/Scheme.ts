import {Keyring} from "@polkadot/keyring";
import {KeyringPair} from "@polkadot/keyring/types";
import {hexToU8a, u8aToHex} from "@polkadot/util";
import {waitReady} from "@polkadot/wasm-crypto";
import {SchemeInterface} from "./Scheme.interface";

export class Scheme implements SchemeInterface {
    keyringPair: KeyringPair;
    name: string;
    publicKeyHex: string;

    constructor(keyringPair: KeyringPair, name: string, publicKeyHex: string) {
        this.keyringPair = keyringPair;
        this.name = name;
        this.publicKeyHex = publicKeyHex;
    }

    static async createScheme(scheme: "sr25519" | "ed25519", seedHex: string): Promise<Scheme> {
        if (scheme != "sr25519" && scheme != "ed25519") {
            throw new Error("Unsupported scheme");
        }
        let seed;
        try {
            seed = hexToU8a(seedHex);
        } catch (err) {
            throw new Error("Couldn't parse to bytes seed hex");
        }

        await waitReady()

        const keyring = new Keyring({type: scheme});
        let keyringPair;
        try {
            keyringPair = keyring.addFromSeed(seed);
        } catch (err) {
            throw new Error(`Couldn't create scheme. Seed size should be 32 bytes`)
        }

        return new Scheme(keyringPair, scheme, u8aToHex(keyring.publicKeys[0]));
    }

    async sign(data: Uint8Array): Promise<string> {
        return Promise.resolve(u8aToHex(this.keyringPair.sign(data)));
    }
}
