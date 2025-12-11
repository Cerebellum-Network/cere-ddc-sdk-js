/* eslint-disable @typescript-eslint/no-explicit-any */
import ClientSdk from '../../../packages/client/src/client';
import { ClientContext } from '../../../packages/client/src/context';

// Mock SIS unified client used by ClientSdk
const closeMock = jest.fn(async () => {});

// Generator helpers
async function* okThenDone() {
  yield { headers: { h: '1', 'content-type': 'text/plain' }, payload: new TextEncoder().encode('hello') } as any;
}

async function* okThenThrow() {
  yield { headers: { h: '1', 'content-type': 'text/plain' }, payload: new TextEncoder().encode('one') } as any;
  throw new Error('boom');
}

// Allow swapping subscribe implementation via a global so it affects the class used by ClientSdk
(global as any).__sisSubscribeImpl = okThenDone;

jest.mock('../../../packages/client/src/sis', () => {
  class MockSisClient {
    subscribeImpl: any;
    constructor(_cfg: any) {}
    async *subscribe(_streamId: string) {
      // Properly delegate to async generator
      const impl = (global as any).__sisSubscribeImpl || okThenDone;
      for await (const pkt of impl()) {
        yield pkt;
      }
    }
    close = closeMock;
  }
  return { Client: MockSisClient };
});

describe('ClientSdk.stream subscribe/unsubscribe', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  function makeClient() {
    const context = new ClientContext({ agentService: 'pubKey123', workspace: 'ws1', stream: 's-1' });
    const client = new ClientSdk({
      url: 'https://cluster.example',
      context,
      wallet: 'hybrid label reunion only dawn maze asset draft cousin height flock nation',
      sisUrl: 'http://sis.example',
      webTransportUrl: 'https://sis.example/sis',
    } as any);
    return client;
  }

  it('invokes callback for each packet with decoded payload and headers', async () => {
    const client = makeClient();

    const results: any[] = [];
    client.stream.subscribe('stream-1', (data, err) => {
      results.push({ data, err });
    });

    // Allow microtasks to run
    await new Promise((r) => setTimeout(r, 0));

    expect(results.length).toBe(1);
    expect(results[0].err).toBeNull();
    expect(results[0].data?.headers).toEqual({ h: '1', 'content-type': 'text/plain' });
    expect(results[0].data?.data).toBe('hello');
  });

  it('passes error to callback when subscribe iterator throws', async () => {
    // Swap the generator to throw before client is created
    (global as any).__sisSubscribeImpl = okThenThrow;

    const client = makeClient();
    const results: any[] = [];
    client.stream.subscribe('stream-1', (data, err) => {
      results.push({ data, err });
    });

    // Wait until error callback arrives or timeout (poll up to ~250ms)
    const start = Date.now();
    while (Date.now() - start < 250 && !results.some((r) => r.err instanceof Error)) {
      // Let microtasks progress
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Expect first data and then error callback
    const hasData = results.some((r) => r.data && !r.err);
    const hasError = results.some((r) => r.err instanceof Error && !r.data);
    expect(hasData).toBe(true);
    expect(hasError).toBe(true);
  });

  it('unsubscribe delegates to underlying sis.close()', async () => {
    const client = makeClient();
    await client.stream.unsubscribe();
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
