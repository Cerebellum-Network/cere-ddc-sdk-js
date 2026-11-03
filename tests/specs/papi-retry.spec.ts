import {
  BalancedNode,
  EndpointResolver,
  RouterOperation,
  NodeInterface,
  NodeError,
  Piece,
  PieceResponse,
  FileApi,
  isRetryableNodeError,
  streamConsumers,
  createContentStream,
} from '@cere-ddc-sdk/ddc';
import { BucketId } from '@cere-ddc-sdk/blockchain';

const bucketId: BucketId = 1n;
const ENDPOINT = 'https://storage.example';

const unimplemented = (): never => {
  throw new Error('not implemented in this mock');
};

/**
 * A minimal `NodeInterface` stand-in. Only `storePiece` and `readPiece` are exercised by these tests;
 * the rest throw if ever called since `BalancedNode` shouldn't need them here.
 */
function createMockStorageNode(
  storePiece: NodeInterface['storePiece'],
  readPiece: NodeInterface['readPiece'] = unimplemented,
): NodeInterface {
  return {
    nodeId: ENDPOINT,
    displayName: ENDPOINT,
    storePiece,
    readPiece,
    storeDagNode: unimplemented,
    getDagNode: unimplemented,
    storeCnsRecord: unimplemented,
    getCnsRecord: unimplemented,
    resolveName: unimplemented,
  };
}

/**
 * A mock `EndpointResolver`: `getNode` always resolves to the same mock node/endpoint,
 * regardless of how many times it's called — this is what lets the tests assert
 * "retries the same endpoint" (no fallover to a different node on failure).
 */
function createMockResolver(node: NodeInterface) {
  const calls: Array<{ operation: RouterOperation; bucketId: BucketId }> = [];

  const resolver = {
    getNode: async (operation: RouterOperation, bId: BucketId) => {
      calls.push({ operation, bucketId: bId });

      return node;
    },
  };

  return { resolver: resolver as unknown as EndpointResolver, calls };
}

describe('BalancedNode retry (unit, offline)', () => {
  it('retries the same endpoint on a retryable RpcError and eventually succeeds', async () => {
    let attempts = 0;
    const failuresBeforeSuccess = 2; // fails twice, succeeds on the 3rd attempt

    const node = createMockStorageNode(async () => {
      attempts += 1;

      if (attempts <= failuresBeforeSuccess) {
        throw new NodeError('temporarily unavailable', 'UNAVAILABLE');
      }

      return 'QmSuccessCid';
    });

    const { resolver, calls } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: failuresBeforeSuccess + 1 });

    const cid = await balancedNode.storePiece(bucketId, new Piece(new Uint8Array([1, 2, 3])));

    expect(cid).toBe('QmSuccessCid');
    expect(attempts).toBe(failuresBeforeSuccess + 1);
    // The resolver was asked for a node on every attempt, and it always returned the
    // same (mock) endpoint — i.e. no fallover to a different node.
    expect(calls).toHaveLength(failuresBeforeSuccess + 1);
    expect(new Set(calls.map((c) => c.operation)).size).toBe(1);
    expect(calls.every((c) => c.operation === RouterOperation.STORE_PIECE)).toBe(true);
  }, 20_000);

  it('bails immediately on a non-retryable RpcError without retrying', async () => {
    let attempts = 0;

    const node = createMockStorageNode(async () => {
      attempts += 1;
      throw new NodeError('bad request', 'INVALID_ARGUMENT');
    });

    const { resolver, calls } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: 5 });

    await expect(balancedNode.storePiece(bucketId, new Piece(new Uint8Array([1, 2, 3])))).rejects.toThrow(
      /bad request/,
    );

    expect(attempts).toBe(1);
    expect(calls).toHaveLength(1);
  }, 20_000);
});

/**
 * Retry options with near-zero delays, so the tests exercise the retry decisions without waiting on backoff.
 */
const fastRetries = (attempts?: number) => ({ attempts, minTimeout: 1, maxTimeout: 1 });

const QUORUM_ERROR = 'failed to put raw piece: got less than 12 results (8), total: 13';

const readAll = async (piece: Piece) => new Uint8Array(await streamConsumers.arrayBuffer(piece.body));

/**
 * Builds a single-use, stream-backed piece of the given bytes, the way a caller streaming a file would.
 */
const createStreamPiece = (content: Uint8Array) =>
  new Piece(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(content);
        controller.close();
      },
    }),
    { size: content.byteLength },
  );

