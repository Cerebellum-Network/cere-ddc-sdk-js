import {ApiPromise} from '@polkadot/api';
import {KeyringPair} from '@polkadot/keyring/types';
import {ContractPromise} from '@polkadot/api-contract';
import {SmartContract} from '@cere-ddc-sdk/smart-contract';

import {bootstrapContract, createBlockhainApi, getAccount} from './helpers';

describe.skip('Smart Contract', () => {
    let api: ApiPromise;
    let admin: KeyringPair;
    let deployedContract: ContractPromise;
    let adminContract: SmartContract;
    let user: KeyringPair;
    let userContract: SmartContract;

    beforeAll(async () => {
        api = await createBlockhainApi();
        admin = await getAccount('//Alice');
        user = await getAccount('//Bob');

        deployedContract = await bootstrapContract(api, admin);

        adminContract = new SmartContract(admin, deployedContract);
        userContract = new SmartContract(user, deployedContract);
    });

    afterAll(async () => {
        await api.disconnect();
    });

    describe('Network topology', () => {
        test('create storage node', async () => {
            const node = await adminContract.nodeCreate();

            expect(node).toBeTruthy();
        });

        test('create CDN node', async () => {
            const node = await adminContract.cdnNodeCreate();

            expect(node).toBeTruthy();
        });

        test('create storage cluster', async () => {
            const cluster = await adminContract.clusterCreate();

            expect(cluster).toBeTruthy();
        });

        test('create CDN cluster', async () => {
            const cluster = await adminContract.cdnClusterCreate();

            expect(cluster).toBeTruthy();
        });

        test('get all storage clusters', async () => {
            const clusters = await adminContract.clusterList();

            expect(clusters).toEqual(expect.any(Array));
        });

        test('get all CDN clusters', async () => {
            const clusters = await adminContract.cdnClusterList();

            expect(clusters).toEqual(expect.any(Array));
        });

        test('get all CDN nodes', async () => {
            const nodes = await adminContract.cdnNodeGet(1);

            expect(nodes).toEqual(expect.any(Array));
        });

        test('get all storage nodes', async () => {
            const nodes = await adminContract.cdnNodeList();

            expect(nodes).toEqual(expect.any(Array));
        });

        test('add storage node to a cluster', async () => {
            const clusterNode = await adminContract.clusterAddNode();

            expect(clusterNode).toBeTruthy();
        });

        test('add CDN node to a cluster', async () => {
            const cdnNode = await adminContract.cdnClusterAddNode();

            expect(cdnNode).toBeTruthy();
        });

        test('remove storage node from a cluster', async () => {
            await adminContract.clusterRemoveNode();
        });

        test('remove CDN node from a cluster', async () => {
            await adminContract.cdnClusterRemoveNode();
        });
    });

    describe('Accounts', () => {
        test('get account status', async () => {
            const account = await adminContract.accountGet(user.address);

            expect(account).toBeTruthy();
        });

        test('deposit account balance', async () => {
            await userContract.accountDeposit(100n);
        });

        test('bond account balance', async () => {
            await userContract.accountBond(50n);
        });
    });

    describe('Buckets', () => {
        test('get all buckets', async () => {
            const buckets = await adminContract.bucketList(0n, 10n);

            expect(buckets).toEqual(expect.any(Array));
        });

        test('create bucket', async () => {
            const bucket = await adminContract.bucketCreate(user.address, 1n);

            expect(bucket).toBeTruthy();
        });

        test('get all user buckets', async () => {
            const buckets = await userContract.bucketList(0n, 10n, user.address);

            expect(buckets).toEqual(expect.any(Array));
        });

        test('get bucket', async () => {
            const bucket = await userContract.bucketGet(0n);

            expect(bucket).toBeTruthy();
        });

        test('allocate bucket in a cluster', async () => {
            await userContract.bucketAllocIntoCluster(0n, 1n);
        });
    });
});
