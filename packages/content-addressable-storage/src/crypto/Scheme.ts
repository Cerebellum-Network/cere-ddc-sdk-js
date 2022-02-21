import {Keyring} from "@polkadot/keyring";
import {KeyringPair} from "@polkadot/keyring/types";
import {hexToU8a, u8aToHex} from "@cere-ddc-sdk/util";

export class Scheme {
    keyRing: KeyringPair;
    name: string;
    publicKeyHex: string;

    constructor(scheme: string, privateKeyHex: string) {
        if (scheme != "sr25519" && scheme != "ed25519") {
            throw new Error("Unsupported scheme");
        }

        let keyring = new Keyring({type: scheme});
        this.keyRing = keyring.addFromSeed(hexToU8a(privateKeyHex));
        this.name = scheme;
        this.publicKeyHex = u8aToHex(keyring.publicKeys[0]);
    }

    sign(data: Uint8Array): string {
        return u8aToHex(this.keyRing.sign(data));
    }
}
