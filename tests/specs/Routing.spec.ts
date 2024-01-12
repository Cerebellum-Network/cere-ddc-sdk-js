import { Blockchain } from '@cere-ddc-sdk/blockchain';
import { DdcClient, File, DagNode } from '@cere-ddc-sdk/ddc-client';
import { Router, RouterOperation, UriSigner, StorageNodeMode, RouterNode } from '@cere-ddc-sdk/ddc';
import { ROOT_USER_SEED, BLOCKCHAIN_RPC_URL, getStorageNodes, getClientConfig, createDataStream, MB } from '../helpers';

const operations = [
  { op: RouterOperation.READ_PIECE, name: 'Read piece' },
  { op: RouterOperation.STORE_PIECE, name: 'Store piece' },
  { op: RouterOperation.READ_DAG_NODE, name: 'Read DAG Node' },
  { op: RouterOperation.STORE_DAG_NODE, name: 'Store DAG Node' },
];

const strategies = [
  {
    name: 'Static',
    config: {
      nodes: getStorageNodes(),
    },
  },
  {
    name: 'Blockchain',
    config: {
      blockchain: new Blockchain({ wsEndpoint: BLOCKCHAIN_RPC_URL }),
    },
  },
];

describe('Routing', () => {
  const signer = new UriSigner(ROOT_USER_SEED);

  describe('Router', () => {
    describe.each(strategies)('All modes ($name)', ({ config }) => {
      const router = new Router({ signer, ...config });

      beforeAll(async () => {
        await config.blockchain?.isReady();
      });

      afterAll(async () => {
        await config.blockchain?.disconnect();
      });

      test('Read piece', async () => {
        const node = await router.getNode(RouterOperation.READ_PIECE, 1n);

        expect([StorageNodeMode.Full, StorageNodeMode.Cache]).toContain(node.mode);
      });

      test('Store piece', async () => {
        const node = await router.getNode(RouterOperation.STORE_PIECE, 1n);

        expect([StorageNodeMode.Full, StorageNodeMode.Storage]).toContain(node.mode);
      });

      test('Read DAG Node', async () => {
        const node = await router.getNode(RouterOperation.READ_DAG_NODE, 1n);

        expect([StorageNodeMode.Full, StorageNodeMode.Cache]).toContain(node.mode);
      });

      test('Store DAG Node', async () => {
        const node = await router.getNode(RouterOperation.STORE_DAG_NODE, 1n);

        expect([StorageNodeMode.Full, StorageNodeMode.Storage]).toContain(node.mode);
      });
    });

    describe('Storage and Full modes', () => {
      const router = new Router({
        signer,
        nodes: getStorageNodes().filter(
          ({ mode }) => mode === StorageNodeMode.Storage || mode === StorageNodeMode.Full,
        ),
      });

      test('Read piece', async () => {
        const node = await router.getNode(RouterOperation.READ_PIECE, 1n);

        expect(node.mode).toEqual(StorageNodeMode.Full);
      });

      test('Store piece', async () => {
        const node = await router.getNode(RouterOperation.STORE_PIECE, 1n);

        expect([StorageNodeMode.Full, StorageNodeMode.Storage]).toContain(node.mode);
      });

      test('Read DAG Node', async () => {
        const node = await router.getNode(RouterOperation.READ_DAG_NODE, 1n);

        expect(node.mode).toEqual(StorageNodeMode.Full);
      });

      test('Store DAG Node', async () => {
        const node = await router.getNode(RouterOperation.STORE_DAG_NODE, 1n);

        expect([StorageNodeMode.Full, StorageNodeMode.Storage]).toContain(node.mode);
      });
    });

    describe('Storage and Cache modes', () => {
      const router = new Router({
        signer,
        nodes: getStorageNodes().filter(
          ({ mode }) => mode === StorageNodeMode.Storage || mode === StorageNodeMode.Cache,
        ),
      });

      test('Read piece', async () => {
        const node = await router.getNode(RouterOperation.READ_PIECE, 1n);

        expect(node.mode).toEqual(StorageNodeMode.Cache);
      });

      test('Store piece', async () => {
        const node = await router.getNode(RouterOperation.STORE_PIECE, 1n);

        expect(node.mode).toEqual(StorageNodeMode.Storage);
      });

      test('Read DAG Node', async () => {
        const node = await router.getNode(RouterOperation.READ_DAG_NODE, 1n);

        expect(node.mode).toEqual(StorageNodeMode.Cache);
      });

      test('Store DAG Node', async () => {
        const node = await router.getNode(RouterOperation.STORE_DAG_NODE, 1n);

        expect(node.mode).toEqual(StorageNodeMode.Storage);
      });
    });

    describe('Cache mode only', () => {
      const router = new Router({
        signer,
        nodes: getStorageNodes().filter(({ mode }) => mode === StorageNodeMode.Cache),
      });

      test('Read piece', async () => {
        const node = await router.getNode(RouterOperation.READ_PIECE, 1n);

        expect(node.mode).toEqual(StorageNodeMode.Cache);
      });

      test('Store piece', async () => {
        expect(router.getNode(RouterOperation.STORE_PIECE, 1n)).rejects.toThrow('No nodes available');
      });

      test('Read DAG Node', async () => {
        const node = await router.getNode(RouterOperation.READ_DAG_NODE, 1n);

        expect(node.mode).toEqual(StorageNodeMode.Cache);
      });

      test('Store DAG Node', async () => {
        expect(router.getNode(RouterOperation.STORE_DAG_NODE, 1n)).rejects.toThrow('No nodes available');
      });
    });

    describe('Full mode only', () => {
      const router = new Router({
        signer,
        nodes: getStorageNodes().filter(({ mode }) => mode === StorageNodeMode.Full),
      });

      test.each(operations)('$name', async ({ op }) => {
        const node = await router.getNode(op, 1n);

        expect(node.mode).toEqual(StorageNodeMode.Full);
      });
    });

    describe('Storage mode only', () => {
      const router = new Router({
        signer,
        nodes: getStorageNodes().filter(({ mode }) => mode === StorageNodeMode.Storage),
      });

      test.each(operations)('$name', async ({ op }) => {
        const node = await router.getNode(op, 1n);

        expect(node.mode).toEqual(StorageNodeMode.Storage);
      });
    });
  });

  describe('Fallbacks and retries', () => {
    let client: DdcClient;

    beforeAll(async () => {
      const [normalNode] = getStorageNodes();
      const unreachableNode: RouterNode = {
        mode: StorageNodeMode.Storage,
        grpcUrl: `grpc://localhost:9099`,
        httpUrl: `http://localhost:8099`,
        priority: 0, // Should be selected first
      };

      client = await DdcClient.create(ROOT_USER_SEED, {
        ...getClientConfig(),
        nodes: [
          normalNode, // Should fallback to this node from the unreachable one
          unreachableNode,
        ],
      });
    });

    afterAll(async () => {
      await client.disconnect();
    });

    test('Store/read a DAG Node', async () => {
      const dagNode = new DagNode('Test node', [], []);
      const uri = await client.store(1n, dagNode);
      const dagNodeResponse = await client.read(uri);

      expect(dagNodeResponse.cid).toBeDefined();
    });

    test('Store/read a file', async () => {
      const file = new File(createDataStream(MB), { size: MB });
      const uri = await client.store(1n, file, {
        name: 'test/fallback-retry',
      });

      const fileResponse = await client.read(uri);

      expect(fileResponse.cid).toBeDefined();
    });
  });
});
