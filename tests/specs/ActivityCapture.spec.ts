import { arrayBuffer } from 'stream/consumers';
import { DdcClient, File, FileUri, DagNode, DagNodeUri } from '@cere-ddc-sdk/ddc-client';
import {
  ActivityRequest,
  AuthToken,
  AuthTokenOperation,
  Cid,
  CnsApi,
  DagApi,
  FileApi,
  GrpcTransport,
  StorageNodeConfig,
  UriSigner,
} from '@cere-ddc-sdk/ddc';

import { createDataStream, MB, ROOT_USER_SEED, DDC_BLOCK_SIZE, getStorageNodes, getClientConfig } from '../helpers';

const correlationVariants = [
  { name: 'with provided ID', correlationId: 'test-correlation-id' },
  { name: 'with default value' },
];

describe('Activity Capture', () => {
  let client: DdcClient;

  const bucketId = 1n;
  const [node] = getStorageNodes();
  const signer = new UriSigner(ROOT_USER_SEED);
  const token = new AuthToken({ bucketId, operations: [AuthTokenOperation.PUT, AuthTokenOperation.GET] });

  let grpcRequests: { method: string; service: string; meta: any }[] = [];
  let duplexSendSpy: jest.SpyInstance;

  const interceptors: StorageNodeConfig['interceptors'] = [
    {
      interceptUnary(next, method, input, options) {
        grpcRequests.push({ service: method.service.typeName, method: method.name, meta: options.meta });

        return next(method, input, options);
      },

      interceptClientStreaming: (next, method, options) => {
        grpcRequests.push({ service: method.service.typeName, method: method.name, meta: options.meta });

        return next(method, options);
      },

      interceptDuplex: (next, method, options) => {
        const call = next(method, options);

        grpcRequests.push({ service: method.service.typeName, method: method.name, meta: options.meta });
        duplexSendSpy = jest.spyOn(call.requests, 'send');

        return call;
      },
    },
  ];

  const transport = new GrpcTransport({ ...node, interceptors });

  const getRequests = () => grpcRequests;
  const getActivityRequests = () =>
    getRequests()
      .map(({ meta }) => meta.request && ActivityRequest.fromBinary(Buffer.from(meta.request, 'base64')))
      .filter(Boolean);

  beforeAll(async () => {
    await token.sign(signer);

    client = await DdcClient.create(ROOT_USER_SEED, {
      ...getClientConfig(),
      nodes: getStorageNodes(undefined, { interceptors }),
    });
  });

  afterAll(async () => {
    await client.disconnect();
  });

  beforeEach(() => {
    grpcRequests = [];
  });

  describe('FileApi', () => {
    const fileApi = new FileApi(transport, { signer });
    const fileSize = 1 * MB;
    const fileStream = createDataStream(fileSize);

    let fileCid: Uint8Array;

    test('Store file', async () => {
      fileCid = await fileApi.putRawPiece({ token, bucketId, isMultipart: false, size: fileSize }, fileStream);

      const [activityRequest] = getActivityRequests();

      expect(activityRequest).toEqual({
        bucketId,
        contentType: 0, // ContentType.PIECE
        requestType: 0, // RequestType.STORE
        offset: 0,
        size: fileSize,
        id: expect.any(Uint8Array),
        timestamp: expect.any(Number),
        signature: expect.any(Object),
        requestId: expect.any(String),
      });
    });

    test('Read full file', async () => {
      expect(fileCid).toBeDefined();

      const stream = await fileApi.getFile({ token, bucketId, cid: fileCid });
      const [activityRequest] = getActivityRequests();

      await arrayBuffer(stream); // Read full stream

      expect(activityRequest).toEqual({
        bucketId,
        contentType: 0, // ContentType.PIECE
        requestType: 1, // RequestType.GET
        offset: 0,
        size: 0,
        id: Buffer.from(fileCid),
        signature: expect.any(Object),
        timestamp: expect.any(Number),
        requestId: expect.any(String),
      });

      expect(duplexSendSpy).toHaveBeenCalledWith({
        body: {
          oneofKind: 'ack',
          ack: {
            requestId: activityRequest?.requestId,
            bytesStoredOrDelivered: expect.any(Number),
            signature: expect.any(Object),
            timestamp: expect.any(Number),
          },
        },
      });
    });

    test('Read file part', async () => {
      expect(fileCid).toBeDefined();

      const stream = await fileApi.getFile({
        token,
        bucketId,
        cid: fileCid,
        range: { start: DDC_BLOCK_SIZE, end: 3 * DDC_BLOCK_SIZE - 1 },
      });

      const [activityRequest] = getActivityRequests();

      await arrayBuffer(stream); // Read full stream

      expect(activityRequest).toEqual({
        bucketId,
        contentType: 0, // ContentType.PIECE
        requestType: 1, // RequestType.GET
        offset: DDC_BLOCK_SIZE,
        size: DDC_BLOCK_SIZE * 2,
        id: Buffer.from(fileCid),
        signature: expect.any(Object),
        timestamp: expect.any(Number),
        requestId: expect.any(String),
      });

      expect(duplexSendSpy).toHaveBeenCalledWith({
        body: {
          oneofKind: 'ack',
          ack: {
            requestId: activityRequest?.requestId,
            bytesStoredOrDelivered: expect.any(Number),
            signature: expect.any(Object),
            timestamp: expect.any(Number),
          },
        },
      });
    });
  });

  describe('DagApi', () => {
    const dagApi = new DagApi(transport, { signer });

    let nodeCid: Uint8Array;

    test('Store DAG Node', async () => {
      nodeCid = await dagApi.putNode({
        token,
        bucketId,
        node: { data: new Uint8Array([1, 2, 3]), links: [], tags: [] },
      });

      const [activityRequest] = getActivityRequests();

      expect(activityRequest).toEqual({
        bucketId,
        contentType: 0, // ContentType.PIECE
        requestType: 0, // RequestType.STORE
        offset: 0,
        size: expect.any(Number),
        id: expect.any(Uint8Array),
        timestamp: expect.any(Number),
        signature: expect.any(Object),
        requestId: expect.any(String),
      });

      expect(activityRequest?.size).toBeGreaterThan(0);
    });

    test('Read node', async () => {
      expect(nodeCid).toBeDefined();

      await dagApi.getNode({ cid: nodeCid, token, bucketId });
      const [activityRequest] = getActivityRequests();

      expect(activityRequest).toEqual({
        bucketId,
        contentType: 0, // ContentType.PIECE
        requestType: 1, // RequestType.GET
        offset: 0,
        size: 0,
        id: Buffer.from(nodeCid),
        signature: expect.any(Object),
        timestamp: expect.any(Number),
        requestId: expect.any(String),
      });
    });
  });

  describe('CNS Api', () => {
    const cnsApi = new CnsApi(transport, { signer });
    const cid = new Cid('baebb4ia66qb5z353wntpaw54kzgzpaomzifkmezlffrz7shnzwlr7d6kyi').toBytes();
    const record = { name: 'test-dac', cid };

    test('Store CNS Record', async () => {
      await cnsApi.putRecord({ token, bucketId, record });
      const [activityRequest] = getActivityRequests();

      expect(activityRequest).toEqual({
        bucketId,
        contentType: 0, // ContentType.PIECE
        requestType: 0, // RequestType.STORE
        offset: 0,
        size: expect.any(Number),
        id: expect.any(Uint8Array),
        timestamp: expect.any(Number),
        signature: expect.any(Object),
        requestId: expect.any(String),
      });

      expect(activityRequest?.size).toBeGreaterThan(0);
    });

    test('Read CNS Record', async () => {
      await cnsApi.getRecord({ token, bucketId, name: record.name });
      const [activityRequest] = getActivityRequests();

      expect(activityRequest).toEqual({
        bucketId,
        contentType: 0, // ContentType.PIECE
        requestType: 1, // RequestType.GET
        offset: 0,
        size: 0,
        id: new Uint8Array([]),
        signature: expect.any(Object),
        timestamp: expect.any(Number),
        requestId: expect.any(String),
      });
    });
  });

  describe.each(correlationVariants)('Requests correlation ($name)', ({ correlationId }) => {
    let dagNodeUri: DagNodeUri;

    const fileName = 'test/tiny-file';
    const fileData = new TextEncoder().encode('Tiny file');

    test('Upload file with CNS name', async () => {
      await client.store(bucketId, new File(fileData), { name: fileName, correlationId });

      expect(getRequests()).toEqual([
        {
          service: 'file.FileApi',
          method: 'putRawPiece',
          meta: expect.objectContaining({
            CorrelationID: correlationId || expect.any(String),
          }),
        },
        {
          service: 'cns.CnsApi',
          method: 'Put',
          meta: expect.objectContaining({
            CorrelationID: correlationId || expect.any(String),
          }),
        },
      ]);
    });

    test('Download file by CNS name', async () => {
      await client.read(new FileUri(bucketId, fileName), { correlationId });

      expect(getRequests()).toEqual([
        {
          service: 'cns.CnsApi',
          method: 'Get',
          meta: expect.objectContaining({
            CorrelationID: correlationId || expect.any(String),
          }),
        },
        {
          service: 'file.FileApi',
          method: 'getFile',
          meta: expect.objectContaining({
            CorrelationID: correlationId || expect.any(String),
          }),
        },
      ]);
    });

    test('Store DAG Node', async () => {
      dagNodeUri = await client.store(bucketId, new DagNode('DAG Node data', [], []), { correlationId });

      expect(getRequests()).toContainEqual({
        service: 'dag.DagApi',
        method: 'Put',
        meta: expect.objectContaining({
          CorrelationID: correlationId || expect.any(String),
        }),
      });
    });

    test('Read DAG Node', async () => {
      expect(dagNodeUri).toBeDefined();

      await client.read(dagNodeUri, { correlationId });

      expect(getRequests()).toContainEqual({
        service: 'dag.DagApi',
        method: 'Get',
        meta: expect.objectContaining({
          CorrelationID: correlationId || expect.any(String),
        }),
      });
    });
  });
});
