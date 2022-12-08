import {SmartContract as CoreSmartContract} from './SmartContract';
import {SmartContractOptions, TESTNET} from './options/SmartContractOptions';
import {InjectedAccount} from '@polkadot/extension-inject/types';
import {web3Enable, web3FromAddress} from '@polkadot/extension-dapp';
import {Signer as InjectedSigner} from '@polkadot/api/types';

export {DEVNET, TESTNET, MAINNET} from './options/SmartContractOptions';
export type {SmartContractOptions} from './options/SmartContractOptions';
export {BucketCreatedEvent} from './event/BucketCreatedEvent';
export {BucketPermissionGrantedEvent} from './event/BucketPermissionGrantedEvent';
export {BucketPermissionRevokedEvent} from './event/BucketPermissionRevokedEvent';
export {Permission} from './model/Permission';
export {BucketStatusList} from './model/BucketStatusList';
export {BucketStatus} from './model/BucketStatus';
export {BucketParams} from './options/BucketParams';

export class SmartContract extends CoreSmartContract {
    constructor(secretPhraseOrAddress: string, options?: SmartContractOptions, signer?: InjectedSigner) {
        super(secretPhraseOrAddress, options);
        if (!!signer) {
            this.signAndSend = (tx, statusCb) => tx.signAndSend(secretPhraseOrAddress, {signer: signer}, statusCb as any);
        }
    }

    static async buildAndConnect(account: InjectedAccount, options?: SmartContractOptions): Promise<CoreSmartContract>;
    static async buildAndConnect(secretPhrase: string, options?: SmartContractOptions): Promise<CoreSmartContract>;
    static async buildAndConnect(
        accountOrSecretPhrase: InjectedAccount | string,
        options?: SmartContractOptions,
    ): Promise<CoreSmartContract> {
        if (typeof accountOrSecretPhrase === 'string') {
            return super.buildAndConnect(accountOrSecretPhrase, options);
        } else {
            await web3Enable('ddc');
            const injector = await web3FromAddress(accountOrSecretPhrase.address);
            return new SmartContract(
                accountOrSecretPhrase.address,
                options,
                injector.signer as InjectedSigner,
            ).connect();
        }
    }
}
