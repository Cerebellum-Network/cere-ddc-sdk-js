import {SmartContract as CoreSmartContract} from './SmartContract';
import {SmartContractOptions as BaseSmartContractOptions} from './options/SmartContractOptions';
import {InjectedAccount} from '@polkadot/extension-inject/types';
import {web3Enable, web3FromAddress} from '@polkadot/extension-dapp';
import {Signer} from '@polkadot/api/types';

export {DEVNET, TESTNET, MAINNET} from './options/SmartContractOptions';

export type SmartContractOptions = BaseSmartContractOptions & {
    extensionOriginName?: string;
};

export class SmartContract extends CoreSmartContract {
    static async buildAndConnect(
        accountOrSecretPhrase: InjectedAccount | string,
        options?: SmartContractOptions,
    ): Promise<CoreSmartContract> {
        if (typeof accountOrSecretPhrase === 'string') {
            return super.buildAndConnect(accountOrSecretPhrase, options);
        } else {
            await web3Enable(options?.extensionOriginName || 'ddc');
            const {address} = accountOrSecretPhrase;
            const {signer} = await web3FromAddress(address);

            return super.buildAndConnect(address, options, signer as Signer);
        }
    }
}
