import {SmartContract as CoreSmartContract, SmartContractOptions} from "./basic.js";
import {InjectedAccount} from "@polkadot/extension-inject/types";
import {Signer as InjectedSigner} from "@polkadot/api/types";

export * from "./basic.js"

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
