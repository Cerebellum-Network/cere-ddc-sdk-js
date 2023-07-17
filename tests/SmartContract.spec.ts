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
        let createdStorageNodeId: any;
        let createdCdnNodeId: any;
        let createdStorageClusterId: any;
        let createdCdnClusterId: any;

        test('create storage node', async () => {
            createdStorageNodeId = await adminContract.nodeCreate(
                1n,
                {url: 'http://localhost:8090'},
                100000000,
                'ACTIVE' as any,
                admin.address,
            );

            expect(createdStorageNodeId).toEqual(expect.any(Number));
        });

        test('create CDN node', async () => {
            createdCdnNodeId = await adminContract.cdnNodeCreate({
                location: 'US',
                size: 1,
                url: 'http://localhost:8080',
                publicKey: '0x6937f1b9092e110fb3756b65e5453bc63af676557a72f3aac12ded3944f623c2',
            });

            expect(createdCdnNodeId).toEqual(expect.any(Number));
        });

        test('create storage cluster', async () => {
            createdStorageClusterId = await adminContract.clusterCreate();

            expect(createdStorageClusterId).toEqual(expect.any(Number));
        });

        test('create CDN cluster', async () => {
            createdCdnClusterId = await adminContract.cdnClusterCreate();

            expect(createdCdnClusterId).toEqual(expect.any(Number));
        });

        test('get storage cluster', async () => {
            expect(createdStorageClusterId).toBeDefined();

            const foundCluster = await adminContract.clusterGet(createdStorageClusterId);

            expect(foundCluster.clusterId).toEqual(createdStorageClusterId);
        });

        test('get CDN cluster', async () => {
            expect(createdCdnClusterId).toBeDefined();

            const foundCluster = await adminContract.cdnClusterGet(createdCdnClusterId);

            expect(foundCluster.clusterId).toEqual(createdCdnClusterId);
        });

        test('get storage node', async () => {
            expect(createdStorageNodeId).toBeDefined();

            const foundNode = await adminContract.nodeGet(createdStorageNodeId);

            expect(foundNode.nodeId).toEqual(createdStorageNodeId);
        });

        test('get CDN node', async () => {
            expect(createdCdnNodeId).toBeDefined();

            const foundCluster = await adminContract.cdnNodeGet(createdCdnNodeId);

            expect(foundCluster.nodeId).toEqual(createdCdnNodeId);
        });

        test('get all storage clusters', async () => {
            const [clusters, totalCount] = await adminContract.clusterList();

            expect(totalCount).toBeGreaterThanOrEqual(1);
            expect(clusters).toEqual(
                expect.arrayContaining([expect.objectContaining({clusterId: createdStorageClusterId})]),
            );
        });

        test('get all CDN clusters', async () => {
            const [clusters, totalCount] = await adminContract.cdnClusterList();

            expect(totalCount).toBeGreaterThanOrEqual(1);
            expect(clusters).toEqual(
                expect.arrayContaining([expect.objectContaining({clusterId: createdCdnClusterId})]),
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
            await userContract.accountDeposit(20n);
            const account = await adminContract.accountGet(user.address);

            expect(account.deposit.value).toBeTruthy();
        });

        test('bond account balance', async () => {
            await userContract.accountBond(10n);
            const account = await adminContract.accountGet(user.address);

            expect(account.bonded.value).toBeTruthy();
        });
    });

    describe('Buckets', () => {
        let createdBucketId: any;
        let createdClusterId: any;

        beforeAll(async () => {
            await userContract.accountDeposit(20n);
            await userContract.accountBond(10n);

            createdClusterId = await adminContract.clusterCreate();
        });

        test('create bucket', async () => {
            createdBucketId = await userContract.bucketCreate(user.address, createdClusterId);

            expect(createdBucketId).toEqual(expect.any(Number));
        });

        test('get bucket', async () => {
            expect(createdBucketId).toBeDefined();

            const foundBucket = await userContract.bucketGet(createdBucketId);

            expect(foundBucket.bucketId).toEqual(createdBucketId);
        });

        test('get all buckets', async () => {
            const [buckets, totalCount] = await userContract.bucketList();

            expect(totalCount).toBeGreaterThanOrEqual(1);
            expect(buckets).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        bucketId: createdBucketId,
                    }),
                ]),
            );
        });

        test('allocate bucket in a cluster', async () => {
            expect(createdBucketId).toBeDefined();

            await userContract.bucketAllocIntoCluster(createdBucketId, 3);
        });
    });
});
