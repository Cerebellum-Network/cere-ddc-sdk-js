import { RouterNode } from '@cere-ddc-sdk/ddc';
import { DdcClient, StorageNodeMode, File, NodeError } from '@cere-ddc-sdk/ddc-client';
import { getClientConfig, getStorageNodes, ROOT_USER_SEED } from '../helpers';

describe('Errors', () => {
  let smallFile: File;

  beforeEach(() => {
    smallFile = new File(new TextEncoder().encode('Small file'));
  });

  describe('Normal client', () => {
    let client: DdcClient;

    beforeAll(async () => {
      client = await DdcClient.create(ROOT_USER_SEED, getClientConfig());
    });

    afterAll(async () => {
      await client.disconnect();
    });

    it('should throw a bucket error', async () => {
      const error = await client.store(99n, smallFile).catch((error) => error);

      expect(error).toBeInstanceOf(Error);
      expect(error).toEqual(
        expect.objectContaining({
          message: expect.stringContaining('Failed to get bucket'),
        }),
      );
    });
  });

  describe('Static nodes client', () => {
    let client: DdcClient;

    beforeAll(async () => {
      client = await DdcClient.create(ROOT_USER_SEED, getClientConfig({ nodes: getStorageNodes() }));
    });

    afterAll(async () => {
      await client.disconnect();
    });

    it('should throw an RPC bucket error', async () => {
      const error = await client.store(99n, smallFile).catch((error) => error);

      expect(error).toBeInstanceOf(NodeError);
      expect(error).toEqual(
        expect.objectContaining({
          code: 'NOT_FOUND',
          correlationId: expect.any(String),
          nodeId: expect.any(String),
        }),
      );
    });
  });

  describe('Unreachable node client', () => {
    let client: DdcClient;
    const bucketId = 1n;
    const unreachableNode: RouterNode = {
      mode: StorageNodeMode.Storage,
      grpcUrl: `grpc://localhost:9099`,
      httpUrl: `http://localhost:8099`,
    };

    beforeAll(async () => {
      client = await DdcClient.create(ROOT_USER_SEED, getClientConfig({ nodes: [unreachableNode] }));
    });

    afterAll(async () => {
      await client.disconnect();
    });

    it('should throw unreachible error', async () => {
      const error = await client.store(bucketId, smallFile).catch((error) => error);

      expect(error).toBeInstanceOf(NodeError);
      expect(error).toEqual(
        expect.objectContaining({
          code: 'UNAVAILABLE',
          serviceName: 'file.FileApi',
          methodName: 'putRawPiece',
          nodeId: unreachableNode.grpcUrl,
          correlationId: expect.any(String),
        }),
      );
    });

    it('should throw error with explicit correlationId', async () => {
      const correlationId = 'test-correlation-id';
      const error = await client.store(bucketId, smallFile, { correlationId }).catch((error) => error);

      expect(error).toBeInstanceOf(NodeError);
      expect(error).toEqual(expect.objectContaining({ correlationId }));
    });
  });
});
