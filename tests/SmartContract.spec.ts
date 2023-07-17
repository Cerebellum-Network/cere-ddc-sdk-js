import {ApiPromise} from '@polkadot/api';
import {KeyringPair} from '@polkadot/keyring/types';
import {ContractPromise} from '@polkadot/api-contract';
import {SmartContract} from '@cere-ddc-sdk/smart-contract';

import {bootstrapContract, createBlockhainApi, getAccount} from './helpers';

describe('Smart Contract', () => {
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
            const createdNodeId = await adminContract.nodeCreate(
                1n,
                {url: 'http://localhost:8090'},
                100000000,
                'ACTIVE' as any,
                admin.address,
            );

            expect(createdNodeId).toEqual(expect.any(Number));
        });

        test('create CDN node', async () => {
            const node = await adminContract.cdnNodeCreate();

            expect(node).toBeTruthy();
        });

        test('create storage cluster', async () => {
            const createdClusterId = await adminContract.clusterCreate();

            expect(createdClusterId).toEqual(expect.any(Number));
        });

        test('create CDN cluster', async () => {
            const createdClusterId = await adminContract.cdnClusterCreate();

            expect(createdClusterId).toEqual(expect.any(Number));
        });

        test('get storage cluster', async () => {
            const createdClusterId = await adminContract.clusterCreate();
            const foundCluster = await adminContract.clusterGet(createdClusterId);

            expect(foundCluster.clusterId).toEqual(createdClusterId);
        });

        test('get CDN cluster', async () => {
            const createdClusterId = await adminContract.cdnClusterCreate();
            const foundCluster = await adminContract.cdnClusterGet(createdClusterId);

            expect(foundCluster.clusterId).toEqual(createdClusterId);
        });

        test('get all storage clusters', async () => {
            const clusterId1 = await adminContract.clusterCreate();
            const clusterId2 = await adminContract.clusterCreate();

            const [clusters, totalCount] = await adminContract.clusterList();

            expect(totalCount).toBeGreaterThanOrEqual(2);
            expect(clusters).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({clusterId: clusterId1}),
                    expect.objectContaining({clusterId: clusterId2}),
                ]),
            );
        });

        test('get all CDN clusters', async () => {
            const clusterId1 = await adminContract.cdnClusterCreate();
            const clusterId2 = await adminContract.cdnClusterCreate();

            const [clusters, totalCount] = await adminContract.cdnClusterList();

            expect(totalCount).toBeGreaterThanOrEqual(2);
            expect(clusters).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({clusterId: clusterId1}),
                    expect.objectContaining({clusterId: clusterId2}),
                ]),
            );
        });

        test('get all CDN nodes', async () => {
            const nodes = await adminContract.cdnNodeList();

            expect(nodes).toEqual(expect.any(Array));
        });

        test('get all storage nodes', async () => {
            const nodes = await adminContract.nodeList();

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
        test('deposit account balance', async () => {
            await userContract.accountDeposit(10n);
            const account = await adminContract.accountGet(user.address);

            expect(account.deposit.value).toBeTruthy();
        });

        test('bond account balance', async () => {
            await userContract.accountBond(5n);
            const account = await adminContract.accountGet(user.address);

            expect(account.bonded.value).toBeTruthy();
        });
    });

    describe('Buckets', () => {
        test('create bucket', async () => {
            const createdBucketId = await adminContract.bucketCreate(admin.address, 1);

            expect(createdBucketId).toEqual(expect.any(Number));
        });

        test('get bucket', async () => {
            const createdBucketId = await adminContract.bucketCreate(admin.address, 1);
            const foundBucket = await adminContract.bucketGet(createdBucketId);

            expect(foundBucket.bucketId).toEqual(createdBucketId);
        });

        test('get all buckets', async () => {
            const createdBucketId = await adminContract.bucketCreate(admin.address, 1);
            const [buckets, totalCount] = await adminContract.bucketList();

            expect(totalCount).toBeGreaterThanOrEqual(1);
            expect(buckets).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        bucketId: createdBucketId,
                    }),
                ]),
            );
        });

        test('get all user buckets', async () => {
            const createdBucketId = await userContract.bucketCreate(user.address, 1);
            const [buckets, totalCount] = await userContract.bucketList(null, null, user.address);

            expect(totalCount).toBeGreaterThanOrEqual(1);
            expect(buckets).toEqual([
                expect.objectContaining({
                    bucketId: createdBucketId,
                }),
            ]);
        });

        test('allocate bucket in a cluster', async () => {
            const clusterId = await adminContract.clusterCreate();
            const createdBucketId = await userContract.bucketCreate(user.address, clusterId);

            await userContract.bucketAllocIntoCluster(createdBucketId, clusterId);
        });
    });
});
