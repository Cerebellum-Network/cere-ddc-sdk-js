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
import { Blockchain } from '@cere-ddc-sdk/blockchain';

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
  const clusterManagerAccount = getAccount('//Alice');
  const adminAccount = getAccount();
  const clusterId = '0x0000000000000000000000000000000000000000';
  const bucketIds = [1n, 2n, 3n];
  const cdnNodeAccounts = [getAccount('//Bob'), getAccount('//Dave')];
  const storageNodeAccounts = [
    getAccount('//Eve'),
    getAccount('//Ferdie'),
    getAccount('//Charlie'),
    getAccount('//Alice'),
  ];
  const bondAmount = 100n * CERE;

  console.time('Top-up cluster manager account');
  await transferCere(apiPromise, adminAccount.address, 500);
  console.timeEnd('Top-up cluster manager account');

  console.time('Top-up node providers');
  for (let cdnNodeAccount of cdnNodeAccounts) {
    await transferCere(apiPromise, cdnNodeAccount.address, 500);
  }
  for (let storageNodeAccount of storageNodeAccounts) {
    await transferCere(apiPromise, storageNodeAccount.address, 500);
  }
  console.timeEnd('Top-up node providers');

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
  for (let cdnNodeAccount of cdnNodeAccounts) {
    const index = cdnNodeAccounts.indexOf(cdnNodeAccount);
    console.debug('Creating node', cdnNodeAccount.address);
    await blockchain.batchAllSend(
      [
        blockchain.ddcNodes.createCdnNode(cdnNodeAccount.address, {
          host: 'localhost',
          httpPort: 8081 + index,
          grpcPort: 9001 + index,
          p2pPort: 9081 + index,
        }),
        blockchain.ddcStaking.bondCdnNode(cdnNodeAccount.address, cdnNodeAccount.address, bondAmount),
        blockchain.ddcStaking.serve(clusterId),
      ],
      cdnNodeAccount,
    );
  }
  for (let storageNodeAccount of storageNodeAccounts) {
    const index = storageNodeAccounts.indexOf(storageNodeAccount);
    console.debug('Creating node', storageNodeAccount.address);
    await blockchain.batchAllSend(
      [
        blockchain.ddcNodes.createStorageNode(storageNodeAccount.address, {
          host: 'localhost',
          httpPort: 8091 + index,
          grpcPort: 9091 + index,
          p2pPort: 9071 + index,
        }),
        blockchain.ddcStaking.bondStorageNode(storageNodeAccount.address, storageNodeAccount.address, bondAmount),
        blockchain.ddcStaking.store(clusterId),
      ],
      storageNodeAccount,
    );
  }
  console.timeEnd('Create and bond nodes');

  console.time('Add nodes to cluster');
  await blockchain.batchAllSend([
    ...cdnNodeAccounts.map((cdnNodeAccount) =>
      blockchain.ddcClusters.addCdnNodeToCluster(clusterId, cdnNodeAccount.address),
    ),
    ...storageNodeAccounts.map((storageNodeAccount) =>
      blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNodeAccount.address),
    ),
  ]);
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
    clusterId,
    bucketIds: createdBucketIds,
    account: clusterManagerAccount.address,
  };
};
