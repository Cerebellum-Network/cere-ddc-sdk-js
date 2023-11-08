import * as path from 'path';
import * as fs from 'fs';
import {DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait} from 'testcontainers';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {SmartContract} from '@cere-ddc-sdk/smart-contract';
import {NodeStatusInCluster} from '@cere-ddc-sdk/smart-contract/types';

import {
    bootstrapContract,
    createBlockhainApi,
    getAccount,
    getHostIP,
    transferCere,
    ContractData,
    getContractData,
    getGasLimit,
    signAndSend,
} from '../../helpers';
import {Blockchain} from '@cere-ddc-sdk/blockchain';
import {Abi, CodePromise} from '@polkadot/api-contract';
import {ApiPromise} from '@polkadot/api';
import {KeyringPair} from '@polkadot/keyring/types';

export type BlockchainConfig = ContractData & {
    apiUrl: string;
};

let environment: StartedDockerComposeEnvironment | undefined;

const dataDir = path.resolve(__dirname, '../../data');
const uuid = {nextUuid: () => 'blockchain'};
const hostIp = getHostIP();

const setupContract = async (api: ApiPromise): Promise<ContractData> => {
    console.group('Setup smart contract');
    console.time('Done');

    await cryptoWaitReady();

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

export const startBlockchain = async (): Promise<BlockchainConfig> => {
    console.group('Blockchain');

    const bcStateFile = path.resolve(dataDir, './ddc.json');
    const isCached = fs.existsSync(bcStateFile);
    const composeFile = process.env.CI ? 'docker-compose.blockchain.ci.yml' : 'docker-compose.blockchain.yml';

    environment = await new DockerComposeEnvironment(__dirname, composeFile, uuid)
        .withEnv('BC_CAHCHE_DIR', path.resolve(dataDir, './blockchain'))
        .withWaitStrategy('cere-chain', Wait.forLogMessage(/Running JSON-RPC WS server/gi))
        .up();

    const contractData: ContractData = !process.env.CI && isCached ? getContractData() : await setupBlockchain();

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

export const setupPallets = async (apiPromise: ApiPromise) => {
    console.group('Setup pallets');
    console.time('Done');
    await cryptoWaitReady();

    const admin = getAccount();
    const clusterId = '0x0000000000000000000000000000000000000000';
    const bucketIds = [0, 1, 2]; // Always the same for fresh SC
    const cdnNodeAccounts = [getAccount('//Bob'), getAccount('//Dave')];
    const storageNodeAccounts = [
        getAccount('//Eve'),
        getAccount('//Ferdie'),
        getAccount('//Charlie'),
        getAccount('//Alice'),
    ];

    console.time('Top-up user');
    await transferCere(apiPromise, admin.address, 1000);
    console.timeEnd('Top-up user');

    console.time('Deploy cluster node auth contract');
    const clusterNodeAuthorizationContractAddress = await deployClusterNodeAuthorizationContract(apiPromise, admin);
    console.timeEnd('Deploy cluster node auth contract');

    const blockchain = await Blockchain.create({account: admin, apiPromise});
    console.time('Create cluster and nodes');
    await blockchain.batchSend([
        blockchain.ddcClusters.createCluster(clusterId, {
            params: '',
            nodeProviderAuthContract: clusterNodeAuthorizationContractAddress,
        }),
        ...storageNodeAccounts.flatMap((storageNodeAccount, index) => [
            blockchain.ddcNodes.createStorageNode(storageNodeAccount.address, {
                grpcUrl: `ddc-storage-node-${index}:9099`,
            }),
            blockchain.ddcStaking.bondStorageNode(admin.address, storageNodeAccount.address, 100n * 10_000_000_000n),
            blockchain.ddcStaking.store(clusterId),
            blockchain.ddcStaking.setController(storageNodeAccount.address),
            blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNodeAccount.address),
        ]),
        ...cdnNodeAccounts.flatMap((cdnNodeAccount) => [
            blockchain.ddcNodes.createCdnNode(cdnNodeAccount.address, ''),
            blockchain.ddcStaking.bondCdnNode(admin.address, cdnNodeAccount.address, 100n * 10_000_000_000n),
            blockchain.ddcStaking.setController(cdnNodeAccount.address),
            blockchain.ddcClusters.addCdnNodeToCluster(clusterId, cdnNodeAccount.address),
        ]),
    ]);
    console.timeEnd('Create cluster and nodes');

    console.time('Create buckets');
    await blockchain.batchSend(bucketIds.flatMap((bucketId) => [blockchain.ddcCustomers.createBucket(clusterId)]));
    console.timeEnd('Create buckets');

    console.time('Done');
    console.groupEnd();
};

const deployClusterNodeAuthorizationContract = async (apiPromise: ApiPromise, admin: KeyringPair) => {
    const contractDir = path.resolve(__dirname, '../../fixtures/contract');

    const contractContent = fs.readFileSync(path.resolve(contractDir, 'cluster_node_candidate_authorization.contract'));
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

export async function setupBlockchain() {
    const api = await createBlockhainApi();

    await setupPallets(api);

    return setupContract(api);
}
