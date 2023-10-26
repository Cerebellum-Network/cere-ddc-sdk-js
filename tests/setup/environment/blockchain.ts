import * as path from 'path';
import * as fs from 'fs';
import {DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait} from 'testcontainers';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {SmartContract} from '@cere-ddc-sdk/smart-contract';
import {NodeStatusInCluster} from '@cere-ddc-sdk/smart-contract/types';

import {bootstrapContract, createBlockhainApi, getAccount, getHostIP, transferCere} from '../../helpers';

export type ContractData = {
    account: string;
    clusterId: number;
    bucketIds: bigint[];
    contractAddress: string;
};

export type Blockchain = ContractData & {
    apiUrl: string;
};

let environment: StartedDockerComposeEnvironment | undefined;

const dataDir = path.resolve(__dirname, '../../data');
const uuid = {nextUuid: () => 'blockchain'};
const hostIp = getHostIP();

const setupContract = async (): Promise<ContractData> => {
    console.group('Setup smart contract');
    console.time('Done');

    await cryptoWaitReady();

    const api = await createBlockhainApi();
    const admin = getAccount();

    const clusterId = 0; // Always the same for fresh SC
    const bucketIds = [0n, 1n, 2n]; // Always the same for fresh SC
    const cdnNodeAccounts = [getAccount('//Bob'), getAccount('//Dave')];
    const storageNodeAccounts = [
        getAccount('//Eve'),
        getAccount('//Ferdie'),
        getAccount('//Charlie'),
        getAccount('//Alice'),
    ];

    console.time('Top-up user');
    await transferCere(api, admin.address, 1000);
    console.timeEnd('Top-up user');

    console.time('Deploy contract');
    const deployedContract = await bootstrapContract(api, admin);
    const contract = new SmartContract(admin, deployedContract);
    console.timeEnd('Deploy contract');

    console.time('Setup network topology');
    await contract.batch(() => [
        contract.clusterCreate({replicationFactor: 1}, 100000n),

        ...storageNodeAccounts.flatMap((account, index) => {
            const nodeUrl = `http://ddc-storage-node-${index + 1}:809${index + 1}`;

            return [
                contract.nodeCreate(account.address, {url: nodeUrl}, 100000000n, 1n),
                contract.clusterAddNode(clusterId, account.address, [BigInt(index) * 4611686018427387904n]),
                contract.clusterSetNodeStatus(clusterId, account.address, NodeStatusInCluster.ACTIVE),
            ];
        }),

        ...cdnNodeAccounts.flatMap((account, index) => [
            contract.cdnNodeCreate(account.address, {url: `http://${hostIp}:808${index + 1}`}),
            contract.clusterAddCdnNode(clusterId, account.address),
            contract.clusterSetCdnNodeStatus(clusterId, account.address, NodeStatusInCluster.ACTIVE),
        ]),
    ]);
    console.timeEnd('Setup network topology');

    console.time('Setup account and create buckets');
    await contract.batch(() => [
        contract.accountDeposit(200n),
        contract.accountBond(100n),

        ...bucketIds.flatMap((bucketId) => [
            contract.bucketCreate(admin.address, clusterId),
            contract.bucketSetAvailability(bucketId, true),
            contract.bucketAllocIntoCluster(bucketId, 1000n),
        ]),
    ]);
    console.timeEnd('Setup account and create buckets');

    await api.disconnect();
    console.log('');
    console.timeEnd('Done');
    console.log('');

    console.groupEnd();

    return {
        bucketIds,
        clusterId,
        account: admin.address,
        contractAddress: deployedContract.address.toString(),
    };
};

export const startBlockchain = async (): Promise<Blockchain> => {
    console.group('Blockchain');

    const bcStateFile = path.resolve(dataDir, './ddc.json');
    const isCached = fs.existsSync(bcStateFile);
    const composeFile = process.env.CI ? 'docker-compose.blockchain.ci.yml' : 'docker-compose.blockchain.yml';

    environment = await new DockerComposeEnvironment(__dirname, composeFile, uuid)
        .withEnv('BC_CAHCHE_DIR', path.resolve(dataDir, './blockchain'))
        .withWaitStrategy('cere-chain', Wait.forLogMessage(/Running JSON-RPC WS server/gi))
        .up();

    const contractData: ContractData = isCached
        ? JSON.parse(fs.readFileSync(bcStateFile).toString('utf8'), (key, value) =>
              key === 'bucketIds' ? value.map(BigInt) : value,
          )
        : await setupContract();

    if (!isCached) {
        const contractDataJson = JSON.stringify(
            contractData,
            (key, value) => (typeof value === 'bigint' ? value.toString() : value),
            2,
        );

        fs.writeFileSync(bcStateFile, contractDataJson);
    }

    console.log('Contract address', contractData.contractAddress);
    console.log('Account', contractData.account);
    console.log('Cluster ID', contractData.clusterId);
    console.log('Bucket IDs', contractData.bucketIds);

    console.groupEnd();

    return {
        ...contractData,
        apiUrl: `ws://${hostIp}:9944`,
    };
};

export const stopBlockchain = async () => {
    await environment?.down();

    console.log('Blockchain');
};