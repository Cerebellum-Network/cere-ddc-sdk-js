import * as path from 'path';
import * as fs from 'fs';
import { DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait } from 'testcontainers';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import {
  createBlockhainApi,
  getAccount,
  transferCere,
  readBlockchainStateFromDisk,
  BlockchainState,
  deployAuthContract,
  CERE,
  writeBlockchainStateToDisk,
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

  const isCached = fs.existsSync(path.resolve(dataDir, './ddc.json'));
  const composeFile = process.env.CI ? 'docker-compose.blockchain.ci.yml' : 'docker-compose.blockchain.yml';

  environment = await new DockerComposeEnvironment(__dirname, composeFile, uuid)
    .withEnv('BC_CAHCHE_DIR', path.resolve(dataDir, './blockchain'))
    .withWaitStrategy('cere-chain', Wait.forLogMessage(/Running JSON-RPC WS server/gi))
    .up();

  const blockchainState: BlockchainState =
    !process.env.CI && isCached ? readBlockchainStateFromDisk() : await setupBlockchain();

  if (!isCached) {
    writeBlockchainStateToDisk(blockchainState);
  }

  console.dir(blockchainState, { depth: null });

  console.groupEnd();

  return {
    ...blockchainState,
    apiUrl: 'ws://localhost:9944',
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

  const apiPromise = await createBlockhainApi();
  const rootAccount = getAccount('//Alice');
  const adminAccount = getAccount();
  const clusterId: ClusterId = '0x0000000000000000000000000000000000000000';
  const bucketIds = [1n, 2n, 3n];
  const cdnNodeAccounts = [getAccount('//Bob'), getAccount('//Dave')];
  const storageNodeAccounts = [
    getAccount('//Eve'),
    getAccount('//Ferdie'),
    getAccount('//Charlie'),
    getAccount('//Alice'),
  ];
  const bondAmount = 100n * CERE;

  console.time('Top-up user');
  await transferCere(apiPromise, adminAccount.address, 500);
  console.timeEnd('Top-up user');

  console.time('Deploy cluster node auth contract');
  const clusterNodeAuthorizationContractAddress = await deployAuthContract(apiPromise, rootAccount);
  console.timeEnd('Deploy cluster node auth contract');

  const blockchain = await Blockchain.connect({ account: rootAccount, apiPromise });
  console.time('Create cluster and nodes');
  await blockchain.batchSend([
    blockchain.sudo(
      blockchain.ddcClusters.createCluster(
        clusterId,
        rootAccount.address,
        rootAccount.address,
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
    ...storageNodeAccounts.flatMap((storageNodeAccount, index) => [
      blockchain.ddcNodes.createStorageNode(storageNodeAccount.address, {
        host: 'localhost',
        httpPort: 8091 + index,
        grpcPort: 9091 + index,
        p2pPort: 9071 + index,
      }),
      blockchain.ddcStaking.bondStorageNode(rootAccount.address, storageNodeAccount.address, bondAmount),
      blockchain.ddcStaking.store(clusterId),
      blockchain.ddcStaking.setController(storageNodeAccount.address),
      blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNodeAccount.address),
    ]),
    ...cdnNodeAccounts.flatMap((cdnNodeAccount, index) => [
      blockchain.ddcNodes.createCdnNode(cdnNodeAccount.address, {
        host: 'localhost',
        httpPort: 8081 + index,
        grpcPort: 9091 + index,
        p2pPort: 9071 + index,
      }),
      blockchain.ddcStaking.bondCdnNode(rootAccount.address, cdnNodeAccount.address, bondAmount),
      blockchain.ddcStaking.setController(cdnNodeAccount.address),
      blockchain.ddcClusters.addCdnNodeToCluster(clusterId, cdnNodeAccount.address),
    ]),
  ]);

  console.timeEnd('Create cluster and nodes');

  console.time('Create buckets');
  const bucketsSendResult = await blockchain.batchSend(
    bucketIds.map(() => blockchain.ddcCustomers.createBucket(clusterId)),
  );
  const createdBucketIds = blockchain.ddcCustomers.extractCreatedBucketIds(bucketsSendResult.events);

  console.timeEnd('Create buckets');

  console.timeEnd('Done');
  console.groupEnd();

  await apiPromise.disconnect();

  return {
    clusterId,
    bucketIds: createdBucketIds,
    account: rootAccount.address,
  };
};
