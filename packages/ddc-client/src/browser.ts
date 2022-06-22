import {DdcClient as CoreDdcClient} from "./DdcClient.js";
import {ClientOptions, initDefaultOptions} from "./options/ClientOptions.js";
import {InjectedAccount} from "@polkadot/extension-inject/types";
import {web3FromAddress} from "@polkadot/extension-dapp";
import {PolkadotDappScheme, SchemeName} from "@cere-ddc-sdk/core";
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
    static async buildAndConnect(options: ClientOptions, account: InjectedAccount, encryptionAccount: InjectedAccount): Promise<DdcClient>;
    static async buildAndConnect(options: ClientOptions, account: InjectedAccount): Promise<DdcClient>;
    static async buildAndConnect(options: ClientOptions, accountOrSecretPhrase: InjectedAccount | string, encryptionSecretPhraseOrAccount?: InjectedAccount | string): Promise<DdcClient> {
        const encryptionSecretPhrase = await DdcClient.createEncryptionSecretPhrase(encryptionSecretPhraseOrAccount != null ? encryptionSecretPhraseOrAccount : accountOrSecretPhrase);
        if (typeof accountOrSecretPhrase === "string") {
            return super.buildAndConnect(options, accountOrSecretPhrase, encryptionSecretPhrase);
        }

        options = initDefaultOptions(options);

        const scheme = (typeof options.scheme === "string") ? await PolkadotDappScheme.createScheme(accountOrSecretPhrase) : options.scheme!
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

    private static async createEncryptionSecretPhrase(accountOrSecretPhrase: InjectedAccount | string): Promise<string> {
        if (typeof accountOrSecretPhrase === "string") {
            return accountOrSecretPhrase;
        } else {
            if (accountOrSecretPhrase.type !== "ed25519") {
                throw Error(`Unable to create encryption secret phrase for account type='${accountOrSecretPhrase.type}'`)
            }

            const injector = await web3FromAddress(accountOrSecretPhrase.address);
            const signRaw = injector?.signer?.signRaw;

            if (!signRaw) {
                throw new Error("Unable to create encryption secret phrase through extension");
            }
            const {signature} = await signRaw({
                data: "DDC encryption secret phrase",
                address: accountOrSecretPhrase.address,
                type: 'payload'
            });

            return signature;
        }
    }
}