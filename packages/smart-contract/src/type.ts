import {Options, TESTNET} from "./Options.js";
import {BucketCreatedEvent} from "./event/BucketCreatedEvent.js";
import {BucketStatus} from "./model/BucketStatus.js";
import {BucketStatusList} from "./model/BucketStatusList.js";
import {Permission} from "./model/Permission.js";
import {BucketPermissionGrantedEvent} from "./event/BucketPermissionGrantedEvent.js";
import {BucketPermissionRevokedEvent} from "./event/BucketPermissionRevokedEvent.js";
import {InjectedAccount} from "@polkadot/extension-inject/types";
import {SmartContract as CoreSmartContract} from "./SmartContract.js";
import {Signer as InjectedSigner} from "@polkadot/api/types";

export {Options, DEVNET, TESTNET, MAINNET} from "./Options.js"
export {BucketCreatedEvent} from "./event/BucketCreatedEvent.js"
/*export {BucketPermissionGrantedEvent} from "./event/BucketPermissionGrantedEvent.js"
export {BucketPermissionRevokedEvent} from "./event/BucketPermissionRevokedEvent.js"
export {Permission} from "./model/Permission.js"*/
export {BucketStatusList} from "./model/BucketStatusList.js"
export {BucketStatus} from "./model/BucketStatus.js"

export interface SmartContract extends CoreSmartContract {
}

export declare const SmartContract: {
    prototype: SmartContract;

    new(secretPhrase: string, options?: Options): SmartContract;
    //Browser only
    new(address: string, options?: Options, signer?: InjectedSigner): SmartContract;

    buildAndConnect(secretPhrase: string, options?: Options): Promise<CoreSmartContract>;
    //Browser only
    buildAndConnect(account: InjectedAccount, options?: Options): Promise<CoreSmartContract>;
};
