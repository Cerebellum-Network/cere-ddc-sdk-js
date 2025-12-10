/**
 * SIS TypeScript SDK
 *
 * A TypeScript/JavaScript client library for the Stream Ingestion Service (SIS).
 * Works in both Node.js and browser environments.
 *
 * @packageDocumentation
 */

// Main client
export { Client, Publisher } from './client';

// HTTP client for direct API access
export { HttpClient } from './http';
export type { HttpClientConfig } from './http';

// Transport layer for custom implementations
export { Transport, Publisher as TransportPublisher, Subscriber } from './transport';
export type { TransportConfig, PacketCallback } from './transport';

// Protocol helpers for custom SDK implementations
export {
  serializeHandshake,
  deserializeHandshake,
  serializePacket,
  deserializePacket,
  deserializeAck,
  serializeAck,
  ACK_SIZE,
  BufferedReader,
} from './protocol';
export type { DeserializedPacket } from './protocol';

// Types - Constants (runtime values)
export {
  HANDSHAKE_VERSION,
  STREAM_TYPE_PUBLISH,
  STREAM_TYPE_SUBSCRIBE,
  MAX_PACKET_SIZE,
  MAX_HEADERS_SIZE,
  MAX_STREAM_ID_LENGTH,
  MAX_HANDSHAKE_SIZE,
  SISError,
  ServiceUnavailableError,
  StreamNotFoundError,
} from './types';

// Types - Type definitions
export type {
  StreamStatus,
  ContextPath,
  DataStream,
  Packet,
  Ack,
  HandshakeRequest,
  CreateStreamRequest,
  CreateStreamResponse,
  CreateStreamOptions,
  NodeInfo,
  ClientConfig,
  SubscriptionOptions,
  RaftStatus,
  InstanceStatus,
  RaftDefinition,
  RaftInstance,
  RaftStats,
  CreateRaftRequest,
  CreateRaftResponse,
} from './types';
