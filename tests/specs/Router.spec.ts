import { Router, RouterOperation, UriSigner, StorageNodeMode } from '@cere-ddc-sdk/ddc';
import { ROOT_USER_SEED, BLOCKCHAIN_RPC_URL, getStorageNodes } from '../helpers';
import { Blockchain } from '@cere-ddc-sdk/blockchain';

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

describe('Router', () => {
  const signer = new UriSigner(ROOT_USER_SEED);

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
      nodes: getStorageNodes().filter(({ mode }) => mode === StorageNodeMode.Storage || mode === StorageNodeMode.Full),
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
      nodes: getStorageNodes().filter(({ mode }) => mode === StorageNodeMode.Storage || mode === StorageNodeMode.Cache),
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
