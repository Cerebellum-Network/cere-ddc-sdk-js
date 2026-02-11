/**
 * SIS TypeScript SDK - Type Definitions
 *
 * This module contains all type definitions for the SIS client library.
 */

// =============================================================================
// Protocol Constants
// =============================================================================

/** Protocol version for handshake */
export const HANDSHAKE_VERSION = 1;

/** Stream type for publish operations */
export const STREAM_TYPE_PUBLISH = 0;

/** Stream type for subscribe operations */
export const STREAM_TYPE_SUBSCRIBE = 1;

/** Maximum packet size (10MB) */
export const MAX_PACKET_SIZE = 10 * 1024 * 1024;

/** Maximum headers size (64KB) */
export const MAX_HEADERS_SIZE = 64 * 1024;

/** Maximum stream ID length (256 bytes) */
export const MAX_STREAM_ID_LENGTH = 256;

/** Maximum handshake size (4KB) */
export const MAX_HANDSHAKE_SIZE = 4 * 1024;

// =============================================================================
// Stream Types
// =============================================================================

/** Stream status values */
export type StreamStatus = 'paused' | 'active' | 'closed';

/** Context path links data streams to Event Runtime */
export interface ContextPath {
  /** Agent service public key */
  agent_service: string;
  /** Workspace identifier */
  workspace: string;
  /** Parent Stream ID (from Event Runtime) */
  stream: string;
}

/** Data stream metadata */
export interface DataStream {
  /** Unique stream identifier */
  id: string;
  /** Context path linking to Event Runtime */
  context_path: ContextPath;
  /** Publisher's address */
  publisher_address: string;
  /** Owner node's public key */
  owner_node: string;
  /** Owner node's QUIC address for direct connection */
  owner_node_addr?: string;
  /** Owner node's WebTransport URL for browser clients */
  owner_node_webtransport_addr?: string;
  /** Current sequence number */
  sequence_number: number;
  /** Creation timestamp (Unix nanoseconds) */
  created_at: number;
  /** Expiration timestamp (Unix nanoseconds) */
  expires_at?: number;
  /** Custom metadata */
  metadata: Record<string, unknown>;
  /** Stream status */
  status: StreamStatus;
}

/** Packet received from or sent to a stream */
export interface Packet {
  /** Stream ID this packet belongs to */
  streamId: string;
  /** Sequence number */
  sequenceNum: number;
  /** Timestamp (Unix nanoseconds) */
  timestamp?: number;
  /** Packet headers */
  headers: Record<string, string>;
  /** Packet payload */
  payload: Uint8Array;
}

/** Acknowledgement from server after publishing */
export interface Ack {
  /** Acknowledged sequence number */
  sequenceNum: number;
  /** Server timestamp (Unix nanoseconds) */
  timestamp: number;
}

// =============================================================================
// Handshake Types
// =============================================================================

/** Signer interface for handshake authentication.
 * Compatible with @cere-activity-sdk/signers (JsonSigner, UriSigner, CereWalletSigner).
 */
export interface Signer {
  /** Signs a message and returns the hex-encoded signature */
  sign(message: string): Promise<string>;
  /** Hex-encoded public key */
  publicKey: string;
}

