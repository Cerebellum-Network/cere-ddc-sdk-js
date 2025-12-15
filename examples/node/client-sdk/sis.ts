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

function logError(message: string): void {
  log(`❌ ${message}`, 'red');
}

async function main() {
  const context = new ClientContext({
    agentService: AGENT_SERVICE,
    workspace: WORKSPACE,
    // For demo purposes we use a fixed stream id; replace with your ER parent stream id in real apps
    stream: process.env.STREAM_ID || 'demo-stream',
  });

  const client = new ClientSdk({
    url: BASE_URL,
    eventRuntimeUrl: EVENT_URL,
    webTransportUrl: QUIC_ADDRESS,
    mcpUrl: MCP_URL,
    sisUrl: SIS_URL,
    context,
    // For demo purposes, provide a sample mnemonic wallet or set via env WALLET_MNEMONIC
    wallet: process.env.WALLET_MNEMONIC || 'hybrid label reunion only dawn maze asset draft cousin height flock nation',
  });

  logInfo('sdk initialized...');

  const stream = await client.stream.create();
  logInfo('stream created...');

  const fetchedStream = await client.stream.get(stream.id);
  logInfo(`stream fetched...:${fetchedStream.id}`);

  const publisher = await client.stream.publisher(stream.id);

  const subscriber = client.stream.subscribe(stream.id, ({ headers, data }, error) => {
    if (error) {
      logError(`error: ${error.toString()}`);
      subscriber.abort();
      return;
    }
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
  logInfo('Unsubscribing from stream...');
  await client.stream.unsubscribe(stream.id);
  logSuccess('Unsubscribed');

  // Unsubscribe from the stream
  logInfo('Unsubscribing from all the stream...');
  await client.stream.unsubscribeAll();
  logSuccess('Unsubscribed from All');
}

main().catch((err) => {
  console.error('Playground (sis.ts) failed:', err);
  process.exitCode = 1;
});
