import {ApiPromise, WsProvider} from '@polkadot/api';
import {ContractPromise} from '@polkadot/api-contract';
import {Keyring} from '@polkadot/keyring';
import {AddressOrPair, Signer} from '@polkadot/api/types';
import {cryptoWaitReady, isAddress} from '@polkadot/util-crypto';

import {SmartContractBase} from './smart-contract-base';
import {GlobalNftRegistryOptions, TESTNET} from './options';
import {cereTypes} from './types';

export class GlobalNftRegistry extends SmartContractBase {
    private shouldDisconnectAPI = false;

    static async buildAndConnect(
        secretPhraseOrAddress: AddressOrPair,
        options: GlobalNftRegistryOptions = TESTNET,
        signer?: Signer,
    ) {
        await cryptoWaitReady();

        let api = options.api;
        let addressOrPair = secretPhraseOrAddress;

        if (!api) {
            const provider = new WsProvider(options.rpcUrl);

            api = await ApiPromise.create({provider, types: cereTypes});
        }

        if (typeof secretPhraseOrAddress === 'string') {
            addressOrPair = isAddress(secretPhraseOrAddress)
                ? secretPhraseOrAddress
                : new Keyring({type: 'sr25519'}).addFromMnemonic(secretPhraseOrAddress);
        }

        const contract = new ContractPromise(api, options.abi, options.contractAddress);
        const registry = new GlobalNftRegistry(addressOrPair, contract, signer);

        /**
         * In case an external API instance is used - don't disconnect it
         */
        registry.shouldDisconnectAPI = !options.api;

        return registry.connect();
    }

    async connect() {
        const api = this.contract.api as ApiPromise;
        await api.isReady;

        return this;
    }

    async disconnect() {
        if (this.shouldDisconnectAPI) {
            await this.contract.api.disconnect();
        }
    }
}
