/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '../../../../packages/client/src/sis';

describe('SIS HttpClient', () => {
  function createClient(baseUrl = 'https://sis.example') {
    const calls: any[] = [];
    const fetchMock = jest.fn(async (input: any, init?: any) => {
      const url = String(input);
      const method = (init?.method || 'GET').toUpperCase();
      let body: any = undefined;
      try {
        body = init?.body ? JSON.parse(init.body) : undefined;
      } catch {
        body = init?.body;
      }
      calls.push({ url, method, body });

      // Default successful response with empty JSON
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      } as any;
    });

    const client = new HttpClient({ baseUrl, fetch: fetchMock as any });
    return { client, calls };
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('createStream posts to /api/v1/streams with context and options', async () => {
    const { client, calls } = createClient('https://node-1.example');
    const context = { agent_service: 'agent-1', workspace: 'ws-1', stream: 's-1' } as any;
    await client.createStream(context, { ttlSeconds: 3600, metadata: { a: 1 } });

    expect(calls.length).toBe(1);
    expect(calls[0].url).toBe('https://node-1.example/api/v1/streams');
    expect(calls[0].method).toBe('POST');
    expect(calls[0].body).toEqual({ context_path: context, ttl_seconds: 3600, metadata: { a: 1 } });
  });

  it('getStream requests /api/v1/streams/<id>', async () => {
    const { client, calls } = createClient('https://node-2.example');
    await client.getStream('stream-123');
    expect(calls[0]).toMatchObject({ url: 'https://node-2.example/api/v1/streams/stream-123', method: 'GET' });
  });

  it('listStreams builds query params correctly', async () => {
    const { client, calls } = createClient('https://sis.local');
    await client.listStreams({ status: 'active', limit: 10, offset: 20 });
    expect(calls[0].url).toBe('https://sis.local/api/v1/streams?status=active&limit=10&offset=20');
  });
});
