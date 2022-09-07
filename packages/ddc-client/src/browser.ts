import {DdcClient as CoreDdcClient} from "./DdcClient";
import {ClientOptions, initDefaultOptions} from "./options/ClientOptions";
import {InjectedAccount} from "@polkadot/extension-inject/types";
import {PolkadotDappScheme, Scheme, SchemeInterface} from "@cere-ddc-sdk/core/browser";
import {SmartContract} from "@cere-ddc-sdk/smart-contract/browser";
import {ContentAddressableStorage} from "@cere-ddc-sdk/content-addressable-storage";

export {mnemonicGenerate} from '@polkadot/util-crypto';
export type {DdcClientInterface} from "./DdcClient.interface";
export {ClientOptions} from "./options/ClientOptions";
export {ReadOptions} from "./options/ReadOptions";
export {StoreOptions} from "./options/StoreOptions";
export {File} from "./model/File";

export {TESTNET, DEVNET, SmartContractOptions, Permission, BucketParams} from "@cere-ddc-sdk/smart-contract";
export * from "@cere-ddc-sdk/core";
export {Piece, Query, Tag, SearchType, EncryptionOptions} from "@cere-ddc-sdk/content-addressable-storage";
export {FileStorageConfig, KB, MB} from "@cere-ddc-sdk/file-storage";

export class DdcClient extends CoreDdcClient {

    static async buildAndConnect(options: ClientOptions, secretPhrase: string, encryptionSecretPhrase: string): Promise<DdcClient>;
    static async buildAndConnect(options: ClientOptions, secretPhrase: string): Promise<DdcClient>;
    static async buildAndConnect(options: ClientOptions, account: InjectedAccount, encryptionSecretPhrase: string): Promise<DdcClient>;
    static async buildAndConnect(options: ClientOptions, accountOrSecretPhrase: InjectedAccount | string, encryptionSecretPhraseOrAccount?: string): Promise<DdcClient> {
        const encryptionSecretPhrase = await DdcClient.createEncryptionSecretPhrase(accountOrSecretPhrase, encryptionSecretPhraseOrAccount);
        if (typeof accountOrSecretPhrase === "string") {
            return super.buildAndConnect(options, accountOrSecretPhrase, encryptionSecretPhrase);
        }

        options = initDefaultOptions(options);

        const scheme = await DdcClient.createScheme(options, accountOrSecretPhrase);
        const smartContract = await SmartContract.buildAndConnect(accountOrSecretPhrase, options.smartContract);
        const caStorage = await ContentAddressableStorage.build( {
            clusterAddress: options.clusterAddress,
            smartContract: options.smartContract,
            scheme: scheme,
            cipher: options.cipher,
            cidBuilder: options.cidBuilder
        });

        return new DdcClient(caStorage, smartContract, options, encryptionSecretPhrase);
    }

    private static async createScheme(options: ClientOptions, accountOrSecretPhrase: InjectedAccount | string): Promise<SchemeInterface> {
        if (typeof accountOrSecretPhrase !== "string") {
            return (typeof options.scheme === "string") ? await PolkadotDappScheme.createScheme(accountOrSecretPhrase) : options.scheme!
        }

        return (typeof options.scheme === "string") ? await Scheme.createScheme(options.scheme, accountOrSecretPhrase) : options.scheme!
    }

    private static async createEncryptionSecretPhrase(accountOrSecretPhrase: InjectedAccount | string, encryptionSecretPhraseOrAccount?: string): Promise<string> {
        const secret = encryptionSecretPhraseOrAccount != null ? encryptionSecretPhraseOrAccount : accountOrSecretPhrase
        if (typeof secret === "string") {
            return secret;
        } else {
            throw new Error("Unable to create DDC Client. Encryption secret phrase should be entered")
        }
    }
}
