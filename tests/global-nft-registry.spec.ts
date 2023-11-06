import {ApiPromise} from '@polkadot/api';
import {KeyringPair} from '@polkadot/keyring/types';
import {ContractPromise} from '@polkadot/api-contract';
import {GlobalNftRegistry, addressToAccountId} from '@cere-ddc-sdk/global-nft-registry';
import {AccountId, ChainId, ContractAddress, TokenId, Role, EvmAddress} from '@cere-ddc-sdk/global-nft-registry/types';

import {bootstrapRegistry, createBlockhainApi, getAccount} from './helpers';

describe('Global NFT Registry', () => {
    let api: ApiPromise;
    let deployedContract: ContractPromise;
    let admin: KeyringPair;
    let user: KeyringPair;
    let adminRegistry: GlobalNftRegistry;
    let userRegistry: GlobalNftRegistry;

    const chainId: ChainId = 1n;
    const owner: EvmAddress = '0x56Af158900A0Ca1909438a9392a3b047080c46c1';
    const receiver: EvmAddress = '0xd6a8381d04E412FB16a4e99850B33eBC75Cf9133';
    const tokenContract: ContractAddress = '0xa6F451CaD9bB834EB5804b976149A5C3b82de21E';
    const tokenId: TokenId = 100n;
    const zeroAddress: EvmAddress = '0x0000000000000000000000000000000000000000';

    const updateRegistry = async () => {
        await adminRegistry.updateRegistry(chainId, tokenContract, tokenId, owner, 100n);
    };

    const grantTrustedServiceRole = async (_user: KeyringPair) => {
        await adminRegistry.grantRole(Role.TrustedService, _user.address);

        const hasRole = await adminRegistry.hasRole(Role.TrustedService, _user.address);
        expect(hasRole).toEqual(true);
    };

    beforeAll(async () => {
        api = await createBlockhainApi();
        admin = await getAccount('//Alice');
        user = await getAccount('//Bob');

        deployedContract = await bootstrapRegistry(api, admin);

        adminRegistry = new GlobalNftRegistry(admin, deployedContract);
        userRegistry = new GlobalNftRegistry(user, deployedContract);

        await grantTrustedServiceRole(admin);

        // @ts-ignore
        console.log(adminRegistry.contract);
    });

    afterAll(async () => {
        await api.disconnect();
    });

    describe('convert addresses', () => {
        it('should be able to convert the owner address to an account id', () => {
            const accountId: AccountId = '0x00000000000000000000000056af158900a0ca1909438a9392a3b047080c46c1';
            expect(addressToAccountId(owner)).toEqual(accountId);
        });

        it('should be able to convert the receiver address to an account id', () => {
            const accountId: AccountId = '0x000000000000000000000000d6a8381d04e412fb16a4e99850b33ebc75cf9133';
            expect(addressToAccountId(receiver)).toEqual(accountId);
        });

        it('should be able to convert the zero address to an account id', () => {
            const accountId: AccountId = '0x0000000000000000000000000000000000000000000000000000000000000000';
            expect(addressToAccountId(zeroAddress)).toEqual(accountId);
        });
    });

    describe('updateRegistry', () => {
        it('should directly update the token balance in the registry', async () => {
            const balance = await adminRegistry.getBalanceByKey({chainId, owner, tokenId, tokenContract});
            expect(balance).toEqual(0n);

            await updateRegistry();

            const newBalance = await adminRegistry.getBalanceByKey({chainId, owner, tokenId, tokenContract});
            expect(newBalance).toEqual(100n);
        });

        it('should throw an error if not an admin', async () => {
            await expect(userRegistry.updateRegistry(chainId, tokenContract, tokenId, owner, 100n)).rejects.toThrow();
        });
    });

    describe('transfer', () => {
        it('should transfer the balance of a token', async () => {
            await updateRegistry();

            expect(await adminRegistry.getBalanceByKey({chainId, owner, tokenId, tokenContract})).toEqual(100n);
            expect(await adminRegistry.getBalanceByKey({chainId, owner: receiver, tokenId, tokenContract})).toEqual(0n);

            await adminRegistry.transfer(chainId, tokenContract, tokenId, owner, receiver, 100n);

            expect(await adminRegistry.getBalanceByKey({chainId, owner, tokenId, tokenContract})).toEqual(0n);
            expect(await adminRegistry.getBalanceByKey({chainId, owner: receiver, tokenId, tokenContract})).toEqual(
                100n,
            );
        });

        it('should support transfer from the zero address (mint)', async () => {
            expect(await adminRegistry.getBalanceByKey({chainId, owner, tokenId, tokenContract})).toEqual(0n);
            expect(await adminRegistry.getBalanceByKey({chainId, owner: zeroAddress, tokenId, tokenContract})).toEqual(
                0n,
            );

            await adminRegistry.transfer(chainId, tokenContract, tokenId, zeroAddress, owner, 100n);

            expect(await adminRegistry.getBalanceByKey({chainId, owner, tokenId, tokenContract})).toEqual(100n);
            expect(await adminRegistry.getBalanceByKey({chainId, owner: zeroAddress, tokenId, tokenContract})).toEqual(
                0n,
            );
        });

        it('should support transfer to the zero address (burn)', async () => {
            await updateRegistry();

            expect(await adminRegistry.getBalanceByKey({chainId, owner, tokenId, tokenContract})).toEqual(100n);
            expect(await adminRegistry.getBalanceByKey({chainId, owner: zeroAddress, tokenId, tokenContract})).toEqual(
                0n,
            );

            await adminRegistry.transfer(chainId, tokenContract, tokenId, owner, zeroAddress, 100n);

            expect(await adminRegistry.getBalanceByKey({chainId, owner, tokenId, tokenContract})).toEqual(0n);
            expect(await adminRegistry.getBalanceByKey({chainId, owner: zeroAddress, tokenId, tokenContract})).toEqual(
                100n,
            );
        });

        it('should throw an error if not an admin', async () => {
            await expect(
                userRegistry.transfer(chainId, tokenContract, tokenId, owner, receiver, 100n),
            ).rejects.toThrow();
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
            await adminRegistry.updateRegistry(chainId, tokenContract, tokenId, owner, 0n);

            expect(await adminRegistry.isOwner(chainId, tokenContract, tokenId, owner)).toEqual(false);

            await adminRegistry.updateRegistry(chainId, tokenContract, tokenId, owner, 100n);

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
            await adminRegistry.revokeRole(Role.TrustedService, user.address);
            expect(await adminRegistry.hasRole(Role.TrustedService, user.address)).toEqual(false);
        });
    });
});