/** Handshake request for QUIC stream setup */
export interface HandshakeRequest {
  /** Protocol version (currently 1) */
  version: number;
  /** Stream type: 0 = publish, 1 = subscribe */
  type: number;
  /** Target stream ID */
  stream_id: string;
  /** Starting offset for subscribe (optional) */
  offset?: number;
  /** Hex-encoded public key for publish handshake authentication */
  pub_key?: string;
  /** Hex-encoded signature over Blake2b-256(stream_id + type + version) */
  signature?: string;
  /** Authorization token for subscribe operations */
  auth_token?: string;
  /** Extensible options */
  options?: Record<string, string>;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

/** Request to create a new stream */
export interface CreateStreamRequest {
  /** Context path */
  context_path: ContextPath;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
  /** TTL in seconds (default: 24h = 86400) */
  ttl_seconds?: number;
}

/** Response from creating a stream */
export interface CreateStreamResponse {
  /** Created stream ID */
  id: string;
}

/** Options for stream creation */
export interface CreateStreamOptions {
  /** Custom metadata */
  metadata?: Record<string, unknown>;
  /** TTL in seconds */
  ttlSeconds?: number;
}

// =============================================================================
// Raft Types (minimal set for tests)
// =============================================================================

/** Raft high-level status */
export type RaftStatus = 'creating' | 'active' | 'failed' | 'stopped';

/** Individual instance status */
export type InstanceStatus = 'pending' | 'running' | 'stopped' | 'failed';

/** Definition of a Raft (processor) */
export interface RaftDefinition {
  id?: string;
  workspace_id: string;
  parent_stream_id: string;
  match_expression?: string;
  tsCode?: string;
  status?: RaftStatus;
}

/** Runtime instance information */
export interface RaftInstance {
  id: string;
  raft_id: string;
  node_pub_key: string;
  status: InstanceStatus;
}

/** Aggregated stats for a Raft */
export interface RaftStats {
  raft_id: string;
  instances: number;
}

/** Request payload for creating a Raft (SDK-side typing) */
export interface CreateRaftRequest {
  workspaceId: string;
  parentStreamId: string;
  matchExpression?: string;
  tsCode: string;
}

/** Response from creating a Raft */
export interface CreateRaftResponse {
  id: string;
}

// =============================================================================
// Client Configuration
// =============================================================================

/** Node information for multi-node setup */
export interface NodeInfo {
  /** Node's public key identifier */
  pubKey: string;
  /** HTTP endpoint for REST API (e.g., "http://localhost:8085") */
  httpUrl: string;
  /** QUIC/WebTransport endpoint (e.g., "localhost:44300") */
  quicAddr: string;
}

export interface Constructor {
  httpUrl: string;
  /** QUIC/WebTransport endpoint (e.g., "localhost:44300") */
  webTransportUrl: string;
}

/** Client configuration */
export interface ClientConfig {
  /** List of bootstrap nodes */
  /** HTTP request timeout in milliseconds (default: 30000) */
  httpTimeout?: number;
  /** Number of retry attempts for failover (default: 3) */
  retryAttempts?: number;
  /** Base delay for exponential backoff in ms (default: 100) */
  retryBaseDelay?: number;
  /** Certificate hash for WebTransport (optional, for self-signed certs) */
  certificateHash?: string;

  httpUrl: string;
  webTransportUrl: string;
}

// =============================================================================
// Subscription Types
// =============================================================================

/** Subscription options */
export interface SubscriptionOptions {
  /** Starting offset (undefined = live mode) */
  offset?: number;
  /** Auto-reconnect on failure (default: true) */
  autoReconnect?: boolean;
  /** Maximum reconnect attempts (0 = unlimited) */
  maxReconnectAttempts?: number;
  /** Base delay for reconnect backoff in ms (default: 100) */
  reconnectBaseDelay?: number;
  /** Maximum delay between reconnects in ms (default: 30000) */
  reconnectMaxDelay?: number;
  /** Error callback - return false to stop reconnecting */
  onError?: (error: Error) => boolean;
  /** Reconnect callback */
  onReconnect?: (attempt: number, lastOffset: number) => void;
}

// =============================================================================
// Error Types
// =============================================================================

/** Custom error for SIS operations */
export class SISError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'SISError';
  }
}

/** Error when service is unavailable (max streams reached) */
export class ServiceUnavailableError extends SISError {
  constructor(message = 'Service unavailable: max streams reached') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
    this.name = 'ServiceUnavailableError';
  }
}

/** Error when stream is not found */
export class StreamNotFoundError extends SISError {
  constructor(streamId: string) {
    super(`Stream not found: ${streamId}`, 'STREAM_NOT_FOUND', 404);
    this.name = 'StreamNotFoundError';
  }
}

// =============================================================================
// Transport Configuration
// =============================================================================

export interface TransportConfig {
  /** WebTransport URL (e.g., "https://localhost:44300") */
  url: string;
  /** Certificate hash for self-signed certificates (base64 encoded SHA-256) */
  certificateHash?: string;
  /** Custom WebTransport class (for Node.js polyfill) */
  webTransportClass?: WebTransportConstructor;
  /** Promise that resolves when the WebTransport library is ready (for @fails-components/webtransport) */
  webTransportReady?: Promise<void>;
}

// Type for WebTransport constructor (compatible with both browser and polyfills)
// Using 'any' for options because browser WebTransport and Node.js polyfills
// have incompatible types for serverCertificateHashes (ArrayBuffer vs Buffer)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WebTransportConstructor {
  new (url: string, options?: any): WebTransportInstance;
}

export interface WebTransportInstance {
  ready: Promise<void>;
  closed: Promise<{ closeCode?: number; reason?: string }>;

  close(closeInfo?: { closeCode?: number; reason?: string }): void;

  createBidirectionalStream(): Promise<WebTransportBidirectionalStreamLike>;
}

export interface WebTransportBidirectionalStreamLike {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
}
