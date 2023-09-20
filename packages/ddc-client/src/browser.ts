import {DdcClient as CoreDdcClient} from './DdcClient';
import {ClientOptions, CreateClientOptions} from './options/ClientOptions';
import {InjectedAccount} from '@polkadot/extension-inject/types';
import {PolkadotDappScheme, Scheme, SchemeInterface} from '@cere-ddc-sdk/core/browser';
import {SmartContract} from '@cere-ddc-sdk/smart-contract/browser';
import {ContentAddressableStorage} from '@cere-ddc-sdk/content-addressable-storage';
import {initDefaultClientOptions} from './lib/init-default-client-options';

export {mnemonicGenerate} from '@polkadot/util-crypto';
export {ClientOptions} from './options/ClientOptions';
export {File} from './model/File';

export {TESTNET, DEVNET} from '@cere-ddc-sdk/smart-contract';
export {BucketParams} from '@cere-ddc-sdk/smart-contract/types';
export type {SmartContractOptions} from '@cere-ddc-sdk/smart-contract';
export {DdcUri, IPIECE, IFILE, FILE, PIECE} from '@cere-ddc-sdk/core';
export {Piece, Query, Tag, SearchType, EncryptionOptions} from '@cere-ddc-sdk/content-addressable-storage';
export {FileStorageConfig, KB, MB} from '@cere-ddc-sdk/file-storage';

export class DdcClient extends CoreDdcClient {
    static async buildAndConnect(
        options: CreateClientOptions,
        accountOrSecretPhrase: InjectedAccount | string,
        encryptionSecretPhraseOrAccount?: string,
    ): Promise<DdcClient> {
        const encryptionSecretPhrase = await DdcClient.createEncryptionSecretPhrase(
            accountOrSecretPhrase,
            encryptionSecretPhraseOrAccount,
        );
        if (typeof accountOrSecretPhrase === 'string') {
            return super.buildAndConnect(options, accountOrSecretPhrase, encryptionSecretPhrase);
        }

        const clientCreateOptions = initDefaultClientOptions(options);
        const scheme = await DdcClient.createScheme(clientCreateOptions, accountOrSecretPhrase);
        const smartContract = await SmartContract.buildAndConnect(
            accountOrSecretPhrase,
            clientCreateOptions.smartContract,
        );
        const caStorage = await ContentAddressableStorage.build(
            {...clientCreateOptions, scheme, smartContract},
            encryptionSecretPhrase,
        );

        return new DdcClient(caStorage, smartContract, clientCreateOptions, encryptionSecretPhrase);
    }

    private static async createScheme(
        options: ClientOptions,
        accountOrSecretPhrase: InjectedAccount | string,
    ): Promise<SchemeInterface> {
        if (typeof accountOrSecretPhrase !== 'string') {
            return typeof options.scheme === 'string'
                ? await PolkadotDappScheme.createScheme(accountOrSecretPhrase)
                : options.scheme!;
        }

        return typeof options.scheme === 'string'
            ? await Scheme.createScheme(options.scheme, accountOrSecretPhrase)
            : options.scheme!;
    }

    private static async createEncryptionSecretPhrase(
        accountOrSecretPhrase: InjectedAccount | string,
        encryptionSecretPhraseOrAccount?: string,
    ): Promise<string> {
        const secret =
            encryptionSecretPhraseOrAccount != null ? encryptionSecretPhraseOrAccount : accountOrSecretPhrase;
        if (typeof secret === 'string') {
            return secret;
        } else {
            throw new Error('Unable to create DDC Client. Encryption secret phrase should be provided');
        }
    }
}
