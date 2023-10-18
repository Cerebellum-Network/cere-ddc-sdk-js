import {DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait} from 'testcontainers';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {SmartContract} from '@cere-ddc-sdk/smart-contract';
import {NodeStatusInCluster} from '@cere-ddc-sdk/smart-contract/types';

import {bootstrapContract, createBlockhainApi, getAccount, getHostIP, transferCere} from '../../helpers';

export type ContractData = {
    clusterId: number;
    bucketIds: bigint[];
    contractAddress: string;
};

export type Blockchain = ContractData & {
    apiUrl: string;
};

let environment: StartedDockerComposeEnvironment | undefined;

const uuid = {nextUuid: () => 'blockchain'};
const hostIp = getHostIP();

const setupContract = async (): Promise<ContractData> => {
    console.group('Setup smart contract');
    console.time('Done');

    environment = await new DockerComposeEnvironment(__dirname, 'docker-compose.blockchain.yml', uuid)
        .withWaitStrategy('cere-chain', Wait.forLogMessage(/Running JSON-RPC WS server/gi))
        .up();

    await cryptoWaitReady();

    const api = await createBlockhainApi();
    const admin = getAccount();

    console.time('Deploy contract');
    await transferCere(api, admin.address, 1000);
    const deployedContract = await bootstrapContract(api, admin);
    const contract = new SmartContract(admin, deployedContract);
    console.timeEnd('Deploy contract');

    console.time('Create account');
    await contract.batch(() => [contract.accountDeposit(200n), contract.accountBond(100n)]);
    console.timeEnd('Create account');

    console.time('Create cluster');
    const clusterId = await contract.clusterCreate({replicationFactor: 1}, 100000n);
    console.timeEnd('Create cluster');

    const cdnNodeAccounts = [getAccount('//Bob'), getAccount('//Dave')];
    const storageNodeAccounts = [
        getAccount('//Eve'),
        getAccount('//Ferdie'),
        getAccount('//Charlie'),
        getAccount('//Alice'),
    ];

    console.time('Add storage nodes');
    for (const [index, account] of storageNodeAccounts.entries()) {
        const nodeUrl = `http://ddc-storage-node-${index + 1}:809${index + 1}`;

        await contract.batch(() => [
            contract.nodeCreate(account.address, {url: nodeUrl}, 100000000n, 1n),
            contract.clusterAddNode(clusterId, account.address, [BigInt(index) * 4611686018427387904n]),
            contract.clusterSetNodeStatus(clusterId, account.address, NodeStatusInCluster.ACTIVE),
        ]);
    }
    console.timeEnd('Add storage nodes');

    console.time('Add CDN nodes');
    for (const [index, account] of cdnNodeAccounts.entries()) {
        await contract.batch(() => [
            contract.cdnNodeCreate(account.address, {url: `http://${hostIp}:808${index + 1}`}),
            contract.clusterAddCdnNode(clusterId, account.address),
            contract.clusterSetCdnNodeStatus(clusterId, account.address, NodeStatusInCluster.ACTIVE),
        ]);
    }
    console.timeEnd('Add CDN nodes');

    console.time('Create buckets');
    const bucketIds = await contract.batch(() => [
        contract.bucketCreate(admin.address, clusterId),
        contract.bucketCreate(admin.address, clusterId),
        contract.bucketCreate(admin.address, clusterId),
    ]);

    await contract.batch(() =>
        bucketIds.flatMap((bucketId) => [
            contract.bucketSetAvailability(bucketId, true),
            contract.bucketAllocIntoCluster(bucketId, 1000n),
        ]),
    );
    console.timeEnd('Create buckets');

    await api.disconnect();
    console.log('');
    console.timeEnd('Done');

    console.log('');
    console.log('Contract address', deployedContract.address.toString());
    console.log('Account', admin.address);
    console.log('Cluster ID', clusterId);
    console.log('Bucket IDs', bucketIds);

    console.groupEnd();

    return {
        bucketIds,
        clusterId,
        contractAddress: deployedContract.address.toString(),
    };
};

export const startBlockchain = async (): Promise<Blockchain> => {
    const contractData = await setupContract();

    return {
        ...contractData,
        apiUrl: `ws://${hostIp}:9944`,
    };
};

export const stopBlockchain = async () => {
    await environment?.down();
};
