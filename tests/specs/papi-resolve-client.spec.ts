import { resolveClient } from '@cere-ddc-sdk/blockchain';

describe('resolveClient', () => {
  it('passes through an injected CereClient without owning it', () => {
    const fake = { api: {}, tx: {}, chain: {}, disconnect() {} } as any;
    const r = resolveClient(fake);
    expect(r.client).toBe(fake);
    expect(r.ownsClient).toBe(false);
  });

  it('connects (and owns) for a network name', () => {
    const r = resolveClient('devnet');
    expect(r.ownsClient).toBe(true);
    expect(typeof r.client.disconnect).toBe('function');
    r.client.disconnect();
  });

  it('connects (and owns) for a ws url', () => {
    const r = resolveClient('wss://rpc.devnet.cere.network/ws');
    expect(r.ownsClient).toBe(true);
    r.client.disconnect();
  });
});
