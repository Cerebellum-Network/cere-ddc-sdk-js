import {ApiPromise} from '@polkadot/api';
import {KeyringPair} from '@polkadot/keyring/types';
import {ContractPromise} from '@polkadot/api-contract';
import {SmartContract} from '@cere-ddc-sdk/smart-contract';
import {NodeStatusInCluster} from '@cere-ddc-sdk/smart-contract/types';

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

        test('create cluster', async () => {
            createdClusterId = await adminContract.clusterCreate();

            expect(createdClusterId).toEqual(expect.any(Number));
        });

        test('get cluster', async () => {
            const foundCluster = await adminContract.clusterGet(createdClusterId);

            expect(foundCluster.clusterId).toEqual(createdClusterId);
        });

        test('get storage node', async () => {
            const foundNode = await adminContract.nodeGet(createdStorageNodeKey);

            expect(foundNode.nodeKey).toEqual(createdStorageNodeKey);
        });

        test('get CDN node', async () => {
            const foundCluster = await adminContract.cdnNodeGet(createdCdnNodeKey);

            expect(foundCluster.cdnNodeKey).toEqual(createdCdnNodeKey);
        });

        test('get all clusters', async () => {
            const [clusters, totalCount] = await adminContract.clusterList();

            expect(totalCount).toBeGreaterThanOrEqual(1);
            expect(clusters).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        clusterId: createdClusterId,
                    }),
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

        test('add storage node to cluster', async () => {
            const vNodes = [1n, 2n, 3n];

            await adminContract.clusterAddNode(createdClusterId, createdStorageNodeKey, vNodes);
            const {cluster, clusterVNodes} = await adminContract.clusterGet(createdClusterId);

            expect(cluster.nodesKeys).toEqual([createdStorageNodeKey]);
            expect(clusterVNodes).toEqual([
                {
                    vNodes,
                    nodeKey: createdStorageNodeKey,
                },
            ]);
        });

        test('add CDN node to cluster', async () => {
            await adminContract.clusterAddCdnNode(createdClusterId, createdCdnNodeKey);
            const {cluster} = await adminContract.clusterGet(createdClusterId);

            expect(cluster.cdnNodesKeys).toEqual([createdCdnNodeKey]);
        });

        test('set resource per vNode', async () => {
            await adminContract.clusterSetResourcePerVNode(createdClusterId, 500n);
        });

        test('change storage node status in cluster', async () => {
            await adminContract.clusterSetNodeStatus(
                createdClusterId,
                createdStorageNodeKey,
                NodeStatusInCluster.OFFLINE,
            );

            const {node} = await adminContract.nodeGet(createdStorageNodeKey);

            expect(node.statusInCluster).toEqual(NodeStatusInCluster.OFFLINE);
        });

        test('change storage node params', async () => {
            const {
                node: {nodeParams: origParams},
            } = await adminContract.nodeGet(createdStorageNodeKey);

            expect(origParams.nodeCountryISOCode).toEqual('US');

            await adminContract.nodeSetParams(createdStorageNodeKey, {
                ...origParams,
                nodeCountryISOCode: 'EU',
            });

            const {node} = await adminContract.nodeGet(createdStorageNodeKey);

            expect(node.nodeParams.nodeCountryISOCode).toEqual('EU');
        });

        test('change CDN node params', async () => {
            const {
                cdnNode: {cdnNodeParams: origParams},
            } = await adminContract.cdnNodeGet(createdCdnNodeKey);

            expect(origParams.location).toEqual('US');

            await adminContract.cdnNodeSetParams(createdCdnNodeKey, {
                ...origParams,
                location: 'EU',
            });

            const {cdnNode} = await adminContract.cdnNodeGet(createdCdnNodeKey);

            expect(cdnNode.cdnNodeParams.location).toEqual('EU');
        });

        test('remove storage node from cluster', async () => {
            await adminContract.clusterRemoveNode(createdClusterId, createdStorageNodeKey);

            const {cluster} = await adminContract.clusterGet(createdClusterId);

            expect(cluster.nodesKeys).not.toContain(createdStorageNodeKey);
        });

        test('remove CDN node from cluster', async () => {
            await adminContract.clusterRemoveCdnNode(createdClusterId, createdCdnNodeKey);

            const {cluster} = await adminContract.clusterGet(createdClusterId);

            expect(cluster.cdnNodesKeys).not.toContain(createdCdnNodeKey);
        });

        test('remove cluster', async () => {
            await adminContract.clusterRemove(createdClusterId);

            const [clusters] = await adminContract.clusterList();

            expect(clusters).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        clusterId: createdClusterId,
                    }),
                ]),
            );
        });

        test('remove storage node', async () => {
            await adminContract.nodeRemove(createdStorageNodeKey);

            const [nodes] = await adminContract.nodeList();

            expect(nodes).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        nodeKey: createdStorageNodeKey,
                    }),
                ]),
            );
        });

        test('remove CDN node', async () => {
            await adminContract.cdnNodeRemove(createdCdnNodeKey);

            const [nodes] = await adminContract.cdnNodeList();

            expect(nodes).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        nodeKey: createdCdnNodeKey,
                    }),
                ]),
            );
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

            createdClusterId = await adminContract.clusterCreate({}, 500n);

            const storageNodeId = await createStorageNode(1);
            await adminContract.clusterAddNode(createdClusterId, storageNodeId, [1n, 2n, 3n]);
        });

        test('create bucket', async () => {
            createdBucketId = await userContract.bucketCreate(user.address, createdClusterId);

            expect(createdBucketId).toEqual(expect.any(BigInt));
        });

        test('get bucket', async () => {
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
            await userContract.bucketAllocIntoCluster(createdBucketId, 10n);
        });
    });
});
