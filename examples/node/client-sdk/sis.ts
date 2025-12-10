import { ClientContext, ClientSdk } from '@cere-ddc-sdk/client';

const AGENT_SERVICE = process.env.AGENT_SERVICE || '0x8b59cc9d43aa49e498529b040a5ecb49a83751e91f07aba709dceb58da8bdf24';
const WORKSPACE = process.env.WORKSPACE || '2106';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const EVENT_URL = process.env.EVENT_URL || '//localhost:8084';
const MCP_URL = process.env.MCP_URL || 'http://localhost:8080';
const SIS_URL = process.env.SIS_URL || 'http://127.0.0.1:8085';
const QUIC_ADDRESS = process.env.QUIC_ADDRESS || 'https://localhost:4433/sis';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

function logInfo(message: string): void {
  log(`ℹ️  ${message}`, 'cyan');
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green');
}

async function main() {
  const context = new ClientContext({
    agentService: AGENT_SERVICE,
    workspace: WORKSPACE,
  });

  const client = new ClientSdk({
    url: BASE_URL,
    eventRuntimeUrl: EVENT_URL,
    webTransportUrl: QUIC_ADDRESS,
    mcpUrl: MCP_URL,
    sisUrl: SIS_URL,
    context,
  });

  logInfo('sdk initialized...');

  const stream = await client.stream.create();
  logInfo('stream created...');

  const fetchedStream = await client.stream.get(stream.id);
  logInfo(`stream fetched...:${fetchedStream.id}`);

  const publisher = await client.stream.publisher(stream.id);

  client.stream.subscribe(stream.id, ({ headers, data }) => {
    console.log(headers, data);
    logSuccess(`Received Packet... ${data}`);
  });

  logInfo(`publisher created...`);
  const messages = [
    'Hello from Node.js! 🚀',
    'This is message #2',
    'WebTransport is awesome! ⚡',
    'Real-time streaming with QUIC',
    'Final message - goodbye! 👋',
  ];

  for (let i = 0; i < messages.length; i++) {
    const ack = await publisher.send({ message: messages[i], index: i });
    logSuccess(`Sent message #${ack.sequenceNum}: "${messages[i]}"`);
    logInfo(`  Timestamp: ${ack.timestamp}`);

    // Small delay between messages for demo purposes
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  logInfo('Closing publisher...');
  await publisher.close();
  logSuccess('Publisher closed');
}

main().catch((err) => {
  console.error('Playground (sis.ts) failed:', err);
  process.exitCode = 1;
});
