import * as path from 'path';
import * as fs from 'fs';
import { DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait } from 'testcontainers';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import {
  createBlockhainApi,
  getAccount,
  readBlockchainStateFromDisk,
  BlockchainState,
  deployAuthContract,
  CERE,
  writeBlockchainStateToDisk,
  sendMultipleTransfers,
  BLOCKCHAIN_RPC_URL,
  getHostIP,
} from '../../helpers';
import { Blockchain, ClusterId } from '@cere-ddc-sdk/blockchain';

export type BlockchainConfig = BlockchainState & {
  apiUrl: string;
};

let environment: StartedDockerComposeEnvironment | undefined;

const dataDir = path.resolve(__dirname, '../../data');
const uuid = { nextUuid: () => 'blockchain' };

export const startBlockchain = async (): Promise<BlockchainConfig> => {
  console.group('Blockchain');

  const hostIp = getHostIP();
  const composeFile = process.env.CI ? 'docker-compose.blockchain.ci.yml' : 'docker-compose.blockchain.yml';
  const cachedStatePath = path.resolve(dataDir, './ddc.json');
  const bcCachePath = path.resolve(dataDir, './blockchain');

  let chachedState = fs.existsSync(cachedStatePath) ? readBlockchainStateFromDisk() : undefined;

  if (chachedState && hostIp !== chachedState?.hostIp) {
    console.warn('Host IP has changed, removing the cached state');

    chachedState = undefined;

    fs.rmdirSync(bcCachePath, { recursive: true });
    fs.unlinkSync(cachedStatePath);
  }

  environment = await new DockerComposeEnvironment(__dirname, composeFile, uuid)
    .withEnv('BC_CAHCHE_DIR', bcCachePath)
    .withWaitStrategy('cere-chain', Wait.forLogMessage(/Running JSON-RPC WS server/gi))
    .up();

  const blockchainState: BlockchainState = !process.env.CI && chachedState ? chachedState : await setupBlockchain();

  if (!chachedState && !process.env.CI) {
    writeBlockchainStateToDisk(blockchainState);
  }

  console.dir(blockchainState, { depth: null });

  console.groupEnd();

  return {
    ...blockchainState,
    apiUrl: BLOCKCHAIN_RPC_URL,
  };
};

export const stopBlockchain = async () => {
  await environment?.down();

  console.log('Blockchain');
};

export const setupBlockchain = async () => {
  console.group('Setup pallets');
  console.time('Done');

  await cryptoWaitReady();

  const hostIp = getHostIP();
  const apiPromise = await createBlockhainApi();
  const rootAccount = getAccount();
  const clusterManagerAccount = getAccount('//Alice');
  const clusterId: ClusterId = '0x0000000000000000000000000000000000000001';
  const bucketIds = [1n, 2n, 3n];
  const storageNodeAccounts = [
    getAccount('//Eve'),
    getAccount('//Ferdie'),
    getAccount('//Charlie'),
    getAccount('//Alice'),
  ];
  const bondAmount = 100n * CERE;

  console.time('Top-up accounts');
  await sendMultipleTransfers(apiPromise, [
    { to: rootAccount.address, tokens: 1000 },

    /**
     * Top up node providers
     */
    ...storageNodeAccounts.map((storageNodeAccount) => ({ to: storageNodeAccount.address, tokens: 500 })),
  ]);
  console.timeEnd('Top-up accounts');

  console.time('Deploy cluster node auth contract');
  const clusterNodeAuthorizationContractAddress = await deployAuthContract(apiPromise, clusterManagerAccount);
  console.timeEnd('Deploy cluster node auth contract');

  const blockchain = await Blockchain.connect({ account: clusterManagerAccount, apiPromise });

  console.time('Create cluster');
  await blockchain.send(
    blockchain.sudo(
      blockchain.ddcClusters.createCluster(
        clusterId,
        clusterManagerAccount.address,
        clusterManagerAccount.address,
        {
          nodeProviderAuthContract: clusterNodeAuthorizationContractAddress,
        },
        {
          treasuryShare: 100000000,
          validatorsShare: 100000000,
          clusterReserveShare: 100000000,
          cdnBondSize: bondAmount,
          cdnChillDelay: 20,
          cdnUnbondingDelay: 20,
          storageBondSize: bondAmount,
          storageChillDelay: 20,
          storageUnbondingDelay: 20,
          unitPerMbStored: 0n,
          unitPerMbStreamed: 0n,
          unitPerPutRequest: 0n,
          unitPerGetRequest: 0n,
        },
      ),
    ),
  );
  console.timeEnd('Create cluster');

  console.time('Create and bond nodes');
  await Promise.all(
    storageNodeAccounts.map((account, index) =>
      blockchain.batchAllSend(
        [
          blockchain.ddcNodes.createStorageNode(account.address, {
            host: hostIp,
            httpPort: 8091 + index,
            grpcPort: 9091 + index,
            p2pPort: 9071 + index,
          }),
          blockchain.ddcStaking.bondStorageNode(account.address, account.address, bondAmount),
          blockchain.ddcStaking.store(clusterId),
        ],
        { account },
      ),
    ),
  );
  console.timeEnd('Create and bond nodes');

  console.time('Add nodes to cluster');
  await blockchain.batchAllSend(
    storageNodeAccounts.map((storageNodeAccount) =>
      blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNodeAccount.address),
    ),
  );
  console.timeEnd('Add nodes to cluster');

  console.time('Create buckets');
  const bucketsSendResult = await blockchain.batchAllSend(
    bucketIds.map(() => blockchain.ddcCustomers.createBucket(clusterId)),
  );
  const createdBucketIds = blockchain.ddcCustomers.extractCreatedBucketIds(bucketsSendResult.events);
  console.timeEnd('Create buckets');

  console.timeEnd('Done');
  console.groupEnd();

  await apiPromise.disconnect();

  return {
    hostIp,
    clusterId,
    bucketIds: createdBucketIds,
    account: clusterManagerAccount.address,
  };
};
