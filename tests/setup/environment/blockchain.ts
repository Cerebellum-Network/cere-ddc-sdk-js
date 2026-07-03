import * as path from 'path';
import * as fs from 'fs';
import { DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait } from 'testcontainers';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Blockchain, ClusterId, ClusterNodeKind } from '@cere-ddc-sdk/blockchain';

import {
  createBlockhainApi,
  getAccount,
  readBlockchainStateFromDisk,
  BlockchainState,
  CERE,
  writeBlockchainStateToDisk,
  sendMultipleTransfers,
  BLOCKCHAIN_RPC_URL,
  getHostIP,
  getStorageNodes,
  BLOCKCHAIN_NODE_MAX_STARTUP_TIME,
} from '../../helpers';

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

    fs.rmSync(bcCachePath, { recursive: true });
    fs.unlinkSync(cachedStatePath);
  }

  environment = await new DockerComposeEnvironment(__dirname, composeFile, uuid)
    .withEnvironment({
      BC_CAHCHE_DIR: bcCachePath,
    })
    .withWaitStrategy(
      'cere-chain',
      Wait.forLogMessage(/Running JSON-RPC server/gi).withStartupTimeout(BLOCKCHAIN_NODE_MAX_STARTUP_TIME),
    )
    .up();

  const blockchainState: BlockchainState = !process.env.CI && chachedState ? chachedState : await setupBlockchain();

  if (!chachedState) {
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
  const bondAmount = 100n * CERE;
  const storageNodeConfigs = getStorageNodes(hostIp);
  const storageNodeAccounts = storageNodeConfigs.map(({ mnemonic }) => getAccount(mnemonic, 'ed25519'));

  console.time('Top-up accounts');
  await sendMultipleTransfers(apiPromise, [
    { to: rootAccount.address, tokens: 1000 },

    /**
     * Top up node providers
     */
    ...storageNodeAccounts.map((storageNodeAccount) => ({ to: storageNodeAccount.address, tokens: 500 })),
  ]);
  console.timeEnd('Top-up accounts');
  const blockchain = await Blockchain.connect({ apiPromise });

  console.time('Create and bond cluster');
  await blockchain.batchAllSend(
    [
      blockchain.ddcClusters.createCluster(
        clusterId,
        clusterManagerAccount.address,
        {
          nodeProviderAuthContract: null,
        },
        {
          treasuryShare: 100000000,
          validatorsShare: 100000000,
          clusterReserveShare: 100000000,
          storageBondSize: bondAmount,
          storageChillDelay: 20,
          storageUnbondingDelay: 20,
          unitPerMbStored: 0n,
          unitPerMbStreamed: 0n,
          unitPerPutRequest: 0n,
          unitPerGetRequest: 0n,
        },
      ),
      blockchain.ddcStaking.bondCluster(clusterId),
    ],
    { account: clusterManagerAccount },
  );
  console.timeEnd('Create and bond cluster');

  console.time('Create and bond nodes');
  await Promise.all(
    storageNodeAccounts.map((account, index) =>
      blockchain.batchAllSend(
        [
          blockchain.ddcNodes.createStorageNode(account.address, {
            host: hostIp,
            mode: storageNodeConfigs[index].mode,
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
      blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNodeAccount.address, ClusterNodeKind.Genesis),
    ),
    { account: clusterManagerAccount },
  );
  console.timeEnd('Add nodes to cluster');

  console.time('Create buckets');
  const bucketsSendResult = await blockchain.batchAllSend(
    [
      blockchain.ddcCustomers.deposit(clusterId, 100n * CERE),
      blockchain.ddcCustomers.createBucket(clusterId, { isPublic: true }), // 1n - public bucket
      blockchain.ddcCustomers.createBucket(clusterId, { isPublic: false }), // 2n - private bucket
    ],
    { account: rootAccount },
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
