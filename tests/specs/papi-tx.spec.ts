import * as fs from 'fs';
import { Binary } from 'polkadot-api';
import { connect, UriSigner } from '@cere-ddc-sdk/blockchain';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

function fundedSeed(): string | undefined {
  let seed = process.env.CERE_FUNDED_SEED;
  if (!seed) {
    try {
      seed = fs.readFileSync(process.env.HOME + '/.cef/models-seed', 'utf8').trim();
    } catch {
      /* no funded seed available */
    }
  }
  return seed;
}

describeChain('papi tx (live, devnet)', () => {
  it('send() returns { events, txHash } and shapes System.ExtrinsicSuccess', async () => {
    const seed = fundedSeed();
    if (!seed) return;
    const client = connect({ network: 'devnet' });
    try {
      const signer = new UriSigner(seed);
      const tx = client.api.tx.System.remark({ remark: Binary.fromText('papi-2b-tx') });
      const res = await client.tx.send(tx as any, { signer });
      expect(res.txHash).toMatch(/^0x/);
      expect(res.events.some((e) => e.section === 'System' && e.method === 'ExtrinsicSuccess')).toBe(true);
    } finally {
      client.disconnect();
    }
  }, 120_000);

  it('batchSend() submits two benign remarks in one extrinsic', async () => {
    const seed = fundedSeed();
    if (!seed) return;
    const client = connect({ network: 'devnet' });
    try {
      const signer = new UriSigner(seed);
      const t1 = client.api.tx.System.remark({ remark: Binary.fromText('b1') });
      const t2 = client.api.tx.System.remark({ remark: Binary.fromText('b2') });
      const res = await client.tx.batchSend([t1 as any, t2 as any], { signer });
      expect(res.txHash).toMatch(/^0x/);
      expect(res.events.some((e) => e.section === 'Utility' && e.method === 'BatchCompleted')).toBe(true);
    } finally {
      client.disconnect();
    }
  }, 120_000);

  it('sudo() builds an encodable Sudo.sudo wrapper (no submit)', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const inner = client.api.tx.System.remark({ remark: Binary.fromText('x') });
      const wrapped = client.tx.sudo(inner as any);
      const encoded = await wrapped.getEncodedData();
      expect(Binary.toHex(encoded)).toMatch(/^0x/);
      await client.assertCompatible('Sudo', 'sudo');
    } finally {
      client.disconnect();
    }
  }, 60_000);
});
