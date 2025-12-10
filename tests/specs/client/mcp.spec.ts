import MCP from '../../../packages/client/src/mcp';

describe('MCP', () => {
  it('builds JSON-RPC 2.0 body with alias as name and payload as arguments', () => {
    const req = new MCP('getUserStats', { userId: 7 });
    const body = req.body as any;

    expect(body.jsonrpc).toBe('2.0');
    expect(body.method).toBe('tools/call');
    expect(body.params.name).toBe('getUserStats');
    expect(body.params.arguments).toEqual({ userId: 7 });

    // id is generated and reflected in body
    expect(typeof req.id).toBe('string');
    expect(req.id.length).toBeGreaterThan(0);
    expect(body.id).toBe(req.id);
  });

  it('defaults arguments to empty object when payload omitted', () => {
    const req = new MCP('ping');
    const body = req.body as any;
    expect(body.params.name).toBe('ping');
    expect(body.params.arguments).toEqual({});
  });

  it('accepts custom id via constructor options and reflects in body', () => {
    const req = new MCP('custom', { a: 1 }, { id: 'fixed-id' } as any);
    const body = req.body as any;
    expect(req.id).toBe('fixed-id');
    expect(body.id).toBe('fixed-id');
    expect(body.params.name).toBe('custom');
    expect(body.params.arguments).toEqual({ a: 1 });
  });
});
