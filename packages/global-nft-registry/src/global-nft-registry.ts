import {ApiPromise, WsProvider} from '@polkadot/api';
import {ContractPromise} from '@polkadot/api-contract';
import {Keyring} from '@polkadot/keyring';
import {AddressOrPair, Signer} from '@polkadot/api/types';
import {cryptoWaitReady, isAddress} from '@polkadot/util-crypto';

import {SmartContractBase, SubmitResult} from './smart-contract-base';
import {GlobalNftRegistryOptions, TESTNET} from './options';
import {Balance, GlobalNftRegistryInterface, Role, cereTypes} from './types';

export class GlobalNftRegistry extends SmartContractBase implements GlobalNftRegistryInterface {
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

        // In case an external API instance is used - don't disconnect it
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

    async updateRegistry(
        chainId: bigint,
        tokenContract: string,
        tokenId: bigint,
        owner: string,
        balance: bigint,
    ): Promise<Required<SubmitResult>> {
        return this.submit(this.contract.tx.updateRegistry, chainId, tokenContract, tokenId, owner, balance);
    }

    async transfer(
        chainId: bigint,
        tokenContract: string,
        tokenId: bigint,
        from: string,
        to: string,
        amount: bigint,
    ): Promise<Required<SubmitResult>> {
        return this.submit(this.contract.tx.transfer, chainId, tokenContract, tokenId, from, to, amount);
    }

    async getBalance(chainId: bigint, tokenContract: string, tokenId: bigint, owner: string): Promise<Balance> {
        return this.queryOne(this.contract.query.getBalance, chainId, tokenContract, tokenId, owner);
    }

    async getBalanceByKey({
        chainId,
        tokenContract,
        tokenId,
        owner,
    }: {
        chainId: bigint;
        tokenContract: string;
        tokenId: bigint;
        owner: string;
    }): Promise<Balance> {
        return this.getBalance(chainId, tokenContract, tokenId, owner);
    }

    async isOwner(chainId: bigint, tokenContract: string, tokenId: bigint, owner: string): Promise<boolean> {
        return this.queryOne(this.contract.query.isOwner, chainId, tokenContract, tokenId, owner);
    }

    async grantRole(role: Role, account: string): Promise<Required<SubmitResult>> {
        return this.submit(this.contract.tx.grantRole, role, account);
    }

    async revokeRole(role: Role, account: string): Promise<Required<SubmitResult>> {
        return this.submit(this.contract.tx.revokeRole, role, account);
    }

    async hasRole(role: Role, account: string): Promise<boolean> {
        return this.queryOne(this.contract.query.hasRole, role, account);
    }
}
