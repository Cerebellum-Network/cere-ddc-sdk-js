import Event from '../../../packages/client/src/event';
import Wallet from '../../../packages/client/src/wallet';
import { ClientContext } from '../../../packages/client/src/context';

describe('Event', () => {
  it('constructs id and timestamp and exposes body with payload, account_id and app_id', async () => {
    const now = new Date('2020-01-01T00:00:00.000Z');
    const signer = new Wallet('hybrid label reunion only dawn maze asset draft cousin height flock nation');
    const context = new ClientContext({ agentService: 'pubKey123', workspace: 'ws1', domain: 'example.com' });
    const evt = new Event({ event_type: 'test', payload: { a: 1 } } as any, signer.wallet, context, {
      id: 'fixed-id',
      timestamp: now,
    });
    const body = await evt.body();

    expect(body.id).toBe('fixed-id');
    expect(evt.timestamp).toBe(now.toISOString());
    expect(body.account_id).toBe(signer.wallet.publicKey);
    expect(body.app_id).toBe('pubKey123');
    expect(typeof body.signature).toBe('string');
    expect(body.signature.length).toBeGreaterThan(0);
  });

  it('autogenerates id and timestamp when not provided', async () => {
    const signer = new Wallet('hybrid label reunion only dawn maze asset draft cousin height flock nation');
    const context = new ClientContext({ agentService: 'pubKey123', workspace: 'ws1' });
    const evt = new Event({} as any, signer.wallet, context);
    expect(typeof evt.id).toBe('string');
    const body = await evt.body();
    expect(body.id).toBe(evt.id);
    expect(body.account_id).toBe(signer.wallet.publicKey);
    expect(body.app_id).toBe('pubKey123');
  });
});
