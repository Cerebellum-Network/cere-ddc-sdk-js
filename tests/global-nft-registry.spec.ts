import {ApiPromise} from '@polkadot/api';
import {KeyringPair} from '@polkadot/keyring/types';
import {ContractPromise} from '@polkadot/api-contract';
import {GlobalNftRegistry} from '@cere-ddc-sdk/global-nft-registry';

import {bootstrapContract, createBlockhainApi, getAccount} from './helpers';

describe('Global NFT Registry', () => {
    let api: ApiPromise;
    let admin: KeyringPair;
    let deployedContract: ContractPromise;
    let user: KeyringPair;
    let adminRegistry: GlobalNftRegistry;
    let userRegistry: GlobalNftRegistry;

    beforeAll(async () => {
        api = await createBlockhainApi();
        admin = await getAccount('//Alice');
        user = await getAccount('//Bob');

        deployedContract = await bootstrapContract(api, admin);

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
            throw Error('Not Implemented');
        });

        it('should return 0 for non-existent tokens', async () => {
            throw Error('Not Implemented');
        });
    });

    describe('isOwner', () => {
        it('should return true if the owner owns the token', async () => {
            throw Error('Not Implemented');
        });

        it('should return false if the owner does not own the token', async () => {
            throw Error('Not Implemented');
        });
    });

    describe('grantRole', () => {
        it('should grant a role to an account', async () => {
            throw Error('Not Implemented');
        });

        it('should throw an error if not an admin', async () => {
            throw Error('Not Implemented');
        });
    });

    describe('revokeRole', () => {
        it('should revoke a role from an account', async () => {
            throw Error('Not Implemented');
        });

        it('should throw an error if not an admin', async () => {
            throw Error('Not Implemented');
        });
    });

    describe('hasRole', () => {
        it('should return true if the account has the role', async () => {
            throw Error('Not Implemented');
        });

        it('should return false if the account does not have the role', async () => {
            throw Error('Not Implemented');
        });
    });
});
