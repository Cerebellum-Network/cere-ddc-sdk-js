import {DdcClient as CoreDdcClient} from "./DdcClient.js";
import {ClientOptions} from "./options/ClientOptions.js";
import {InjectedAccount} from "@polkadot/extension-inject/types";

export {ClientOptions} from "./options/ClientOptions.js";
export {ReadOptions} from "./options/ReadOptions.js";
export {StoreOptions} from "./options/StoreOptions.js";
export {File} from "./model/File.js";

export {TESTNET, DEVNET, SmartContractOptions, Permission, BucketParams} from "@cere-ddc-sdk/smart-contract";
export * from "@cere-ddc-sdk/core";
export {Piece, Query, Tag, EncryptionOptions} from "@cere-ddc-sdk/content-addressable-storage";
export {FileStorageConfig, KB, MB} from "@cere-ddc-sdk/file-storage";

export interface DdcClient extends CoreDdcClient {
}

export declare const DdcClient: {
    prototype: DdcClient;

    buildAndConnect(options: ClientOptions, secretPhrase: string, encryptionSecretPhrase: string): Promise<DdcClient>;
    buildAndConnect(options: ClientOptions, secretPhrase: string): Promise<DdcClient>;
    //Browser only
    buildAndConnect(options: ClientOptions, account: InjectedAccount, encryptionSecretPhrase: string): Promise<DdcClient>;
}