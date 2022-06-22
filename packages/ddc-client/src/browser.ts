import {DdcClient as CoreDdcClient} from "./DdcClient.js";
import {ClientOptions, initDefaultOptions} from "./options/ClientOptions.js";
import {InjectedAccount} from "@polkadot/extension-inject/types";
import {PolkadotDappScheme, Scheme, SchemeInterface, SchemeName} from "@cere-ddc-sdk/core";
import {SmartContract} from "@cere-ddc-sdk/smart-contract";
import {ContentAddressableStorage} from "@cere-ddc-sdk/content-addressable-storage";

export {DdcClientInterface} from "./DdcClient.interface.js";
export {ClientOptions} from "./options/ClientOptions.js";
export {ReadOptions} from "./options/ReadOptions.js";
export {StoreOptions} from "./options/StoreOptions.js";
export {PieceArray} from "./model/PieceArray.js";

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