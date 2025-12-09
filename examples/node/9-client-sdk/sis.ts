import { ClientContext, ClientSdk } from '@cere-ddc-sdk/client';

const AGENT_SERVICE = process.env.AGENT_SERVICE || '0x8b59cc9d43aa49e498529b040a5ecb49a83751e91f07aba709dceb58da8bdf24';
const WORKSPACE = process.env.WORKSPACE || '2106';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const EVENT_URL = process.env.EVENT_URL || '//localhost:8084';
const MCP_URL = process.env.MCP_URL || 'http://localhost:8080';
const SIS_URL = process.env.SIS_URL || 'http://127.0.0.1:8085';
const QUIC_ADDRESS = process.env.QUIC_ADDRESS || 'https://localhost:4433';
const ENV = (process.env.ENV ?? 'local') as 'local' | 'production';

async function main() {
  const context = new ClientContext({
    agentService: AGENT_SERVICE,
    workspace: WORKSPACE,
  });

  const client = new ClientSdk(
    {
      url: BASE_URL,
      eventRuntimeUrl: EVENT_URL,
      quicAddress: QUIC_ADDRESS,
      mcpUrl: MCP_URL,
      sisUrl: SIS_URL,
      context,
    },
    ENV,
  );

  console.log('sdk initialized...');

  const stream = await client.stream.create();
  console.log('stream created...', `${JSON.stringify(stream, null, 2)}`);

  const fetchedStream = await client.stream.get(stream.id);
  console.log('stream fetched...', `${JSON.stringify(fetchedStream, null, 2)}`);
}

main().catch((err) => {
  console.error('Playground (sis.ts) failed:', err);
  process.exitCode = 1;
});
