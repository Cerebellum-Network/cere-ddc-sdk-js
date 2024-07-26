import { DdcClient, DagNode, DagNodeUri } from '@cere-ddc-sdk/ddc-client';
import { StorageNodeConfig } from '@cere-ddc-sdk/ddc';

import { ROOT_USER_SEED, getStorageNodes, getClientConfig } from '../helpers';

describe('Cache Control', () => {
  let client: DdcClient;

  const bucketId = 1n;
  const cacheControlMetaKey = 'cache-control';

  let grpcRequests: { method: string; service: string; meta: any }[] = [];
  const getRequests = () => grpcRequests;
  const interceptors: StorageNodeConfig['interceptors'] = [
    {
      interceptUnary(next, method, input, options) {
        grpcRequests.push({ service: method.service.typeName, method: method.name, meta: options.meta });

        return next(method, input, options);
      },
    },
  ];

  beforeAll(async () => {
    client = await DdcClient.create(ROOT_USER_SEED, {
      ...getClientConfig(),
      nodes: getStorageNodes(undefined, { interceptors }),
    });
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('CNS Api', () => {
    const cnsName = 'test-cns-record';
    let testUri: DagNodeUri;

    beforeAll(async () => {
      testUri = await client.store(bucketId, new DagNode(), { name: cnsName });
    });

    beforeEach(() => {
      grpcRequests = [];
    });

    test('Resolve CNS Record', async () => {
      const cid = await client.resolveName(testUri.bucketId, cnsName, {
        cacheControl: 'no-cache',
      });

      expect(cid.toString()).toEqual(testUri.cid);
      expect(getRequests()).toEqual(
        expect.arrayContaining([
          {
            service: 'cns.CnsApi',
            method: 'Get',
            meta: expect.objectContaining({
              [cacheControlMetaKey]: 'no-cache',
            }),
          },
        ]),
      );
    });

    test('Update and read DagNode by the CNS name', async () => {
      const newUri = await client.store(bucketId, new DagNode(), { name: cnsName });
      const { cid } = await client.read(new DagNodeUri(bucketId, cnsName), {
        cacheControl: 'no-cache',
      });

      expect(cid).toEqual(newUri.cid);
      expect(getRequests()).toEqual(
        expect.arrayContaining([
          {
            service: 'cns.CnsApi',
            method: 'Get',
            meta: expect.objectContaining({
              [cacheControlMetaKey]: 'no-cache',
            }),
          },
        ]),
      );
    });
  });
});
