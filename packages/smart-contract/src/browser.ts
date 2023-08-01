import {SmartContract as CoreSmartContract} from './SmartContract';
import {SmartContractOptions as BaseSmartContractOptions} from './options/SmartContractOptions';
import {InjectedAccount} from '@polkadot/extension-inject/types';
import {web3Enable, web3FromAddress} from '@polkadot/extension-dapp';
import {AddressOrPair, Signer} from '@polkadot/api/types';
import {isKeyringPair} from '@polkadot/api/util';

export {DEVNET, TESTNET, MAINNET} from './options/SmartContractOptions';

export type SmartContractOptions = BaseSmartContractOptions & {
    extensionOriginName?: string;
};

const isInjectedAccount = (input: any): input is InjectedAccount => typeof input.address === 'string';

export class SmartContract extends CoreSmartContract {
    static async buildAndConnect(
        accountOrSecretPhrase: InjectedAccount | AddressOrPair,
        options?: SmartContractOptions,
    ) {
        if (isInjectedAccount(accountOrSecretPhrase)) {
            await web3Enable(options?.extensionOriginName || 'ddc');
            const {address} = accountOrSecretPhrase;
            const {signer} = await web3FromAddress(address);

            return super.buildAndConnect(address, options, signer as Signer);
        } else {
            return super.buildAndConnect(accountOrSecretPhrase, options);
        }
    }
}