describe('isRetryableNodeError', () => {
  it.each([
    ['UNAVAILABLE', 'upstream connect error'],
    ['DEADLINE_EXCEEDED', 'context deadline exceeded'],
    ['RESOURCE_EXHAUSTED', 'too many requests'],
    ['UNKNOWN', 'failed to put raw piece: got less than 12 results (8), total: 13'],
    ['UNKNOWN', 'failed to put raw piece: got less than 12 results (0), total: 13'],
    ['UNKNOWN', 'failed to put raw piece: got less than 12 results (7), total: 13'],
    ['UNKNOWN', 'connection error: desc = "transport: Error while dialing: dial tcp 10.0.0.7:9091: i/o timeout"'],
    ['INTERNAL', 'rpc error: code = Unavailable desc = error reading from server: EOF'],
    ['UNKNOWN', 'Response closed without headers'],
    ['INTERNAL', 'Received RST_STREAM with code 2 triggered by internal client error'],
    ['CANCELLED', 'Request timed out'],
    ['CANCELLED', 'Cancelled on client'],
  ])('retries %s "%s"', (code, message) => {
    expect(isRetryableNodeError(new NodeError(message, code))).toBe(true);
  });

  it.each([
    ['PERMISSION_DENIED', 'access denied'],
    ['UNAUTHENTICATED', 'invalid token'],
    ['INVALID_ARGUMENT', 'bad request'],
    ['NOT_FOUND', 'piece not found'],
    ['ABORTED', 'conflict'],
    ['FAILED_PRECONDITION', 'bucket is removed'],
    ['UNKNOWN', 'piece hash mismatch'],
    ['INTERNAL', 'unexpected nil value'],
    ['CANCELLED', 'canceled by caller'],
    ['PERMISSION_DENIED', 'got less than 12 results (8), total: 13'],
  ])('does not retry %s "%s"', (code, message) => {
    expect(isRetryableNodeError(new NodeError(message, code))).toBe(false);
  });

  it('does not retry errors that are not RPC errors', () => {
    expect(isRetryableNodeError(new Error(QUORUM_ERROR))).toBe(false);
  });
});

