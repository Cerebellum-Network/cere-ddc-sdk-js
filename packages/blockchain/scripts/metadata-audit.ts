/* Runnable metadata-compat audit. Usage: CERE_RPC_URL=wss://rpc.devnet.cere.network/ws ts-node metadata-audit.ts */
import { ApiPromise, WsProvider } from '@polkadot/api';

import { SURFACE, diffSurface, LiveSurface } from '../src/surface';

function readLive(api: ApiPromise): LiveSurface {
  const live: LiveSurface = { tx: {}, query: {} };

  for (const pallet of Object.keys(api.tx)) {
    live.tx[pallet] = {};
    for (const method of Object.keys(api.tx[pallet])) {
      live.tx[pallet][method] = (api.tx[pallet][method] as any).meta.args.length;
    }
  }

  for (const pallet of Object.keys(api.query)) {
    live.query[pallet] = {};
    for (const method of Object.keys(api.query[pallet])) {
      live.query[pallet][method] = 0; // existence-only
    }
  }

  return live;
}

async function main() {
  const url = process.env.CERE_RPC_URL ?? 'wss://rpc.devnet.cere.network/ws';
  const api = await ApiPromise.create({ provider: new WsProvider(url) });
  await api.isReady;

  const findings = diffSurface(SURFACE, readLive(api));

  console.log(`\nMetadata audit against ${url} — ${findings.length} mismatch(es):\n`);
  for (const f of findings) {
    console.log(`  [${f.problem}] ${f.entry.kind}.${f.entry.pallet}.${f.entry.method} — ${f.detail}`);
  }
  if (findings.length === 0) console.log('  ✓ SDK surface matches the live runtime.');

  await api.disconnect();
  process.exitCode = findings.length === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
