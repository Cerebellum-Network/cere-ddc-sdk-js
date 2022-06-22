import {SmartContract as CoreSmartContract} from "./SmartContract.js";
import {Options, TESTNET} from "./Options.js";
import {InjectedAccount, InjectedAccountWithMeta} from "@polkadot/extension-inject/types";
import {web3FromAddress} from "@polkadot/extension-dapp"
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

    static async buildAndConnect(account: InjectedAccount, options?: Options): Promise<CoreSmartContract>;
    static async buildAndConnect(secretPhrase: string, options?: Options): Promise<CoreSmartContract>;
    static async buildAndConnect(accountOrSecretPhrase: InjectedAccount | string, options?: Options): Promise<CoreSmartContract> {
        if (typeof accountOrSecretPhrase === "string") {
            return super.buildAndConnect(accountOrSecretPhrase, options);
        } else {
            const injector = await web3FromAddress(accountOrSecretPhrase.address);
            return new SmartContract(accountOrSecretPhrase.address, options, injector.signer).connect();
        }
    }
}