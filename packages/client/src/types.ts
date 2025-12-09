import { CereWalletSigner, JsonSigner, UriSigner } from '@cere-activity-sdk/signers';
import { EmbedWallet } from '@cere/embed-wallet';

export type ContextInput = {
  agentService: string;
  workspace: string;
  domain?: string;
};

export type ContextInterface = {
  agent_service: string;
  workspace: string;
  domain?: string;
};

export type SignedWallet = JsonSigner | UriSigner | CereWalletSigner;
export type WalletConfig = JsonSigner | EmbedWallet;

export type ClientConfig = {
  context: ContextInterface;
  url: string;
  eventRuntimeUrl?: string;
  mcpUrl?: string;
  quicAddress?: string;
  sisUrl?: string;
  wallet?: WalletConfig | string;
};

// SIS TypeScript types mirroring the provided Go example

export class ServiceUnavailableError extends Error {
  constructor(message = 'service unavailable: max streams reached') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

// =============================================================================
// Node and Client Configuration
// =============================================================================

export type NodeInfo = {
  // unique identifier (e.g., "0x0")
  pubKey: string;
  // HTTP endpoint for REST API operations (e.g., "http://localhost:8085")
  httpUrl: string;
  // QUIC/WebTransport endpoint for streaming (e.g., "https://localhost:44300")
  quicAddress: string;
};

export type SisClientConfig = {
  // Bootstrap nodes
  nodes: NodeInfo[];
  // HTTP timeout in ms (default: 30000)
  httpTimeout?: number;
  // Retry attempts for failover (default: 3)
  retryAttempts?: number;
  // Base delay for exponential backoff in ms (default: 100)
  retryBaseDelay?: number;
};

export type CreateStreamOptions = {
  metadata?: Record<string, unknown>;
  ttlSeconds?: number | null;
};

export type CreateStreamRequest = {
  contextPath: ContextInterface;
  metadata?: Record<string, unknown>;
  ttlSeconds?: number | null;
};

export type CreateStreamResponse = {
  id: string;
};

export type DataStream = {
  id: string;
  owner_node: string; // pub key
  owner_node_addr?: string; // pub key
  sequence_number: number;
  parent_stream_id: string | undefined;
  status: string;
};

export type HandshakeType = 'publish' | 'subscribe';

export type HandshakeRequest = {
  type: HandshakeType;
  streamId: string;
  offset?: number | null;
};

export type Packet = {
  streamId: string;
  sequenceNum: number;
  headers?: Record<string, string>;
  payload: Uint8Array;
};
