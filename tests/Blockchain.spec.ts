import {Blockchain} from '@cere-ddc-sdk/blockchain';
import {createBlockhainApi, getAccount, getGasLimit, signAndSend, transferCere} from './helpers';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {ApiPromise} from '@polkadot/api';
import {AddressOrPair} from '@polkadot/api/types';
import path from 'path';
import fs from 'fs/promises';
import {Abi, CodePromise} from '@polkadot/api-contract';

describe('packages/blockchain', () => {
    let apiPromise: ApiPromise;
    let blockchain: Blockchain;

    let admin: AddressOrPair;
    let cdnNode1Key: string;
    let storageNode2Key: string;
    let nonExistentKey1: string;
    const clusterId = '0x0000000000000000000000000000000000000000';

    const deployClusterNodeAuthorizationContract = async (apiPromise: ApiPromise) => {
        const contractDir = path.resolve(__dirname, '../fixtures/contract');

        const contractContent = await fs.readFile(
            path.resolve(contractDir, 'cluster_node_candidate_authorization.contract'),
        );
        const contract = JSON.parse(contractContent.toString());
        const wasm = contract.source.wasm.toString();
        const codePromise = new CodePromise(api, abi, wasm);
        const tx = codePromise.tx.new({
            value: 0,
            gasLimit: await getGasLimit(apiPromise),
            storageDepositLimit: 750_000_000_000,
        });
        const {events} = await signAndSend(tx, account);
        const foundEvent = events.find(({event}) => api.events.contracts.Instantiated.is(event));
        const [, address] = foundEvent?.event.toJSON().data as string[];

        return address;
    };

    beforeAll(async () => {
        await cryptoWaitReady();

        admin = getAccount('//Alice');
        cdnNode1Key = getAccount('//Bob').address;
        storageNode2Key = getAccount('//Eve').address;
        nonExistentKey1 = getAccount('//Ferdie').address;

        apiPromise = await createBlockhainApi();
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
        const cdnNodeParams = '0x';
        await blockchain.send(blockchain.ddcNodes.setCdnNodeParams(cdnNode1Key, cdnNodeParams));

        const cdnNode = await blockchain.ddcNodes.findCdnNodeByPublicKey(cdnNode1Key);

        expect(cdnNode).toBeDefined();
        expect(cdnNode?.props.params).toBe(cdnNodeParams);
    });

    test('Should create a Storage Node and find it by public key', async () => {
        await blockchain.send(blockchain.ddcNodes.createStorageNode(storageNode2Key, ''));

        const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode2Key);

        expect(storageNode).toBeDefined();
        expect(storageNode?.pubKey).toBe(storageNode2Key);
    });

    test('Should set Storage node params', async () => {
        const storageNodeParams = '0x';
        await blockchain.send(blockchain.ddcNodes.setStorageNodeParams(storageNode2Key, storageNodeParams));

        const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode2Key);

        expect(storageNode).toBeDefined();
        expect(storageNode?.props.params).toBe(storageNodeParams);
    });

    test('Should create a cluster and find it by public key', async () => {
        const clusterParams = '0x';
        await blockchain.send(
            blockchain.ddcClusters.createCluster(clusterId, {
                params: clusterParams,
                nodeProviderAuthContract: '0x00000000000000000000',
            }),
        );

        const cluster = await blockchain.ddcClusters.findClusterById(clusterId);

        expect(cluster).toBeDefined();
        expect(cluster?.clusterId).toBe(clusterId);
        expect(cluster?.props.params).toBe('');
    });

    test('Should list clusters', async () => {
        const clusters = await blockchain.ddcClusters.listClusters();
        expect(clusters).toBeDefined();
        expect(clusters.length).toBe(1);
    });

    test('Should set cluster params', async () => {
        const clusterParams = 'clusterParams';
        await blockchain.send(
            blockchain.ddcClusters.setClusterParams(clusterId, {
                params: clusterParams,
                nodeProviderAuthContract: '0x00000000000000000000',
            }),
        );

        const cluster = await blockchain.ddcClusters.findClusterById(clusterId);

        expect(cluster).toBeDefined();
        expect(cluster?.params).toBe(clusterParams);
    });
});
