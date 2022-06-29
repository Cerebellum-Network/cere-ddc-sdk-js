import {SignerPayloadRaw, SignerResult} from "@polkadot/types/types/extrinsic";
import {SchemeInterface, SchemeName} from "./Scheme.interface.js";
import {assertSafeMessage} from "./Scheme.interface.js";
import {u8aToHex} from "@polkadot/util";
import {InjectedAccount} from "@polkadot/extension-inject/types";
import {waitReady} from "@polkadot/wasm-crypto";
import {decodeAddress} from "@polkadot/util-crypto";
import {web3FromAddress} from "@polkadot/extension-dapp";

export class PolkadotDappScheme implements SchemeInterface {
    readonly name: SchemeName = "sr25519"

    private constructor(
        readonly publicKeyHex: string,
        readonly address: string,
        readonly signRaw: (raw: SignerPayloadRaw) => Promise<SignerResult>
    ) {
    }

    static async createScheme(account: InjectedAccount): Promise<PolkadotDappScheme> {
        await waitReady();

        let injector = await web3FromAddress(account.address);
        let signRaw = injector.signer.signRaw;

        if (!signRaw) {
            throw Error("Failed to initialize scheme");
        }

        let publicKeyHex = u8aToHex(decodeAddress(account.address));
        return new PolkadotDappScheme(publicKeyHex, account.address, signRaw);
    }


    async sign(data: Uint8Array): Promise<string> {
        assertSafeMessage(data);

        const {signature} = await this.signRaw({
            address: this.address,
            data: u8aToHex(data),
            type: 'bytes'
        });

        return signature;
    }
}
