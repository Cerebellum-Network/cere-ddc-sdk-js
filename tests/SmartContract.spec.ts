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
            1n,
            {url: `http://localhost:809${index}`, nodeCountryISOCode: 'US'},
            10000n,
            'ACTIVE' as any,
            publicKey,
        );
    };

    const createCdnNode = (index = 0) => {
        const publicKey = createAccount().address;

        return adminContract.cdnNodeCreate({
            publicKey,
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
        let createdStorageNodeId: any;
        let createdCdnNodeId: any;
        let createdStorageClusterId: any;
        let createdCdnClusterId: any;

        test('add trusted manager', async () => {
            await adminContract.nodeTrustManager(user.address);
        });

        test('create storage node', async () => {
            createdStorageNodeId = await createStorageNode();

            expect(createdStorageNodeId).toEqual(expect.any(Number));
        });

        test('create CDN node', async () => {
            createdCdnNodeId = await createCdnNode();

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
            const vNodes = [1n, 2n, 3n];
            const nodeIds = [createdStorageNodeId];

            await adminContract.clusterAddNode(createdStorageClusterId, createdStorageNodeId, vNodes);
            const {cluster} = await adminContract.clusterGet(createdStorageClusterId);

            expect(cluster.nodeIds).toEqual(nodeIds);
            expect(cluster.vNodes).toEqual(vNodes);
        });

        test('reserve cluster resource', async () => {
            await adminContract.clusterReserveResource(createdStorageClusterId, 500n);
        });

        test('change storage node tag', async () => {
            await adminContract.clusterChangeNodeTag(createdStorageNodeId, 'OFFLINE' as any);

            const {node} = await adminContract.nodeGet(createdStorageNodeId);

            expect(node.nodeTag).toEqual('OFFLINE');
        });

        test('change storage node params', async () => {
            const {params: origParams} = await adminContract.nodeGet(createdStorageNodeId);
            const parsedOrigParams = JSON.parse(origParams);

            expect(parsedOrigParams.nodeCountryISOCode).toEqual('US');

            await adminContract.nodeChangeParams(createdStorageNodeId, {
                ...parsedOrigParams,
                nodeCountryISOCode: 'EU',
            });

            const {params: newParams} = await adminContract.nodeGet(createdStorageNodeId);
            const parsedNewParams = JSON.parse(newParams);

            expect(parsedNewParams.nodeCountryISOCode).toEqual('US');
        });

        test('remove storage node from a cluster', async () => {
            await adminContract.clusterRemoveNode(createdStorageClusterId, createdStorageNodeId);

            const {cluster} = await adminContract.clusterGet(createdStorageClusterId);

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
