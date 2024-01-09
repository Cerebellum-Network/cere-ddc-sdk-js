import { arrayBuffer } from 'stream/consumers';
import { ActivityRequest, AuthToken, AuthTokenOperation, FileApi, GrpcTransport, UriSigner } from '@cere-ddc-sdk/ddc';

import { createDataStream, MB, ROOT_USER_SEED, DDC_BLOCK_SIZE, getStorageNodes } from '../helpers';

describe('Activity Capture', () => {
  const bucketId = 1n;
  const [node] = getStorageNodes();
  const signer = new UriSigner(ROOT_USER_SEED);
  const token = new AuthToken({ bucketId, operations: [AuthTokenOperation.PUT, AuthTokenOperation.GET] });

  let activityRequestHeader: string | undefined;
  let duplexSendSpy: jest.SpyInstance;

  const transport = new GrpcTransport({
    ...node,
    interceptors: [
      {
        interceptDuplex: (next, method, options) => {
          const call = next(method, options);

          activityRequestHeader = options.meta?.request as string;
          duplexSendSpy = jest.spyOn(call.requests, 'send');

          return call;
        },

        interceptClientStreaming: (next, method, options) => {
          activityRequestHeader = options.meta?.request as string;

          return next(method, options);
        },
      },
    ],
  });

  const getActivityRequest = () => {
    return activityRequestHeader ? ActivityRequest.fromBinary(Buffer.from(activityRequestHeader, 'base64')) : undefined;
  };

  beforeAll(async () => {
    await token.sign(signer);
  });

  beforeEach(() => {
    activityRequestHeader = undefined;
  });

  describe('FileApi', () => {
    const fileApi = new FileApi(transport, { signer });
    const fileSize = 1 * MB;
    const fileStream = createDataStream(fileSize);

    let fileCid: Uint8Array;

    test('Store file', async () => {
      fileCid = await fileApi.putRawPiece({ token, bucketId, isMultipart: false, size: fileSize }, fileStream);

      expect(getActivityRequest()).toEqual({
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
      const activityRequest = getActivityRequest();

      await arrayBuffer(stream); // Read full stream

      expect(activityRequest).toEqual({
        bucketId,
        contentType: 0, // ContentType.PIECE
        requestType: 1, // RequestType.STORE
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

      const activityRequest = getActivityRequest();

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
});
