import {DdcClient as CoreDdcClient} from "./DdcClient.js";
import {ClientOptions} from "./options/ClientOptions.js";
import {InjectedAccount} from "@polkadot/extension-inject/types";

export {ClientOptions} from "./options/ClientOptions.js";
export {ReadOptions} from "./options/ReadOptions.js";
export {StoreOptions} from "./options/StoreOptions.js";
export {PieceArray} from "./model/PieceArray.js";

export interface DdcClient extends CoreDdcClient {
}

export declare const DdcClient: {
    prototype: DdcClient;

    buildAndConnect(options: ClientOptions, secretPhrase: string, encryptionSecretPhrase: string): Promise<DdcClient>;
    buildAndConnect(options: ClientOptions, secretPhrase: string): Promise<DdcClient>;
    //Browser only
    buildAndConnect(options: ClientOptions, account: InjectedAccount, encryptionSecretPhrase: string): Promise<DdcClient>;
    //Browser only
    buildAndConnect(options: ClientOptions, account: InjectedAccount, encryptionAccount: InjectedAccount): Promise<DdcClient>;
    //Browser only
    buildAndConnect(options: ClientOptions, account: InjectedAccount): Promise<DdcClient>;
}