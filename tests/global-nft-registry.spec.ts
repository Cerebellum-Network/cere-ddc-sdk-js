import {ApiPromise} from '@polkadot/api';
import {KeyringPair} from '@polkadot/keyring/types';
import {ContractPromise} from '@polkadot/api-contract';
import {GlobalNftRegistry} from '@cere-ddc-sdk/global-nft-registry/src';
import {AccountId, ChainId, ContractAddress, TokenId} from '@cere-ddc-sdk/global-nft-registry/src/types';

import {bootstrapRegistry, createBlockhainApi, getAccount} from './helpers';
import {Role} from 'packages/global-nft-registry/dist/types/types';

describe('Global NFT Registry', () => {
    let api: ApiPromise;
    let admin: KeyringPair;
    let deployedContract: ContractPromise;
    let user: KeyringPair;
    let adminRegistry: GlobalNftRegistry;
    let userRegistry: GlobalNftRegistry;

    const chainId: ChainId = 1n;
    const owner: AccountId = '0xa4d8d7c9f7b4489e8cb616fca9d677901d7d9b2a';
    const tokenContract: ContractAddress = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
    const tokenId: TokenId = 100n;

    const updateRegistry = async () => {
        await adminRegistry.updateRegistry(chainId, tokenContract, tokenId, owner, 100n);
    };

    beforeAll(async () => {
        api = await createBlockhainApi();
        admin = await getAccount('//Alice');
        user = await getAccount('//Bob');

        deployedContract = await bootstrapRegistry(api, admin);

        adminRegistry = new GlobalNftRegistry(admin, deployedContract);
        userRegistry = new GlobalNftRegistry(user, deployedContract);
    });

    afterAll(async () => {
        await api.disconnect();
    });

    describe('updateRegistry', () => {
        it('should directly update the token balance in the registry', async () => {
            throw Error('Not Implemented');
        });

        it('should throw an error if not an admin', async () => {
            throw Error('Not Implemented');
        });
    });

    describe('transfer', () => {
        it('should transfer the balance of a token', async () => {
            throw Error('Not Implemented');
        });

        it('should support transfer from the zero address (mint)', async () => {
            throw Error('Not Implemented');
        });

        it('should support transfer to the zero address (burn)', async () => {
            throw Error('Not Implemented');
        });

        it('should throw an error if not an admin', async () => {
            throw Error('Not Implemented');
        });
    });

    describe('getBalance', () => {
        it('should return the balance of a token <-> owner', async () => {
            const balance = await adminRegistry.getBalanceByKey({chainId, owner, tokenId, tokenContract});
            expect(balance).toEqual(0n);

            await updateRegistry();

            const updatedBalance = await adminRegistry.getBalanceByKey({chainId, owner, tokenId, tokenContract});
            expect(updatedBalance).toEqual(100n);
        });

        it('should return 0 for non-existent tokens', async () => {
            const balance = await adminRegistry.getBalanceByKey({chainId, owner, tokenId: 999n, tokenContract});
            expect(balance).toEqual(0n);
        });
    });

    describe('isOwner', () => {
        it('should return true if the owner owns the token and false if they do not', async () => {
            expect(await adminRegistry.isOwner(chainId, tokenContract, tokenId, owner)).toEqual(false);
            await updateRegistry();
            expect(await adminRegistry.isOwner(chainId, tokenContract, tokenId, owner)).toEqual(true);
        });
    });

    describe('grantRole', () => {
        it('should grant a role to an account', async () => {
            expect(await adminRegistry.hasRole(Role.TrustedService, user.address)).toEqual(false);

            await adminRegistry.grantRole(Role.TrustedService, user.address);

            expect(await adminRegistry.hasRole(Role.TrustedService, user.address)).toEqual(true);
        });

        it('should throw an error if not an admin', async () => {
            await expect(userRegistry.grantRole(Role.TrustedService, user.address)).rejects.toThrow();
        });
    });

    describe('revokeRole', () => {
        it('should revoke a role from an account', async () => {
            await adminRegistry.grantRole(Role.TrustedService, user.address);

            expect(await adminRegistry.hasRole(Role.TrustedService, user.address)).toEqual(true);

            await adminRegistry.revokeRole(Role.TrustedService, user.address);

            expect(await adminRegistry.hasRole(Role.TrustedService, user.address)).toEqual(false);
        });

        it('should throw an error if not an admin', async () => {
            await expect(userRegistry.revokeRole(Role.TrustedService, user.address)).rejects.toThrow();
        });
    });

    describe('hasRole', () => {
        it('should return true if the account has the role', async () => {
            await adminRegistry.grantRole(Role.TrustedService, user.address);
            expect(await adminRegistry.hasRole(Role.TrustedService, admin.address)).toEqual(true);
        });

        it('should return false if the account does not have the role', async () => {
            expect(await adminRegistry.hasRole(Role.TrustedService, user.address)).toEqual(false);
        });
    });
});
