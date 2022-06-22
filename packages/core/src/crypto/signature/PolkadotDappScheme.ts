import {SignerPayloadRaw, SignerResult} from "@polkadot/types/types/extrinsic";
import {SchemeInterface, SchemeName} from "./Scheme.interface.js";
import {u8aToHex} from "@polkadot/util";
import {InjectedAccount} from "@polkadot/extension-inject/types";
import {waitReady} from "@polkadot/wasm-crypto";
import {decodeAddress} from "@polkadot/util-crypto";
import {web3FromAddress} from "@polkadot/extension-dapp";

/**
 * Browser only
 */
export class PolkadotDappScheme implements SchemeInterface {
    name: SchemeName
    publicKeyHex: string
    address: string
    signRaw: (raw: SignerPayloadRaw) => Promise<SignerResult>;

    private constructor(
        publicKeyHex: string,
        address: string,
        signRaw: (raw: SignerPayloadRaw) => Promise<SignerResult>,
        name: SchemeName
    ) {
        this.publicKeyHex = publicKeyHex;
        this.address = address;
        this.signRaw = signRaw;
        this.name = name;
    }

    static async createScheme(account: InjectedAccount): Promise<PolkadotDappScheme> {
        if (account.type != "sr25519" && account.type != "ed25519") {
            throw new Error(`Unsupported scheme name='${account.type}'`);
        }

        await waitReady();

        let injector = await web3FromAddress(account.address);
        let signRaw = injector.signer.signRaw;

        if (!signRaw) {
            throw Error("Failed to initialise scheme");
        }

        let publicKeyHex = u8aToHex(decodeAddress(account.address));
        return new PolkadotDappScheme(publicKeyHex, account.address, signRaw, account.type);
    }


    async sign(data: Uint8Array): Promise<string> {
        const {signature} = await this.signRaw({
            address: this.address,
            data: u8aToHex(data),
            type: 'bytes'
        });

        return signature;
    }
}
