/* eslint-disable @typescript-eslint/no-explicit-any */
import ClientSdk from '../../packages/client/src/client';
import { ClientContext } from '../../packages/client/src/context';
import type { ClientConfig } from '../../packages/client/src/types';

function setupClient(baseUrl = 'https://api.example.com/') {
  const context = new ClientContext({ agentService: 'pubKey123', workspace: 'ws1', domain: 'example.com' });
  const config: ClientConfig = {
    url: baseUrl,
    context,
    wallet: 'hybrid label reunion only dawn maze asset draft cousin height flock nation',
  };
  return new ClientSdk(config);
}

// Test helpers to reduce fetch mocking duplication
function mockFetchEchoParsedBody(calls: any[], key: 'body' | 'received' = 'body') {
  (globalThis as any).fetch = jest.fn(async (input: any, init?: any) => {
    calls.push({ input: String(input), init });
    return { ok: true, status: 200, json: async () => ({ ok: true, [key]: JSON.parse(init!.body) }) } as any;
  });
}

function mockFetchReturnJson(calls: any[], json: any, options?: { ok?: boolean; status?: number }) {
  const { ok = true, status = 200 } = options || {};
  (globalThis as any).fetch = jest.fn(async (input: any, init?: any) => {
    calls.push({ input: String(input), init });
    return { ok, status, json: async () => json } as any;
  });
}

function mockFetchCaptureUrlOnly(urls: string[], json: any = {}) {
  (globalThis as any).fetch = jest.fn(async (input: any) => {
    urls.push(String(input));
    return { json: async () => json } as any;
  });
}

describe('ClientSdk', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('event.create sends POST to /api/v1/events with correct headers and body', async () => {
    const calls: any[] = [];
    mockFetchEchoParsedBody(calls, 'received');

    const client = setupClient('https://cluster.example');
    const res = (await client.event.create('wallet.click', { x: 1, y: 2 })) as any;

    // URL
    expect(String(calls[0].input)).toBe('https://cluster.example/er/api/v1/events');

    // Headers
    expect(calls[0].init.headers).toEqual({ 'Content-Type': 'application/json' });

    // Body shape
    const body = res.received as any;
    expect(body.id).toBeTruthy();
    expect(body.timestamp).toBeTruthy();
    expect(body.event_type).toBe('wallet.click');
    expect(body.context_path?.agent_service).toBe('pubKey123');
    expect(body.payload).toEqual({ x: 1, y: 2 });
    expect(typeof body.signature).toBe('string');
    expect(body.app_id).toBe('pubKey123');
    expect(typeof body.account_id).toBe('string');
  });

  it('event.create builds URL correctly when base URL has no trailing slash', async () => {
    const urls: string[] = [];
    mockFetchCaptureUrlOnly(urls);
    const client = setupClient('https://cluster.example');
    await client.event.create('test', {});
    expect(urls[0]).toBe('https://cluster.example/er/api/v1/events');
  });

  it('query.fetch posts to /api/v1/mcp/agent-services/<agent_service>/rafts/<raftId> with JSON-RPC 2.0 body', async () => {
    const calls: any[] = [];
    mockFetchEchoParsedBody(calls);

    const client = setupClient('https://cluster.example');
    // Cast to any to allow passing payload, since the current type declares payload?: undefined
    const resp = (await (client.query.fetch as any)('raft-42', 'getUserStats', { userId: 7 })) as any;

    const url = calls[0].input;
    expect(url).toBe('https://cluster.example/orchestrator/api/v1/mcp/agent-services/pubKey123/rafts/raft-42');

    // Body is JSON-RPC envelope produced by MCP
    expect(resp.body.jsonrpc).toBe('2.0');
    expect(resp.body.method).toBe('tools/call');
    expect(resp.body.params.name).toBe('getUserStats');
    expect(resp.body.params.arguments).toEqual({ userId: 7 });
  });

  it('query.fetch builds URL correctly when base URL has no trailing slash and no payload passed', async () => {
    const calls: any[] = [];
    mockFetchEchoParsedBody(calls);

    const client = setupClient('https://cluster.example');
    const resp = (await client.query.fetch('raft-1', 'ping')) as any;

    expect(calls[0].input).toBe(
      'https://cluster.example/orchestrator/api/v1/mcp/agent-services/pubKey123/rafts/raft-1',
    );
    expect(resp.body.params.name).toBe('ping');
    expect(resp.body.params.arguments).toEqual({});
  });

  it('query.fetch unwraps JSON-RPC result.data on 200', async () => {
    const payload = {
      jsonrpc: '2.0',
      id: '2f294715-e077-42bd-9191-bdd00240aa19',
      result: {
        _meta: {
          trace: {
            attributes: { entity_id: 'raft-33d51a4b' },
            children: [],
            duration_ms: 14,
            end_time: '2025-10-31T10:00:35.101Z',
            kind: 'raft',
            name: 'Testing Raft',
            span_id: '8a3460c4-a7cf-4396-81d1-db268a5d95c8',
            start_time: '2025-10-31T10:00:35.087Z',
          },
        },
        data: {
          data: [],
          message: 'Raft Is working',
          success: true,
        },
      },
    };
    const calls: any[] = [];
    mockFetchReturnJson(calls, payload, { ok: true, status: 200 });
    const client = setupClient('https://cluster.example');
    const resp = (await client.query.fetch('raft-1', 'ping')) as any;
    expect(resp).toEqual({ data: [], message: 'Raft Is working', success: true });
  });

  it('query.fetch throws with JSON-RPC error message on non-200', async () => {
    const errorPayload = {
      jsonrpc: '2.0',
      id: '7e767325-d1f4-4309-8e4a-bf5d050e58eb',
      error: { code: -32603, message: 'Failed to call raft tool: not found' },
    };
    const calls: any[] = [];
    mockFetchReturnJson(calls, errorPayload, { ok: false, status: 500 });
    const client = setupClient('https://cluster.example');
    const promise = client.query.fetch('raft-1', 'ping');
    await expect(promise).rejects.toThrow('Failed to call raft tool: not found');
    await promise.catch((e: any) => {
      expect(e.status).toBe(500);
      expect(e.code).toBe(-32603);
    });
  });
});
