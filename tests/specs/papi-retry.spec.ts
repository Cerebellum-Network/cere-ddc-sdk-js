import { BalancedNode, EndpointResolver, RouterOperation, NodeInterface, NodeError, Piece } from '@cere-ddc-sdk/ddc';
import { BucketId } from '@cere-ddc-sdk/blockchain';

const bucketId: BucketId = 1n;
const ENDPOINT = 'https://storage.example';

/**
 * A minimal `NodeInterface` stand-in. Only `storePiece` is exercised by these tests;
 * the rest throw if ever called since `BalancedNode` shouldn't need them here.
 */
function createMockStorageNode(storePiece: NodeInterface['storePiece']): NodeInterface {
  const unimplemented = () => {
    throw new Error('not implemented in this mock');
  };

  return {
    nodeId: ENDPOINT,
    displayName: ENDPOINT,
    storePiece,
    storeDagNode: unimplemented as any,
    readPiece: unimplemented as any,
    getDagNode: unimplemented as any,
    storeCnsRecord: unimplemented as any,
    getCnsRecord: unimplemented as any,
    resolveName: unimplemented as any,
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
