# @cere-ddc/client

JavaScript/TypeScript Client SDK for interacting with the Cere platform. It provides a simple API to:
- Initialize a client with your app Context and Wallet
- Send activity events to the cluster
- Execute MCP tool calls (agent-service raft queries)

## Installation
```
npm install @cere-ddc-sdk/client
```

Or with yarn:
```
yarn add @cere-ddc-sdk/client
```


## Quick start
Below is a minimal example adapted from the Playground app.

### What is Context
To obtain your Context values:
1) Sign in to the ROB console.
2) Select the Data Service you plan to use.
3) Go to Settings → Keys and copy the Public Key (never use the private key).
4) Locate your Workspace and Domain under the chosen Data Service and copy their UUIDs.

You will need:
- agentService: Data Service public key
- workspace: Workspace UUID
- domain: Domain UUID

### What is Wallet
You can use one of the following approaches.

- Embedded wallet (recommended for browser apps). More details: https://www.npmjs.com/package/@cere/embed-wallet
```ts
import { EmbedWallet } from '@cere/embed-wallet';

const wallet = new EmbedWallet();
if (wallet.status === 'not-ready') {
  await wallet.init();
}
```

- Encrypted JSON file (backend only). Export from wallet.cere.io:
  1) Log in to wallet.cere.io.
  2) Go to Settings → “Export Your Account as an Encrypted JSON File”.
  3) Set an encrypted passphrase and export the account.

Important:
- Never use the exported JSON in client-side code. It contains sensitive data.
- Store it securely and use only on the server.

```ts
import { JsonSigner } from '@cere-ddc-sdk/client';
const wallet = new JsonSigner(
  {
    encoded:
      'lsS1ip0qe0dkLPYOVdKbOMAiemG3jPkduOsCjazKZDYAgAAAAQAAAAgAAACAAyOAwY3RGig6JcDAifG5y8lZzfhQbL9jGVeYSDynumKs1sD7U8zxZSTRcjjSzQUL+nsf33OMzWm12p0sR85HSDIXpWYpZgn2cb53YO7SxlZdUaZAkVSCeQ7tGzd95foLbkvMo38N+ibKrhyWArmQ22SC94w9WRgmfzhWwVcxqlH7tnDKPgyggfrUqpqj7574qIMQHbIyxTKVLAIT',
    encoding: { content: ['pkcs8', 'ed25519'], type: ['scrypt', 'xsalsa20-poly1305'], version: '3' },
    address: '5F7uEq1QPzmXAmoRmgDeD5KMb3iHRsNb3gqux5nognoUkruC',
    meta: {},
  },
  {
    passphrase: '123',
  },
)
```

### URL
The base URL of the Cere Activity cluster to connect to. You can:
- Use a local test (sandbox) environment, or
- Choose a public cluster from: https://explorer.cere.network/#/chainstate

```ts
import { ClientSdk, ClientContext } from '@cere-activity-sdk/client';

// 1) Define your application context
const context = new ClientContext({
  agentService: '0xYOUR_DATA_SERVICE_PUBLIC_KEY',
  workspace: 'your-workspace-uuidid',
  domain: 'your-domain-uuidid',
});

// 2) Initialize the client
const client = new ClientSdk({
  url: 'http://localhost:8080', // Cere Activity cluster URL
  // Development-only example mnemonic. Replace with a secure wallet source in production.
  wallet: 'test test test test test test test test test test test junk',
  context,
});

// 3) send an event
const event = await client.event.create('user_signup', {
  user_id: 'usr_12345',
  email: 'test@example.com',
});
console.log('Created event:', event);

// 4) (Optional) Execute an MCP tool call on a raft
const result = await client.query.fetch('raft-42', 'getUserStats', { userId: 7 });
console.log('MCP result:', result);
```


## Concepts
### Context
The Context describes your application namespace and routing information used by the Cere Activity platform.

Fields:
- agentService: string — Data Service public key
- workspace: string — Workspace UUID
- domain: string — Domain UUID

### Wallet
The SDK signs requests using a wallet derived from a secure source.
- Development: a test mnemonic can be used.
- Production: use a secure wallet source (e.g., embedded wallet in the browser, or encrypted JSON on the server). Never expose secrets to the client.

## API
### ClientContext
```
new ClientContext(props: { agentService: string; workspace: string; domain?: string })
```

Creates an immutable context object used by the client.

### ClientSdk
```
new ClientSdk({
  url: string;                  // Cere Activity cluster base URL (with or without trailing slash)
  wallet: string | EmbedWallet | JsonSigner; // Mnemonic (dev), EmbedWallet (browser), or JsonSigner (server)
  context: ClientContext;
})
```

Note: The client safely handles base URLs with or without a trailing slash when building request URLs.


#### client.event.create(eventType: string, payload: object): Promise<any>
Sends an event to the cluster.
- Endpoint: POST /api/v1/events
- Body fields:
  - id: string — generated UUID unless provided in advanced usage
  - timestamp: ISO string
  - event_type: string — the type you pass
  - context_path: object — derived from ClientContext (contains agent_service, workspace, domain?)
  - payload: object — your payload
  - account_id: string — signer public key
  - app_id: string — equals context.agent_service
  - signature: string — signature over a message derived from id, event_type, timestamp

Example:
```
await client.event.create('user_signup', { user_id: 'usr_12345' });
```


#### client.query.fetch(raftId: string, alias: string, payload?: object): Promise<any>
Executes an MCP tool call against a specific raft of your agent-service.
- Endpoint: POST /api/v1/mcp/agent-services/{agent_service}/rafts/{raftId}
- Body: JSON-RPC 2.0 envelope with method "tools/call" where params.name is the alias and params.arguments is the payload (defaults to {}).

Example:
```
await client.query.fetch('raft-42', 'getUserStats', { userId: 7 });
```


## Examples
- See the Playground app at ../../playground for a working example in a React environment (Playground.tsx).
- See repository tests under ../../tests for usage patterns.

## Troubleshooting
- Verify the cluster URL is reachable from your environment.
- Confirm your context values (agentService, workspace, domain) match your configuration.
- Ensure secrets (mnemonics, encrypted JSON, passphrases) are not exposed in the browser or logs.
