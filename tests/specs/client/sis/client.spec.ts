/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the low-level transport so we can test Client logic without real WebTransport
jest.mock('../../../../packages/client/src/sis/transport', () => {
  class MockTransport {
    url: string;
    certificateHash?: string;
    constructor(cfg: any) {
      this.url = cfg.url;
      this.certificateHash = cfg.certificateHash;
    }
    connect = jest.fn(async () => {});
    isConnected() {
      return true;
    }
    close = jest.fn(() => {});
  }

  class MockTransportPublisher {
    transport: any;
    streamId: string;
    inited = false;
    sent: any[] = [];
    constructor(transport: any, streamId: string) {
      this.transport = transport;
      this.streamId = streamId;
    }
    init = jest.fn(async () => {
      this.inited = true;
    });
    send = jest.fn(async (_payload: Uint8Array, _headers?: Record<string, string>) => {
      this.sent.push({ payload: _payload, headers: _headers });
      return { seq: this.sent.length };
    });
    setSequence = jest.fn((_: number) => {});
    close = jest.fn(async () => {});
    abort = jest.fn(async () => {});
  }

  class MockSubscriber {
    transport: any;
    streamId: string;
    offset?: number;
    constructor(transport: any, streamId: string, offset?: number) {
      this.transport = transport;
      this.streamId = streamId;
      this.offset = offset;
    }
    init = jest.fn(async () => {});
    async *packets() {
      yield { headers: { seq: 1 }, payload: new TextEncoder().encode('p1') } as any;
      yield { headers: { seq: 2 }, payload: new TextEncoder().encode('p2') } as any;
    }
    close = jest.fn(async () => {});
  }

  return {
    Transport: MockTransport,
    Publisher: MockTransportPublisher,
    Subscriber: MockSubscriber,
  };
});

import { Client, SISError, type ContextPath } from '../../../../packages/client/src/sis';

function mockFetchSequence(
  sequence: Array<{ matcher: (url: string, init?: any) => boolean; payload: any; ok?: boolean; status?: number }>,
) {
  (globalThis as any).fetch = jest.fn(async (input: any, init?: any) => {
    const url = String(input);
    const idx = sequence.findIndex((s) => s.matcher(url, init));
    if (idx === -1) {
      throw new Error(`Unexpected fetch: ${url}`);
    }
    const { payload, ok = true, status = 200 } = sequence[idx];
    return { ok, status, json: async () => payload, text: async () => JSON.stringify(payload) } as any;
  });
}

describe('SIS Client (unified)', () => {
  const httpUrl = 'https://node-1.example';
  const webTransportUrl = 'https://node-1.example';
  const context: ContextPath = {
    agent_service: 'agent-1',
    workspace: 'ws-1',
    stream: 's-1',
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  function nodeInfoResponse(pub_key = 'pub-node-1') {
    return {
      pub_key,
      certificate: { hash: 'hash-abc', expires_at: '2099-01-01', renews_at: '2098-01-01' },
    };
  }

  it('init fetches certificate and node pub_key and registers node', async () => {
    mockFetchSequence([
      { matcher: (u) => u === `${httpUrl}/api/v1/node`, payload: nodeInfoResponse('node-A') },
      { matcher: (u) => u === `${httpUrl}/api/v1/node`, payload: nodeInfoResponse('node-A') },
    ]);

    const client = new Client({ httpUrl, webTransportUrl });
    await expect(client.init()).resolves.not.toThrow();
  });

  it('createStream posts then GETs stream, caches owner, and returns stream', async () => {
    const streamId = 'stream-1';
    const owner = 'node-A';
    mockFetchSequence([
      // fetchCertificateHash
      { matcher: (u) => u === `${httpUrl}/api/v1/node`, payload: nodeInfoResponse(owner) },
      // init() also fetches node pub_key
      { matcher: (u) => u === `${httpUrl}/api/v1/node`, payload: nodeInfoResponse(owner) },
      // HttpClient.createStream POST
      { matcher: (u, init) => u === `${httpUrl}/api/v1/streams` && init?.method === 'POST', payload: { id: streamId } },
      // HttpClient.getStream GET
      {
        matcher: (u, init) => u === `${httpUrl}/api/v1/streams/${streamId}` && (init?.method || 'GET') === 'GET',
        payload: {
          id: streamId,
          owner_node: owner,
          owner_node_webtransport_addr: `${webTransportUrl}/sis`,
        },
      },
    ]);

    const client = new Client({ httpUrl, webTransportUrl });
    const stream = await client.createStream(context, {});
    expect(stream.id).toBe(streamId);

    // discoverOwner should use cached value and not perform extra fetch (we only mocked above calls)
    const ownerKey = await client.discoverOwner(streamId);
    expect(ownerKey).toBe(owner);
  });

  it('getStream retrieves metadata from random node', async () => {
    const streamId = 'stream-2';
    mockFetchSequence([
      { matcher: (u) => u === `${httpUrl}/api/v1/node`, payload: nodeInfoResponse('node-A') },
      { matcher: (u) => u === `${httpUrl}/api/v1/node`, payload: nodeInfoResponse('node-A') },
      {
        matcher: (u, init) => u === `${httpUrl}/api/v1/streams/${streamId}` && (init?.method || 'GET') === 'GET',
        payload: { id: streamId },
      },
    ]);
    const client = new Client({ httpUrl, webTransportUrl });
    const stream = await client.getStream(streamId);
    expect(stream.id).toBe(streamId);
  });

  it('subscribe yields packets from mocked Subscriber and closes it', async () => {
    const streamId = 's-sub';
    mockFetchSequence([
      { matcher: (u) => u === `${httpUrl}/api/v1/node`, payload: nodeInfoResponse('node-A') },
      { matcher: (u) => u === `${httpUrl}/api/v1/node`, payload: nodeInfoResponse('node-A') },
      {
        matcher: (u, init) => u === `${httpUrl}/api/v1/streams/${streamId}` && (init?.method || 'GET') === 'GET',
        payload: { id: streamId, owner_node: 'node-A' },
      },
    ]);

    const client = new Client({ httpUrl, webTransportUrl });
    // Prime cache for owner_node by calling getStream once
    await client.getStream(streamId);

    const received: string[] = [];
    for await (const packet of client.subscribe(streamId)) {
      received.push(new TextDecoder().decode(packet.payload));
      if (received.length === 2) break; // our mock yields two packets
    }
    expect(received).toEqual(['p1', 'p2']);
  });

  it('newPublisher returns wrapper that proxies to transport publisher', async () => {
    const streamId = 's-pub';
    mockFetchSequence([
      { matcher: (u) => u === `${httpUrl}/api/v1/node`, payload: nodeInfoResponse('node-A') },
      { matcher: (u) => u === `${httpUrl}/api/v1/node`, payload: nodeInfoResponse('node-A') },
      {
        matcher: (u, init) => u === `${httpUrl}/api/v1/streams/${streamId}` && (init?.method || 'GET') === 'GET',
        payload: { id: streamId, owner_node: 'node-A' },
      },
    ]);

    const client = new Client({ httpUrl, webTransportUrl });
    // Prime cache
    await client.getStream(streamId);
    const publisher = await client.newPublisher(streamId);
    const ack = await publisher.send({ message: 'p1', index: 0 });
    expect(ack.sequenceNum).toBe(1);
    await publisher.setSequence(10);
    await publisher.close();
  });
});
