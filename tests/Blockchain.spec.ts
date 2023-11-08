import {Blockchain} from '@cere-ddc-sdk/blockchain';
import {createAccount, createBlockhainApi, getAccount, getGasLimit, signAndSend, transferCere} from './helpers';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {ApiPromise} from '@polkadot/api';
import {AddressOrPair} from '@polkadot/api/types';
import path from 'path';
import fs from 'fs/promises';
import {Abi, CodePromise} from '@polkadot/api-contract';
import {KeyringPair} from '@polkadot/keyring/types';

describe('packages/blockchain', () => {
    let apiPromise: ApiPromise;
    let blockchain: Blockchain;

    let admin: KeyringPair;
    let cdnNode1Key: string;
    let storageNode1Key: string;
    let storageNode2Key: string;
    let storageNode3Key: string;
    let nonExistentKey1: string;
    const clusterId = '0x0000000000000000000000000000000000000000';

    let nodeProviderAuthContract: string;

    const deployClusterNodeAuthorizationContract = async () => {
        const contractDir = path.resolve(__dirname, './fixtures/contract');

        const contractContent = await fs.readFile(
            path.resolve(contractDir, 'cluster_node_candidate_authorization.contract'),
        );
        const contract = JSON.parse(contractContent.toString());
        const wasm = contract.source.wasm.toString();
        const abi = new Abi(contract);
        const codePromise = new CodePromise(apiPromise, abi, wasm);
        const tx = codePromise.tx.new(
            {value: 0, gasLimit: await getGasLimit(apiPromise), storageDepositLimit: 750_000_000_000},
            true,
        );
        const {events} = await signAndSend(tx, admin, apiPromise);
        const foundEvent = events.find(({event}) => apiPromise.events.contracts.Instantiated.is(event));
        const [, address] = foundEvent?.event.toJSON().data as string[];

        return address;
    };

    beforeAll(async () => {
        await cryptoWaitReady();

        admin = getAccount();
        cdnNode1Key = getAccount('//Alice').address;
        storageNode1Key = getAccount('//Bob').address;
        storageNode2Key = getAccount('//Charlie').address;
        storageNode3Key = getAccount('//Dave').address;
        nonExistentKey1 = getAccount('//Eve').address;

        apiPromise = await createBlockhainApi();
        nodeProviderAuthContract = await deployClusterNodeAuthorizationContract();
    });

    afterAll(async () => {
        await apiPromise.disconnect();
    });

    test('Should create a Blockchain instance asynchronously', async () => {
        blockchain = await Blockchain.create({account: admin, apiPromise});
        expect(blockchain).toBeInstanceOf(Blockchain);
    });

    test('Should return null when finding a non-existent CDN Node', async () => {
        const cdnNode = await blockchain.ddcNodes.findCdnNodeByPublicKey(nonExistentKey1);
        expect(cdnNode).toBeUndefined();
    });

    test('Should return null when finding a non-existent Storage Node', async () => {
        const cdnNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(nonExistentKey1);
        expect(cdnNode).toBeUndefined();
    });

    test('Should create a CDN Node and find it by public key', async () => {
        await blockchain.send(blockchain.ddcNodes.createCdnNode(cdnNode1Key, ''));

        const cdnNode = await blockchain.ddcNodes.findCdnNodeByPublicKey(cdnNode1Key);

        expect(cdnNode).toBeDefined();
        expect(cdnNode?.pubKey).toBe(cdnNode1Key);
    });

    test('Should set CDN node params', async () => {
        const cdnNodeParams = '0x00000000';
        await blockchain.send(blockchain.ddcNodes.setCdnNodeParams(cdnNode1Key, cdnNodeParams));

        const cdnNode = await blockchain.ddcNodes.findCdnNodeByPublicKey(cdnNode1Key);

        expect(cdnNode).toBeDefined();
        expect(cdnNode?.props.params).toBe(cdnNodeParams);
    });

    test('Should create a Storage Node and find it by public key', async () => {
        await blockchain.send(
            blockchain.ddcNodes.createStorageNode(storageNode1Key, {grpcUrl: 'ddc-storage-node-2:9090'}),
        );

        const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode1Key);

        expect(storageNode).toBeDefined();
        expect(storageNode?.pubKey).toBe(storageNode1Key);
    });

    test('Should set Storage node params', async () => {
        const storageNodeParams = {grpcUrl: 'ddc-storage-node-2:8091'};
        await blockchain.send(blockchain.ddcNodes.setStorageNodeParams(storageNode1Key, storageNodeParams));

        const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode1Key);

        expect(storageNode).toBeDefined();
        expect(storageNode?.props.params).toEqual(storageNodeParams);
    });

    test('Should create a cluster and find it by public key', async () => {
        const clusterParams = '0x';
        await blockchain.send(
            blockchain.ddcClusters.createCluster(clusterId, {
                params: clusterParams,
                nodeProviderAuthContract,
            }),
        );

        const cluster = await blockchain.ddcClusters.findClusterById(clusterId);

        expect(cluster).toBeDefined();
        expect(cluster?.clusterId).toBe(clusterId);
        expect(cluster?.props.params).toBe(clusterParams);
    });

    test('Should list clusters', async () => {
        const clusters = await blockchain.ddcClusters.listClusters();
        expect(clusters).toBeDefined();
        expect(clusters.length).toBe(1);
    });

    test('Should set cluster params', async () => {
        const clusterParams = '0x';
        await blockchain.send(
            blockchain.ddcClusters.setClusterParams(clusterId, {
                params: clusterParams,
                nodeProviderAuthContract,
            }),
        );

        const cluster = await blockchain.ddcClusters.findClusterById(clusterId);

        expect(cluster).toBeDefined();
        expect(cluster?.props.params).toBe(clusterParams);
    });

    test('Should fail to add a Storage Node to a cluster when not staked', async () => {
        await expect(() =>
            blockchain.send(blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNode1Key)),
        ).rejects.toThrow('ddcClusters.NoStake');
    });

    test('Should fail to add a CDN Node to a cluster when not staked', async () => {
        await expect(() =>
            blockchain.send(blockchain.ddcClusters.addCdnNodeToCluster(clusterId, cdnNode1Key)),
        ).rejects.toThrow('ddcClusters.NoStake');
    });

    test('Should create 2 Storage nodes in batch', async () => {
        await blockchain.batchSend([
            blockchain.ddcNodes.createStorageNode(storageNode2Key, {grpcUrl: 'ddc-storage-node-2:9090'}),
            blockchain.ddcNodes.createStorageNode(storageNode3Key, {grpcUrl: 'ddc-storage-node-3:9090'}),
        ]);

        const storageNode2 = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode2Key);
        const storageNode3 = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode3Key);

        expect(storageNode2).toBeDefined();
        expect(storageNode3).toBeDefined();
    });

    test('Should bond storage node', async () => {
        await blockchain.batchSend([
            blockchain.ddcStaking.bondStorageNode(admin.address, storageNode1Key, 100n * 10_000_000_000n),
            blockchain.ddcStaking.store(clusterId),
            blockchain.ddcStaking.setController(storageNode1Key),
        ]);
    });

    test('Should add storage node to cluster', async () => {
        await blockchain.send(blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNode1Key));
        const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode1Key);
        expect(storageNode?.clusterId).toBe(clusterId);
        const nodeKeys = await blockchain.ddcClusters.listNodeKeys(clusterId);
        expect(nodeKeys).toContain(storageNode1Key);
    });

    test('Should create bucket', async () => {
        await blockchain.send(blockchain.ddcCustomers.createBucket(clusterId));
    });
});
