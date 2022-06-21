import {SmartContract as CoreSmartContract} from "./SmartContract.js";
import {Options, TESTNET} from "./Options";
import {InjectedAccountWithMeta} from "@polkadot/extension-inject/types";
import {web3FromSource} from "@polkadot/extension-dapp"
import {Signer as InjectedSigner} from "@polkadot/api/types";

export {Options, DEVNET, TESTNET, MAINNET} from "./Options.js"
export {BucketCreatedEvent} from "./event/BucketCreatedEvent.js"
export {BucketPermissionGrantedEvent} from "./event/BucketPermissionGrantedEvent.js"
export {BucketPermissionRevokedEvent} from "./event/BucketPermissionRevokedEvent.js"
export {Permission} from "./model/Permission.js"
export {BucketStatusList} from "./model/BucketStatusList.js"
export {BucketStatus} from "./model/BucketStatus.js"

export class SmartContract extends CoreSmartContract {

    constructor(secretPhraseOrAddress: string, options?: Options, signer?: InjectedSigner) {
        super(secretPhraseOrAddress, options);
        if (!!signer) {
            this.signAndSend = (tx, statusCb) =>
                tx.signAndSend(secretPhraseOrAddress, {signer: signer}, statusCb);
        }
    }

    static async buildAndConnect(accountOrSecretPhrase: InjectedAccountWithMeta | string, options?: Options): Promise<CoreSmartContract> {
        if (typeof accountOrSecretPhrase === "string") {
            return super.buildAndConnect(accountOrSecretPhrase, options);
        } else {
            const injector = await web3FromSource(accountOrSecretPhrase.meta.source);
            return new SmartContract(accountOrSecretPhrase.address, options, injector.signer).connect();
        }
    }
}