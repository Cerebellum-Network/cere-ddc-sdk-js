import {GlobalNftRegistry as CoreSmartContract} from './global-nft-registry';
import {InjectedAccount} from '@polkadot/extension-inject/types';
import {web3Enable, web3FromAddress} from '@polkadot/extension-dapp';
import {AddressOrPair, Signer} from '@polkadot/api/types';

import {GlobalNftRegistryOptions as BaseOptions} from './options';
export {DEVNET, TESTNET, MAINNET} from './options';

export type GlobalNftRegistryOptions = BaseOptions & {
    extensionOriginName?: string;
};

const isInjectedAccount = (input: any): input is InjectedAccount => typeof input.address === 'string';

export class GlobalNftRegistry extends CoreSmartContract {
    static async buildAndConnect(
        accountOrSecretPhrase: InjectedAccount | AddressOrPair,
        options?: GlobalNftRegistryOptions,
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
