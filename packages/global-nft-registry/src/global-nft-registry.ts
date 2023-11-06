import {ApiPromise, WsProvider} from '@polkadot/api';
import {ContractPromise} from '@polkadot/api-contract';
import {Keyring} from '@polkadot/keyring';
import {AddressOrPair, Signer} from '@polkadot/api/types';
import {cryptoWaitReady, isAddress} from '@polkadot/util-crypto';

import {SmartContractBase, SubmitResult} from './smart-contract-base';
import {GlobalNftRegistryOptions, TESTNET} from './options';
import {
    AccountId,
    Balance,
    ChainId,
    ContractAddress,
    EvmAddress,
    GlobalNftRegistryInterface,
    Role,
    TokenId,
    cereTypes,
} from './types';
import {addressToAccountId} from './utils';

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
        const smartContract = new GlobalNftRegistry(addressOrPair, contract, signer);

        /**
         * In case an external API instance is used - don't diconnect it
         */
        smartContract.shouldDisconnectAPI = !options.api;

        return smartContract.connect();
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
        chainId: ChainId,
        tokenContract: ContractAddress,
        tokenId: TokenId,
        owner: EvmAddress,
        balance: Balance,
    ): Promise<Required<SubmitResult>> {
        const ownerAccountId = addressToAccountId(owner);
        const tokenContractAccountId = addressToAccountId(tokenContract);

        return this.submit(
            this.contract.tx.updateRegistry,
            chainId,
            tokenContractAccountId,
            tokenId,
            ownerAccountId,
            balance,
        );
    }

    async transfer(
        chainId: ChainId,
        tokenContract: ContractAddress,
        tokenId: TokenId,
        from: EvmAddress,
        to: EvmAddress,
        amount: Balance,
    ): Promise<Required<SubmitResult>> {
        const fromAccountId = addressToAccountId(from);
        const toAccountId = addressToAccountId(to);
        const tokenContractAccountId = addressToAccountId(tokenContract);

        return this.submit(
            this.contract.tx.transfer,
            chainId,
            tokenContractAccountId,
            tokenId,
            fromAccountId,
            toAccountId,
            amount,
        );
    }

    async getBalance(
        chainId: ChainId,
        tokenContract: ContractAddress,
        tokenId: TokenId,
        owner: EvmAddress,
    ): Promise<Balance> {
        const ownerAccountId = addressToAccountId(owner);
        const tokenContractAccountId = addressToAccountId(tokenContract);

        return BigInt(
            await this.query<Balance>(
                this.contract.query.getBalance,
                chainId,
                tokenContractAccountId,
                tokenId,
                ownerAccountId,
            ),
        );
    }

    async getBalanceByKey({
        chainId,
        tokenContract,
        tokenId,
        owner,
    }: {
        chainId: ChainId;
        tokenContract: ContractAddress;
        tokenId: TokenId;
        owner: EvmAddress;
    }): Promise<Balance> {
        return this.getBalance(chainId, tokenContract, tokenId, owner);
    }

    async isOwner(
        chainId: ChainId,
        tokenContract: ContractAddress,
        tokenId: TokenId,
        owner: EvmAddress,
    ): Promise<boolean> {
        const balance = await this.getBalance(chainId, tokenContract, tokenId, owner);
        return balance > 0n;
    }

    async grantRole(role: Role, account: AccountId): Promise<Required<SubmitResult>> {
        return this.submit(this.contract.tx.grantRole, role, account);
    }

    async revokeRole(role: Role, account: AccountId): Promise<Required<SubmitResult>> {
        return this.submit(this.contract.tx.revokeRole, role, account);
    }

    async hasRole(role: Role, account: AccountId): Promise<boolean> {
        return this.query(this.contract.query.hasRole, role, account);
    }
}
