import {SmartContractOptions, TESTNET} from "./options/SmartContractOptions.js";
import {BucketCreatedEvent} from "./event/BucketCreatedEvent.js";
import {BucketStatus} from "./model/BucketStatus.js";
import {BucketStatusList} from "./model/BucketStatusList.js";
import {Permission} from "./model/Permission.js";
import {BucketPermissionGrantedEvent} from "./event/BucketPermissionGrantedEvent.js";
import {BucketPermissionRevokedEvent} from "./event/BucketPermissionRevokedEvent.js";
import {InjectedAccount} from "@polkadot/extension-inject/types";
import {SmartContract as CoreSmartContract} from "./SmartContract.js";
import {Signer as InjectedSigner} from "@polkadot/api/types";

export {SmartContractOptions, DEVNET, TESTNET, MAINNET} from "./options/SmartContractOptions.js"
export {BucketCreatedEvent} from "./event/BucketCreatedEvent.js"
export {BucketPermissionGrantedEvent} from "./event/BucketPermissionGrantedEvent.js"
export {BucketPermissionRevokedEvent} from "./event/BucketPermissionRevokedEvent.js"
export {Permission} from "./model/Permission.js"
export {BucketStatusList} from "./model/BucketStatusList.js"
export {BucketStatus} from "./model/BucketStatus.js"
export {BucketParams} from "./options/BucketParams.js"

export interface SmartContract extends CoreSmartContract {
}

export declare const SmartContract: {
    prototype: SmartContract;

    new(secretPhrase: string, options?: SmartContractOptions): SmartContract;
    //Browser only
    new(address: string, options?: SmartContractOptions, signer?: InjectedSigner): SmartContract;

    buildAndConnect(secretPhrase: string, options?: SmartContractOptions): Promise<CoreSmartContract>;
    //Browser only
    buildAndConnect(account: InjectedAccount, options?: SmartContractOptions): Promise<CoreSmartContract>;
};
