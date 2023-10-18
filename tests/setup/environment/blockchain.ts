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

    environment = await new DockerComposeEnvironment(__dirname, 'docker-compose.blockchain.yml', uuid)
        .withWaitStrategy('cere-chain', Wait.forLogMessage(/Running JSON-RPC WS server/gi))
        .up();

    await cryptoWaitReady();

    const api = await createBlockhainApi();
    const admin = getAccount();

    await transferCere(api, admin.address, 1000);

    const deployedContract = await bootstrapContract(api, admin);
    console.log('Contract address', deployedContract.address.toString());

    const contract = new SmartContract(admin, deployedContract);

    await contract.accountDeposit(200n);
    await contract.accountBond(100n);
    console.log('Account', admin.address);

    const clusterId = await contract.clusterCreate({replicationFactor: 1}, 100000n);
    console.log('Cluster ID', clusterId);

    const cdnNodeAccounts = [getAccount('//Bob'), getAccount('//Dave')];
    const storageNodeAccounts = [getAccount('//Eve'), getAccount('//Ferdie'), getAccount('//Charlie')];

    await contract.batch(() =>
        storageNodeAccounts.flatMap((account, index) => [
            contract.nodeCreate(account.address, {url: `http://${hostIp}:809${index}`}, 100000000n, 1n),
            contract.clusterAddNode(clusterId, account.address, [BigInt(index) * 4611686018427387904n]),
        ]),
    );

    await contract.batch(() =>
        cdnNodeAccounts.flatMap((account, index) => [
            contract.cdnNodeCreate(account.address, {url: `http://${hostIp}:808${index}`}),
            contract.clusterAddCdnNode(clusterId, account.address),
        ]),
    );

    await contract.batch(() => [
        ...storageNodeAccounts.flatMap((account) =>
            contract.clusterSetNodeStatus(clusterId, account.address, NodeStatusInCluster.ACTIVE),
        ),

        ...cdnNodeAccounts.flatMap((account) =>
            contract.clusterSetCdnNodeStatus(clusterId, account.address, NodeStatusInCluster.ACTIVE),
        ),
    ]);

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

    console.log('Bucket IDs', bucketIds);

    await api.disconnect();

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
