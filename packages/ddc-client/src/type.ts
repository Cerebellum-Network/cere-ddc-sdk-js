import {DdcClient as CoreDdcClient} from "./DdcClient";
import {ClientOptions} from "./options/ClientOptions";
import {InjectedAccount} from "@polkadot/extension-inject/types";

export {ClientOptions} from "./options/ClientOptions";
export {ReadOptions} from "./options/ReadOptions";
export {StoreOptions} from "./options/StoreOptions";
export {File} from "./model/File";

export {TESTNET, DEVNET, SmartContractOptions, Permission, BucketParams} from "@cere-ddc-sdk/smart-contract";
export * from "@cere-ddc-sdk/core";
export {Piece, Query, Tag, SearchType, EncryptionOptions, Session} from "@cere-ddc-sdk/content-addressable-storage";
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
