import {web3FromAddress} from "@polkadot/extension-dapp";
import {SignerPayloadRaw, SignerResult} from "@polkadot/types/types/extrinsic";
import {SchemeInterface} from "./Scheme.interface";
import {u8aToHex} from "@polkadot/util";
import {InjectedAccount} from "@polkadot/extension-inject/types";
import {waitReady} from "@polkadot/wasm-crypto";

export class UiScheme implements SchemeInterface {
    name: string
    publicKeyHex: string
    address: string
    signRaw: (raw: SignerPayloadRaw) => Promise<SignerResult>;

    private constructor(
        name: string,
        publicKeyHex: string,
        address: string,
        signRaw: (raw: SignerPayloadRaw) => Promise<SignerResult>,
    ) {
        this.name = name;
        this.publicKeyHex = publicKeyHex;
        this.signRaw = signRaw;
        this.address = address;
    }

    static async createScheme(account: InjectedAccount): Promise<UiScheme> {
        await waitReady()

        let injector = await web3FromAddress(account.address);
        let signRaw = injector?.signer?.signRaw;

        if (!signRaw) {
            throw Error("Failed to initialise scheme")
        }

        return new UiScheme(account.type!!, account.address, account.address, signRaw)
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
