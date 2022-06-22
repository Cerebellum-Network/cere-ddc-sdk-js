import {DdcClientInterface} from "./DdcClient.interface.js";
import {ClientOptions} from "./options/ClientOptions";
import {InjectedAccount, InjectedAccountWithMeta} from "@polkadot/extension-inject/types";

export {DdcClientInterface} from "./DdcClient.interface.js";
export {ClientOptions} from "./options/ClientOptions.js";
export {ReadOptions} from "./options/ReadOptions.js";
export {StoreOptions} from "./options/StoreOptions.js";
export {PieceArray} from "./model/PieceArray.js";

export interface DdcClient extends DdcClientInterface {
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