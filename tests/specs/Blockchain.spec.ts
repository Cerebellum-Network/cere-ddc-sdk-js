import {Blockchain} from '@cere-ddc-sdk/blockchain';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {ApiPromise} from '@polkadot/api';
import {KeyringPair} from '@polkadot/keyring/types';

import {createAccount, createBlockhainApi, deployAuthContract, getAccount, transferCere} from '../helpers';

describe('Blockchain', () => {
    let apiPromise: ApiPromise;
    let blockchain: Blockchain;

    let rootAccount: KeyringPair;
    let storageNode1Account: KeyringPair;
    let nodeProviderAccount: KeyringPair;
    let cdnNode1Key: string;
    let storageNode1Key: string;
    let storageNode2Key: string;
    let storageNode3Key: string;
    let nonExistentKey1: string;
    const clusterId = '0x0000000000000000000000000000000000000001';
    const bondSize = 10_000_000_000n;
    let nodeProviderAuthContract: string;

    beforeAll(async () => {
        await cryptoWaitReady();

        rootAccount = getAccount('//Alice');
        cdnNode1Key = createAccount().address;
        storageNode1Account = createAccount().account;
        nodeProviderAccount = createAccount().account;
        storageNode1Key = storageNode1Account.address;
        storageNode2Key = createAccount().address;
        storageNode3Key = createAccount().address;
        nonExistentKey1 = createAccount().address;

        apiPromise = await createBlockhainApi();
        nodeProviderAuthContract = await deployAuthContract(apiPromise, rootAccount);
        await transferCere(apiPromise, storageNode1Account.address, 10);
        await transferCere(apiPromise, nodeProviderAccount.address, 10);
    });

    afterAll(async () => {
        await apiPromise.disconnect();
    });

    test('Should create a Blockchain instance asynchronously', async () => {
        blockchain = await Blockchain.connect({account: rootAccount, apiPromise});
        expect(blockchain).toBeInstanceOf(Blockchain);
    });

    test('Should return null when finding a non-existent CDN Node', async () => {
        const cdnNode = await blockchain.ddcNodes.findCdnNodeByPublicKey(nonExistentKey1);
        expect(cdnNode).toBeUndefined();
    });

    test('Should return null when finding a non-existent Storage Node', async () => {
        const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(nonExistentKey1);
        expect(storageNode).toBeUndefined();
    });

    test('Should create a CDN Node and find it by public key', async () => {
        const cdnNodeProps = {
            host: 'ddc-cdn-node-0',
            httpPort: 9090,
            grpcPort: 8080,
            p2pPort: 7070,
        };

        await blockchain.send(blockchain.ddcNodes.createCdnNode(cdnNode1Key, cdnNodeProps));

        const cdnNode = await blockchain.ddcNodes.findCdnNodeByPublicKey(cdnNode1Key);

        expect(cdnNode).toBeDefined();
        expect(cdnNode?.pubKey).toBe(cdnNode1Key);
        expect(cdnNode?.props).toEqual(cdnNodeProps);
    });

    test('Should set CDN node props', async () => {
        const cdnNodeProps = {
            host: 'ddc-cdn-node-0',
            httpPort: 1010,
            grpcPort: 2020,
            p2pPort: 3030,
        };
        await blockchain.send(blockchain.ddcNodes.setCdnNodeProps(cdnNode1Key, cdnNodeProps));

        const cdnNode = await blockchain.ddcNodes.findCdnNodeByPublicKey(cdnNode1Key);

        expect(cdnNode).toBeDefined();
        expect(cdnNode?.props).toEqual(cdnNodeProps);
    });

    test('Should create a Storage Node and find it by public key', async () => {
        const storageNodeProps = {
            host: 'ddc-storage-node-0',
            httpPort: 4010,
            grpcPort: 5020,
            p2pPort: 6030,
        };
        await blockchain.send(blockchain.ddcNodes.createStorageNode(storageNode1Key, storageNodeProps));

        const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode1Key);

        expect(storageNode).toBeDefined();
        expect(storageNode?.pubKey).toBe(storageNode1Key);
        expect(storageNode?.props).toEqual(storageNodeProps);
    });

    test('Should set Storage node props', async () => {
        const storageNodeProps = {
            host: 'ddc-storage-node-0',
            httpPort: 3010,
            grpcPort: 3020,
            p2pPort: 3030,
        };
        await blockchain.send(blockchain.ddcNodes.setStorageNodeProps(storageNode1Key, storageNodeProps));

        const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode1Key);

        expect(storageNode).toBeDefined();
        expect(storageNode?.props).toEqual(storageNodeProps);
    });

    test('Should create a cluster and find it by public key', async () => {
        expect(nodeProviderAuthContract).toBeDefined();

        const clusterGovernmentParams = {
            treasuryShare: 0,
            validatorsShare: 0,
            clusterReserveShare: 0,
            cdnBondSize: bondSize,
            cdnChillDelay: 0,
            cdnUnbondingDelay: 0,
            storageBondSize: bondSize,
            storageChillDelay: 0,
            storageUnbondingDelay: 0,
            unitPerMbStored: 0n,
            unitPerMbStreamed: 0n,
            unitPerPutRequest: 0n,
            unitPerGetRequest: 0n,
        };
        const clusterProps = {
            nodeProviderAuthContract,
        };

        await blockchain.send(
            blockchain.sudo(
                blockchain.ddcClusters.createCluster(
                    clusterId,
                    rootAccount.address,
                    rootAccount.address,
                    clusterProps,
                    clusterGovernmentParams,
                ),
            ),
        );

        const cluster = await blockchain.ddcClusters.findClusterById(clusterId);

        expect(cluster).toBeDefined();
        expect(cluster?.clusterId).toBe(clusterId);
        expect(cluster?.props).toEqual(clusterProps);
        expect(cluster?.managerId).toBe(rootAccount.address);
        expect(cluster?.reserveId).toBe(rootAccount.address);
    });

    test('Should list non empty clusters', async () => {
        const clusters = await blockchain.ddcClusters.listClusters();
        expect(clusters).toBeDefined();
        expect(clusters.length).toBeGreaterThan(0);
    });

    test('Should set cluster props', async () => {
        const clusterProps = {
            nodeProviderAuthContract,
        };
        await blockchain.send(blockchain.ddcClusters.setClusterParams(clusterId, clusterProps));

        const cluster = await blockchain.ddcClusters.findClusterById(clusterId);

        expect(cluster).toBeDefined();
        expect(cluster?.props).toEqual(clusterProps);
    });

    test('Should fail to add a Storage Node to a cluster when not staked', async () => {
        await expect(() =>
            blockchain.send(blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNode1Key)),
        ).rejects.toThrow('ddcClusters.NodeHasNoStake:');
    });

    test('Should fail to add a CDN Node to a cluster when not staked', async () => {
        await expect(() =>
            blockchain.send(blockchain.ddcClusters.addCdnNodeToCluster(clusterId, cdnNode1Key)),
        ).rejects.toThrow('ddcClusters.NodeHasNoStake:');
    });

    test('Should create 2 Storage nodes in batch', async () => {
        const storageNode2Props = {
            host: 'ddc-storage-node-2',
            httpPort: 3010,
            grpcPort: 3020,
            p2pPort: 3030,
        };

        const storageNode3Props = {
            host: 'ddc-storage-node-3',
            httpPort: 3010,
            grpcPort: 3020,
            p2pPort: 3030,
        };

        await blockchain.batchSend([
            blockchain.ddcNodes.createStorageNode(storageNode2Key, storageNode2Props),
            blockchain.ddcNodes.createStorageNode(storageNode3Key, storageNode3Props),
        ]);

        const storageNode2 = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode2Key);
        const storageNode3 = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode3Key);

        expect(storageNode2).toBeDefined();
        expect(storageNode3).toBeDefined();
    });

    test('Should bond storage node', async () => {
        // await blockchain.batchSend([
        //     blockchain.ddcStaking.bondStorageNode(rootAccount.address, storageNode1Key, bondSize),
        //     blockchain.ddcStaking.store(clusterId),
        //     blockchain.ddcStaking.setController(storageNode1Key),
        // ]);
        const blockchain = await Blockchain.connect({account: nodeProviderAccount, apiPromise});

        await blockchain.send(
            blockchain.ddcStaking.bondStorageNode(nodeProviderAccount.address, storageNode1Key, bondSize),
        );

        await blockchain.send(blockchain.ddcStaking.store(clusterId));
        // await blockchain.send(blockchain.ddcStaking.setController(storageNode1Key));

        // const stakeClusterId = await blockchain.ddcStaking.findStorageNodeStakeClusterId(storageNode1Key);
        // expect(stakeClusterId).toBe(clusterId);
    });

    test('Should add storage node to cluster', async () => {
        await blockchain.send(blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNode1Key));
        const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode1Key);
        expect(storageNode?.clusterId).toBe(clusterId);
        const nodeKeys = await blockchain.ddcClusters.listNodeKeys(clusterId);
        expect(nodeKeys).toContain(storageNode1Key);
    });

    test('Should create bucket', async () => {
        const result = await blockchain.send(blockchain.ddcCustomers.createBucket(clusterId));
        const bucketIds = blockchain.ddcCustomers.extractCreatedBucketIds(result.events);
        expect(bucketIds.length).toBe(1);
    });

    test('Should list buckets', async () => {
        const buckets = await blockchain.ddcCustomers.listBuckets();
        expect(buckets.length).toBeGreaterThan(0);
    });
});