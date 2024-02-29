import { Blockchain, StorageNodeMode } from '@cere-ddc-sdk/blockchain';
import { cryptoWaitReady, randomAsHex } from '@polkadot/util-crypto';
import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';

import { createAccount, createBlockhainApi, getAccount, sendMultipleTransfers } from '../helpers';

describe('Blockchain', () => {
  let apiPromise: ApiPromise;
  let blockchain: Blockchain;

  let rootAccount: KeyringPair;
  let storageNode1Account: KeyringPair;
  let nodeProviderAccount: KeyringPair;
  let storageNode1Key: string;
  let storageNode2Key: string;
  let storageNode3Key: string;
  let nonExistentKey1: string;
  const clusterId = randomAsHex(20);
  const bondSize = 10_000_000_000n;

  beforeAll(async () => {
    await cryptoWaitReady();

    rootAccount = getAccount('//Alice');
    storageNode1Account = createAccount().account;
    nodeProviderAccount = createAccount().account;
    storageNode1Key = storageNode1Account.address;
    storageNode2Key = createAccount().address;
    storageNode3Key = createAccount().address;
    nonExistentKey1 = createAccount().address;

    apiPromise = await createBlockhainApi();

    await sendMultipleTransfers(apiPromise, [
      { to: storageNode1Account.address, tokens: 10 },
      { to: nodeProviderAccount.address, tokens: 10 },
    ]);
  });

  afterAll(async () => {
    await apiPromise.disconnect();
  });

  test('Should create a Blockchain instance asynchronously', async () => {
    blockchain = await Blockchain.connect({ apiPromise });
    expect(blockchain).toBeInstanceOf(Blockchain);
  });

  test('Should return null when finding a non-existent Storage Node', async () => {
    const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(nonExistentKey1);
    expect(storageNode).toBeUndefined();
  });

  test('Should create a Storage Node and find it by public key', async () => {
    const storageNodeProps = {
      ssl: false,
      domain: '',
      host: 'ddc-storage-node-0',
      httpPort: 4010,
      grpcPort: 5020,
      p2pPort: 6030,
      mode: StorageNodeMode.Storage,
    };

    await blockchain.send(blockchain.ddcNodes.createStorageNode(storageNode1Key, storageNodeProps), {
      account: rootAccount,
    });

    const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode1Key);

    expect(storageNode).toBeDefined();
    expect(storageNode?.pubKey).toBe(storageNode1Key);
    expect(storageNode?.props).toEqual(storageNodeProps);
  });

  test('Should set Storage node props', async () => {
    const storageNodeProps = {
      ssl: false,
      domain: 'test-domain.com',
      host: 'ddc-storage-node-0',
      httpPort: 3010,
      grpcPort: 3020,
      p2pPort: 3030,
      mode: StorageNodeMode.Storage,
    };

    await blockchain.send(blockchain.ddcNodes.setStorageNodeProps(storageNode1Key, storageNodeProps), {
      account: rootAccount,
    });

    const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode1Key);

    expect(storageNode).toBeDefined();
    expect(storageNode?.props).toEqual(storageNodeProps);
  });

  test('Should create a cluster and find it by public key', async () => {
    const clusterGovernmentParams = {
      treasuryShare: 0,
      validatorsShare: 0,
      clusterReserveShare: 0,
      cdnBondSize: bondSize,
      cdnChillDelay: 0,
      cdnUnbondingDelay: 0,
      storageBondSize: bondSize,
      storageChillDelay: 0,
      storageUnbondingDelay: 0,
      unitPerMbStored: 0n,
      unitPerMbStreamed: 0n,
      unitPerPutRequest: 0n,
      unitPerGetRequest: 0n,
    };

    const clusterProps = {
      nodeProviderAuthContract: null,
    };

    await blockchain.send(
      blockchain.sudo(
        blockchain.ddcClusters.createCluster(
          clusterId,
          rootAccount.address,
          rootAccount.address,
          clusterProps,
          clusterGovernmentParams,
        ),
      ),
      { account: rootAccount },
    );

    const cluster = await blockchain.ddcClusters.findClusterById(clusterId);

    expect(cluster).toBeDefined();
    expect(cluster?.clusterId).toBe(clusterId);
    expect(cluster?.props).toEqual(clusterProps);
    expect(cluster?.managerId).toBe(rootAccount.address);
    expect(cluster?.reserveId).toBe(rootAccount.address);
  });

  test('Should list non empty clusters', async () => {
    const clusters = await blockchain.ddcClusters.listClusters();
    expect(clusters).toBeDefined();
    expect(clusters.length).toBeGreaterThan(0);
  });

  test('Should set cluster props', async () => {
    const clusterProps = {
      nodeProviderAuthContract: null,
    };

    await blockchain.send(blockchain.ddcClusters.setClusterParams(clusterId, clusterProps), { account: rootAccount });

    const cluster = await blockchain.ddcClusters.findClusterById(clusterId);

    expect(cluster).toBeDefined();
    expect(cluster?.props).toEqual(clusterProps);
  });

  test('Should fail to add a Storage Node to a cluster when not staked', async () => {
    await expect(() =>
      blockchain.send(blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNode1Key), {
        account: rootAccount,
      }),
    ).rejects.toThrow('ddcClusters.NodeHasNoActivatedStake:');
  });

  test('Should create 2 Storage nodes in batch', async () => {
    const storageNode2Props = {
      host: 'ddc-storage-node-2',
      httpPort: 3010,
      grpcPort: 3020,
      p2pPort: 3030,
      mode: StorageNodeMode.Storage,
    };

    const storageNode3Props = {
      ssl: true,
      domain: 'test3-domain.com',
      host: 'ddc-storage-node-3',
      httpPort: 3010,
      grpcPort: 3020,
      p2pPort: 3030,
      mode: StorageNodeMode.Storage,
    };

    await blockchain.batchSend(
      [
        blockchain.ddcNodes.createStorageNode(storageNode2Key, storageNode2Props),
        blockchain.ddcNodes.createStorageNode(storageNode3Key, storageNode3Props),
      ],
      { account: rootAccount },
    );

    const storageNode2 = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode2Key);
    const storageNode3 = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode3Key);

    expect(storageNode2?.props).toEqual({ ...storageNode2Props, domain: '', ssl: false });
    expect(storageNode3?.props).toEqual(storageNode3Props);
  });

  test('Should bond storage node', async () => {
    await blockchain.batchAllSend(
      [
        blockchain.ddcStaking.bondStorageNode(storageNode1Account.address, storageNode1Key, bondSize),
        blockchain.ddcStaking.store(clusterId),
      ],
      { account: storageNode1Account },
    );

    const stakeClusterId = await blockchain.ddcStaking.findStakedClusterIdByStorageNodeStashAccountId(
      storageNode1Account.address,
    );
    expect(stakeClusterId).toBe(clusterId);

    const nodeKey = await blockchain.ddcStaking.findNodePublicKeyByStashAccountId(storageNode1Account.address);
    expect(nodeKey).toEqual({ storagePubKey: storageNode1Key });

    const stashAccountId = await blockchain.ddcStaking.findStashAccountIdByStorageNodePublicKey(storageNode1Key);
    expect(stashAccountId).toBe(storageNode1Account.address);

    const stashAccounts = await blockchain.ddcStaking.listStakedStorageNodesStashAccountsAndClusterIds();
    expect(stashAccounts).toContainEqual({ stashAccountId: storageNode1Account.address, clusterId });
  });

  test('Should add storage node to cluster', async () => {
    await blockchain.send(blockchain.ddcClusters.addStorageNodeToCluster(clusterId, storageNode1Key), {
      account: rootAccount,
    });

    const hasNode = await blockchain.ddcClusters.clusterHasStorageNode(clusterId, storageNode1Key);
    expect(hasNode).toBe(true);

    const storageNode = await blockchain.ddcNodes.findStorageNodeByPublicKey(storageNode1Key);
    expect(storageNode?.clusterId).toBe(clusterId);

    const nodeKeys = await blockchain.ddcClusters.filterNodeKeysByClusterId(clusterId);
    expect(nodeKeys).toContainEqual(storageNode1Key);
  });

  test('Should create public bucket', async () => {
    const result = await blockchain.send(blockchain.ddcCustomers.createBucket(clusterId, { isPublic: true }), {
      account: rootAccount,
    });

    const [bucketId] = blockchain.ddcCustomers.extractCreatedBucketIds(result.events);
    const bucket = await blockchain.ddcCustomers.getBucket(bucketId);

    expect(bucket?.isPublic).toBe(true);
  });

  test('Should change bucket params', async () => {
    const createBucketResult = await blockchain.send(
      blockchain.ddcCustomers.createBucket(clusterId, { isPublic: true }),
      {
        account: rootAccount,
      },
    );

    const [bucketId] = blockchain.ddcCustomers.extractCreatedBucketIds(createBucketResult.events);
    const bucket = await blockchain.ddcCustomers.getBucket(bucketId);

    expect(bucket?.isPublic).toBe(true);

    await blockchain.send(blockchain.ddcCustomers.setBucketParams(bucketId, { isPublic: true }), {
      account: rootAccount,
    });

    const bucketAfterUpdate = await blockchain.ddcCustomers.getBucket(bucketId);
    expect(bucketAfterUpdate?.isPublic).toBe(true);
  });

  test('Should create private bucket', async () => {
    const result = await blockchain.send(blockchain.ddcCustomers.createBucket(clusterId, { isPublic: false }), {
      account: rootAccount,
    });

    const [bucketId] = blockchain.ddcCustomers.extractCreatedBucketIds(result.events);
    const bucket = await blockchain.ddcCustomers.getBucket(bucketId);

    expect(bucket?.isPublic).toBe(false);
  });

  test('Should list buckets', async () => {
    const buckets = await blockchain.ddcCustomers.listBuckets();
    expect(buckets.length).toBeGreaterThan(0);
  });

  test('Returns current block number', async () => {
    const currentBlockNumber = await blockchain.getCurrentBlockNumber();
    expect(currentBlockNumber).toBeGreaterThan(0);
  });
});
