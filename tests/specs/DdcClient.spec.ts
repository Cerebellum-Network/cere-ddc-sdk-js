import { DagNode, DagNodeUri, DdcClient, File, FileUri, KB, Link, MB, Tag } from '@cere-ddc-sdk/ddc-client';

import { ROOT_USER_SEED, createDataStream, getBlockchainState } from '../helpers';

describe('DDC Client', () => {
  const bucketId = 1n;
  let client: DdcClient;

  beforeAll(async () => {
    const { rpcUrl } = getBlockchainState();

    client = await DdcClient.create(ROOT_USER_SEED, {
      blockchain: rpcUrl,
    });
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('Files', () => {
    let uri: FileUri;
    let tinyUri: FileUri;
    const fileSize = 2 * MB;
    const fileStream = createDataStream(fileSize);
    const tinyFileName = 'test/tiny-file';
    const tinyFileText = 'Tiny file';
    const tinyFileData = new TextEncoder().encode('Tiny file');

    test('Store medium file', async () => {
      const file = new File(fileStream, {
        size: fileSize,
      });

      uri = await client.store(bucketId, file);

      expect(uri).toEqual({
        bucketId,
        entity: 'file',
        cidOrName: expect.any(String),
        cid: expect.any(String),
      });
    });

    test('Read medium file', async () => {
      const file = await client.read(uri);
      const buffer = await file.arrayBuffer();

      expect(buffer.byteLength).toEqual(fileSize);
    });

    test('Read a range of medium file', async () => {
      const file = await client.read(uri, {
        range: {
          start: 0,
          end: 32 * KB - 1,
        },
      });

      const buffer = await file.arrayBuffer();

      expect(buffer.byteLength).toEqual(32 * KB);
    });

    test('Store tiny file', async () => {
      const file = new File(tinyFileData);

      tinyUri = await client.store(bucketId, file);

      expect(tinyUri).toEqual({
        bucketId,
        entity: 'file',
        cidOrName: expect.any(String),
        cid: expect.any(String),
      });
    });

    test('Read tiny file', async () => {
      const file = await client.read(tinyUri);
      const text = await file.text();

      expect(text).toEqual(tinyFileText);
    });

    test('Store named tiny file', async () => {
      const file = new File(tinyFileData);
      const uri = await client.store(bucketId, file, {
        name: tinyFileName,
      });

      expect(uri).toEqual({
        bucketId,
        entity: 'file',
        name: tinyFileName,
        cidOrName: expect.any(String),
        cid: expect.any(String),
      });
    });

    test('Read tiny file by name', async () => {
      const namedUri = new FileUri(bucketId, tinyFileName);
      const file = await client.read(namedUri);
      const text = await file.text();

      expect(namedUri.name).toEqual(tinyFileName);
      expect(text).toEqual(tinyFileText);
    });
  });

  describe('DAG Node', () => {
    let uri: DagNodeUri;
    const nodeName = 'ddc-client/test-dag-node';
    const nodeData = 'Hello Dag node test';
    const nestedNodeName = 'ddc-client/nested-dag-node';

    test('Store DAG node', async () => {
      const dagNode = new DagNode(nodeData, [], [new Tag('key', 'value')]);

      uri = await client.store(bucketId, dagNode);

      expect(uri).toEqual({
        bucketId,
        entity: 'dag-node',
        cidOrName: expect.any(String),
        cid: expect.any(String),
      });
    });

    test('Read DAG node', async () => {
      const dagNode = await client.read(uri);

      expect(dagNode.data.toString()).toEqual(nodeData);
      expect(dagNode.tags).toEqual([new Tag('key', 'value')]);
    });

    test('Store named DAG node', async () => {
      const dagNode = new DagNode(nodeData, [], [new Tag('key', 'value')]);
      const uri = await client.store(bucketId, dagNode, {
        name: nodeName,
      });

      expect(uri).toEqual({
        bucketId,
        entity: 'dag-node',
        cidOrName: expect.any(String),
        name: nodeName,
        cid: expect.any(String),
      });
    });

    test('Read DAG node by name', async () => {
      const namedUri = new DagNodeUri(bucketId, nodeName);
      const dagNode = await client.read(namedUri);

      expect(namedUri.name).toEqual(nodeName);
      expect(dagNode.data.toString()).toEqual(nodeData);
    });

    test('Store nested Dag node', async () => {
      const leaf = new DagNode('Leaf');
      const leafUri = await client.store(bucketId, leaf);
      const leafLink = new Link(leafUri.cid, leaf.size, 'leaf');

      const branch = new DagNode('Branch', [leafLink]);
      const branchUri = await client.store(bucketId, branch);
      const branchLink = new Link(branchUri.cid, branch.size, 'branch');

      const root = new DagNode('Root', [branchLink]);
      const rootUri = await client.store(bucketId, root, {
        name: nestedNodeName,
      });

      expect(rootUri.cid).toEqual(expect.any(String));
    });

    test('Read nested Dag node', async () => {
      const rootUri = new DagNodeUri(bucketId, nestedNodeName);
      const leaf = await client.read(rootUri, {
        path: 'branch/leaf',
      });

      expect(leaf.data.toString()).toEqual('Leaf');
    });
  });

  describe('Blockhain operations', () => {
    let createdBucketId: bigint;

    const clusterId = '0x0000000000000000000000000000000000000000';

    test('Create bucket', async () => {
      const createdBucketId = await client.createBucket(clusterId);

      expect(createdBucketId).toEqual(expect.any(BigInt));
    });

    test('Get bucket', async () => {
      const bucket = await client.getBucket(createdBucketId);

      expect(bucket?.bucketId).toEqual(createdBucketId);
    });

    test('Get bucket list', async () => {
      const buckets = await client.getBucketList();

      expect(buckets.length).toBeGreaterThan(0);
    });
  });
});