describe('BalancedNode transient failure handling (unit, offline)', () => {
  it('re-sends the full piece after a quorum shortfall and returns the stored CID', async () => {
    const content = new Uint8Array([1, 2, 3, 4, 5]);
    const received: Uint8Array[] = [];

    const node = createMockStorageNode(async (_, piece) => {
      received.push(await readAll(piece as Piece));

      if (received.length === 1) {
        throw new NodeError(QUORUM_ERROR, 'UNKNOWN');
      }

      return 'QmStoredCid';
    });

    const { resolver } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: fastRetries(), logLevel: 'silent' });

    await expect(balancedNode.storePiece(bucketId, new Piece(content))).resolves.toBe('QmStoredCid');
    expect(received).toEqual([content, content]);
  });

  it('retries a read that fails while a node restarts and returns the piece', async () => {
    let attempts = 0;
    const response = new PieceResponse(new Uint8Array(36), createContentStream(new Uint8Array([1])));

    const node = createMockStorageNode(unimplemented, async () => {
      attempts += 1;

      if (attempts === 1) {
        throw new NodeError('Response closed without headers', 'UNKNOWN');
      }

      return response;
    });

    const { resolver, calls } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: fastRetries(), logLevel: 'silent' });

    await expect(balancedNode.readPiece(bucketId, 'cid')).resolves.toBe(response);
    expect(attempts).toBe(2);
    expect(calls.every((call) => call.operation === RouterOperation.READ_PIECE)).toBe(true);
  });

  it.each([
    ['PERMISSION_DENIED', 'access denied'],
    ['UNAUTHENTICATED', 'invalid token'],
    ['INVALID_ARGUMENT', 'bad request'],
    ['UNKNOWN', 'piece hash mismatch'],
  ])('fails a store immediately on %s without retrying', async (code, message) => {
    let attempts = 0;

    const node = createMockStorageNode(async () => {
      attempts += 1;
      throw new NodeError(message, code);
    });

    const { resolver } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: fastRetries(5), logLevel: 'silent' });

    await expect(balancedNode.storePiece(bucketId, new Piece(new Uint8Array([1])))).rejects.toMatchObject({ code });
    expect(attempts).toBe(1);
  });

  it('fails a read immediately on NOT_FOUND without retrying', async () => {
    let attempts = 0;

    const node = createMockStorageNode(unimplemented, async () => {
      attempts += 1;
      throw new NodeError('piece not found', 'NOT_FOUND');
    });

    const { resolver } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: fastRetries(5), logLevel: 'silent' });

    await expect(balancedNode.readPiece(bucketId, 'cid')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(attempts).toBe(1);
  });

  it('stops after the configured number of retries and returns the last error', async () => {
    let attempts = 0;

    const node = createMockStorageNode(async () => {
      attempts += 1;
      throw new NodeError('upstream connect error', 'UNAVAILABLE');
    });

    const { resolver } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: fastRetries(4), logLevel: 'silent' });

    await expect(balancedNode.storePiece(bucketId, new Piece(new Uint8Array([1])))).rejects.toMatchObject({
      code: 'UNAVAILABLE',
    });
    expect(attempts).toBe(5);
  });

  it('attempts an operation three times by default', async () => {
    let attempts = 0;

    const node = createMockStorageNode(async () => {
      attempts += 1;
      throw new NodeError(QUORUM_ERROR, 'UNKNOWN');
    });

    const { resolver } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: fastRetries(), logLevel: 'silent' });

    await expect(balancedNode.storePiece(bucketId, new Piece(new Uint8Array([1])))).rejects.toThrow(QUORUM_ERROR);
    expect(attempts).toBe(3);
  });

  it('does not retry when retries are set to zero', async () => {
    let attempts = 0;

    const node = createMockStorageNode(async () => {
      attempts += 1;
      throw new NodeError(QUORUM_ERROR, 'UNKNOWN');
    });

    const { resolver } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: 0, logLevel: 'silent' });

    await expect(balancedNode.storePiece(bucketId, new Piece(new Uint8Array([1])))).rejects.toThrow(QUORUM_ERROR);
    expect(attempts).toBe(1);
  });

  it('waits at least half a second before the first retry by default', async () => {
    const attemptTimes: number[] = [];

    const node = createMockStorageNode(async () => {
      attemptTimes.push(Date.now());

      if (attemptTimes.length === 1) {
        throw new NodeError('upstream connect error', 'UNAVAILABLE');
      }

      return 'QmStoredCid';
    });

    const { resolver } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, logLevel: 'silent' });

    await expect(balancedNode.storePiece(bucketId, new Piece(new Uint8Array([1])))).resolves.toBe('QmStoredCid');
    expect(attemptTimes[1] - attemptTimes[0]).toBeGreaterThanOrEqual(490);
  });

  it('retries a stream-backed piece when the failed attempt never read the content', async () => {
    const content = new Uint8Array([9, 8, 7]);
    const received: Uint8Array[] = [];
    let attempts = 0;

    const node = createMockStorageNode(async (_, piece) => {
      attempts += 1;

      if (attempts === 1) {
        throw new NodeError('upstream connect error', 'UNAVAILABLE');
      }

      received.push(await readAll(piece as Piece));

      return 'QmStoredCid';
    });

    const { resolver } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: fastRetries(), logLevel: 'silent' });

    await expect(balancedNode.storePiece(bucketId, createStreamPiece(content))).resolves.toBe('QmStoredCid');
    expect(attempts).toBe(2);
    expect(received).toEqual([content]);
  });

  it('does not retry a stream-backed piece once its content has been sent', async () => {
    let attempts = 0;

    const node = createMockStorageNode(async (_, piece) => {
      attempts += 1;
      await readAll(piece as Piece);

      throw new NodeError(QUORUM_ERROR, 'UNKNOWN');
    });

    const { resolver } = createMockResolver(node);
    const balancedNode = new BalancedNode({ resolver, retries: fastRetries(), logLevel: 'silent' });

    await expect(balancedNode.storePiece(bucketId, createStreamPiece(new Uint8Array([1, 2])))).rejects.toThrow(
      QUORUM_ERROR,
    );
    expect(attempts).toBe(1);
  });
});

describe('FileApi.getFile first chunk (unit, offline)', () => {
  type FakeResponse = { body: { oneofKind: 'data'; data: Uint8Array } };

  /**
   * A transport whose `getFile` call answers with headers and then plays the given response messages,
   * throwing `failure` after them when it is set.
   */
  const createFakeTransport = (messages: FakeResponse[], failure?: Error) => ({
    mergeOptions: (options?: object) => options ?? {},
    duplex: () => ({
      requests: { send: async () => {}, complete: async () => {} },
      headers: Promise.resolve({}),
      responses: (async function* () {
        yield* messages;

        if (failure) {
          throw failure;
        }
      })(),
    }),
  });

  const request = { bucketId, cid: new Uint8Array(36) };

  it('rejects when the node fails before sending any content', async () => {
    const transport = createFakeTransport([], new NodeError(QUORUM_ERROR, 'UNKNOWN'));
    const fileApi = new FileApi(transport as any, { logLevel: 'silent' });

    await expect(fileApi.getFile(request)).rejects.toThrow(QUORUM_ERROR);
  });

  it('streams every chunk when the node serves the piece', async () => {
    const chunks = [new Uint8Array([1, 2]), new Uint8Array([3])];
    const transport = createFakeTransport(chunks.map((data) => ({ body: { oneofKind: 'data' as const, data } })));
    const fileApi = new FileApi(transport as any, { logLevel: 'silent' });

    const content = await streamConsumers.arrayBuffer(await fileApi.getFile(request));

    expect(new Uint8Array(content)).toEqual(new Uint8Array([1, 2, 3]));
  });
});
