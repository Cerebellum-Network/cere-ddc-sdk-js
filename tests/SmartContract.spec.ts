import {ApiPromise} from '@polkadot/api';
import {KeyringPair} from '@polkadot/keyring/types';
import {ContractPromise} from '@polkadot/api-contract';
import {SmartContract} from '@cere-ddc-sdk/smart-contract';

import {bootstrapContract, createAccount, createBlockhainApi, getAccount} from './helpers';

describe('Smart Contract', () => {
    let api: ApiPromise;
    let admin: KeyringPair;
    let deployedContract: ContractPromise;
    let adminContract: SmartContract;
    let user: KeyringPair;
    let userContract: SmartContract;

    const createStorageNode = (index = 0) => {
        const publicKey = createAccount().address;

        return adminContract.nodeCreate(
            publicKey,
            {url: `http://localhost:809${index}`, nodeCountryISOCode: 'US'},
            10000n,
            1n,
        );
    };

    const createCdnNode = (index = 0) => {
        const cdnNodeKey = createAccount().address;

        return adminContract.cdnNodeCreate(cdnNodeKey, {
            location: 'US',
            size: 1,
            url: `http://localhost:808${index}`,
        });
    };

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
        let createdStorageNodeKey: any;
        let createdCdnNodeKey: any;
        let createdClusterId: any;

        test('add trusted manager', async () => {
            await adminContract.grantTrustedManagerPermission(user.address);
        });

        test('create storage node', async () => {
            createdStorageNodeKey = await createStorageNode();

            expect(createdStorageNodeKey).toEqual(expect.any(String));
        });

        test('create CDN node', async () => {
            createdCdnNodeKey = await createCdnNode();

            expect(createdCdnNodeKey).toEqual(expect.any(String));
        });

        test('create storage cluster', async () => {
            createdClusterId = await adminContract.clusterCreate();

            expect(createdClusterId).toEqual(expect.any(Number));
        });

        test('create cluster', async () => {
            createdClusterId = await adminContract.clusterCreate();

            expect(createdClusterId).toEqual(expect.any(Number));
        });

        test('get cluster', async () => {
            expect(createdClusterId).toBeDefined();

            const foundCluster = await adminContract.clusterGet(createdClusterId);

            expect(foundCluster.clusterId).toEqual(createdClusterId);
        });

        test('get storage node', async () => {
            expect(createdStorageNodeKey).toBeDefined();

            const foundNode = await adminContract.nodeGet(createdStorageNodeKey);

            expect(foundNode.nodeId).toEqual(createdStorageNodeKey);
        });

        test('get CDN node', async () => {
            expect(createdCdnNodeKey).toBeDefined();

            const foundCluster = await adminContract.cdnNodeGet(createdCdnNodeKey);

            expect(foundCluster.nodeId).toEqual(createdCdnNodeKey);
        });

        test('get all clusters', async () => {
            const [clusters, totalCount] = await adminContract.clusterList();

            expect(totalCount).toBeGreaterThanOrEqual(1);
            expect(clusters).toEqual(expect.arrayContaining([expect.objectContaining({clusterId: createdClusterId})]));
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
            const vNodes = [1n, 2n, 3n];

            await adminContract.clusterAddNode(createdClusterId, createdStorageNodeKey, vNodes);
            const {cluster} = await adminContract.clusterGet(createdClusterId);

            expect(cluster.nodeIds).toEqual([createdStorageNodeKey]);
            expect(cluster.vNodes).toEqual([vNodes]);
        });

        test('reserve cluster resource', async () => {
            await adminContract.clusterReserveResource(createdClusterId, 500n);
        });

        test('change storage node tag', async () => {
            await adminContract.clusterChangeNodeTag(createdStorageNodeKey, 'OFFLINE' as any);

            const {node} = await adminContract.nodeGet(createdStorageNodeKey);

            expect(node.nodeTag).toEqual('OFFLINE');
        });

        test('change storage node params', async () => {
            const {params: origParams} = await adminContract.nodeGet(createdStorageNodeKey);
            const parsedOrigParams = JSON.parse(origParams);

            expect(parsedOrigParams.nodeCountryISOCode).toEqual('US');

            await adminContract.nodeChangeParams(createdStorageNodeKey, {
                ...parsedOrigParams,
                nodeCountryISOCode: 'EU',
            });

            const {params: newParams} = await adminContract.nodeGet(createdStorageNodeKey);
            const parsedNewParams = JSON.parse(newParams);

            expect(parsedNewParams.nodeCountryISOCode).toEqual('EU');
        });

        test('remove storage node from a cluster', async () => {
            await adminContract.clusterRemoveNode(createdClusterId, createdStorageNodeKey);

            const {cluster} = await adminContract.clusterGet(createdClusterId);

            expect(cluster.nodeIds).toEqual([]);
            expect(cluster.vNodes).toEqual([]);
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
            const nodeId = await createStorageNode(1);

            createdClusterId = await adminContract.clusterCreate([[1n]], [nodeId]);

            await adminContract.clusterReserveResource(createdClusterId, 500n);
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

            await userContract.bucketAllocIntoCluster(createdBucketId, 10n);
        });
    });
});
