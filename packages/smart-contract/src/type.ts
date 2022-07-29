import {SmartContractOptions, TESTNET} from "./options/SmartContractOptions";
import {BucketCreatedEvent} from "./event/BucketCreatedEvent";
import {BucketStatus} from "./model/BucketStatus";
import {BucketStatusList} from "./model/BucketStatusList";
import {Permission} from "./model/Permission";
import {BucketPermissionGrantedEvent} from "./event/BucketPermissionGrantedEvent";
import {BucketPermissionRevokedEvent} from "./event/BucketPermissionRevokedEvent";
import {InjectedAccount} from "@polkadot/extension-inject/types";
import {SmartContract as CoreSmartContract} from "./SmartContract";
import {Signer as InjectedSigner} from "@polkadot/api/types";

export {SmartContractOptions, DEVNET, TESTNET, MAINNET} from "./options/SmartContractOptions"
export {BucketCreatedEvent} from "./event/BucketCreatedEvent"
export {BucketPermissionGrantedEvent} from "./event/BucketPermissionGrantedEvent"
export {BucketPermissionRevokedEvent} from "./event/BucketPermissionRevokedEvent"
export {Permission} from "./model/Permission"
export {BucketStatusList} from "./model/BucketStatusList"
export {BucketStatus} from "./model/BucketStatus"
export {BucketParams} from "./options/BucketParams"

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
