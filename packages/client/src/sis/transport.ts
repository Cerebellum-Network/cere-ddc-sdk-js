/**
 * SIS TypeScript SDK - Transport Layer
 *
 * This module provides an abstraction over WebTransport for QUIC-based streaming.
 * Works in browsers natively, and in Node.js with a WebTransport polyfill.
 *
 * For Node.js, install:
 *   npm install @fails-components/webtransport @fails-components/webtransport-transport-http3-quiche
 *
 * Then pass { webTransportClass, webTransportReady: quicheLoaded } to the Client.
 */

import { serializeHandshake, serializePacket, ACK_SIZE, BufferedReader, DeserializedPacket } from './protocol.js';
import { Packet, Ack, STREAM_TYPE_PUBLISH, STREAM_TYPE_SUBSCRIBE, SISError } from './types.js';

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
interface WebTransportConstructor {
  new (url: string, options?: any): WebTransportInstance;
}

interface WebTransportInstance {
  ready: Promise<void>;
  closed: Promise<{ closeCode?: number; reason?: string }>;

  close(closeInfo?: { closeCode?: number; reason?: string }): void;

  createBidirectionalStream(): Promise<WebTransportBidirectionalStreamLike>;
}

interface WebTransportBidirectionalStreamLike {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
}

// =============================================================================
// Connection Management
// =============================================================================

/**
 * Manages a WebTransport connection to a SIS node.
 * Handles connection lifecycle and stream creation.
 */
export class Transport {
  private config: TransportConfig;
  private transport: WebTransportInstance | null = null;
  private connecting: Promise<void> | null = null;

  constructor(config: TransportConfig) {
    this.config = config;
  }

  /**
   * Connects to the SIS node via WebTransport
   */
  async connect(): Promise<void> {
    if (this.transport) {
      return; // Already connected
    }

    if (this.connecting) {
      return this.connecting; // Connection in progress
    }

    this.connecting = this.doConnect();
    try {
      await this.connecting;
    } finally {
      this.connecting = null;
    }
  }

  private async doConnect(): Promise<void> {
    // Wait for WebTransport library to be ready (for @fails-components/webtransport)
    if (this.config.webTransportReady) {
      try {
        await this.config.webTransportReady;
      } catch {
        // quicheLoaded may reject if http3 transport fails to load
        // but http2 fallback may still work, so continue
      }
    }

    // Try to get WebTransport class
    const WebTransportClass = this.config.webTransportClass ?? (await universalTransport());

    if (!WebTransportClass) {
      throw new SISError(
        'WebTransport is not available. In Node.js, install @fails-components/webtransport and pass it via webTransportClass',
        'WEBTRANSPORT_UNAVAILABLE',
      );
    }

    const options: WebTransportOptions = {};

    // Handle self-signed certificates
    if (this.config.certificateHash) {
      const hashBytes = base64ToBytes(this.config.certificateHash);
      // @fails-components/webtransport expects Buffer, browser expects ArrayBuffer
      // Use the appropriate type based on environment
      const hashValue =
        typeof Buffer !== 'undefined'
          ? Buffer.from(hashBytes)
          : (() => {
              const ab = new ArrayBuffer(hashBytes.length);
              new Uint8Array(ab).set(hashBytes);
              return ab;
            })();
      options.serverCertificateHashes = [
        {
          algorithm: 'sha-256',
          value: hashValue,
        },
      ];
    }

    // For @fails-components/webtransport: force HTTP/3 mode (disable HTTP/2 fallback)
    // SIS server only supports HTTP/3 WebTransport
    if (typeof Buffer !== 'undefined') {
      options.requireUnreliable = true;
    }

    this.transport = new WebTransportClass(this.config.url, options as any);
    await this.transport.ready;
  }

  /**
   * Creates a new bidirectional stream
   */
  async createStream(): Promise<WebTransportBidirectionalStreamLike> {
    if (!this.transport) {
      await this.connect();
    }
    return this.transport!.createBidirectionalStream();
  }

  /**
   * Closes the transport connection
   */
  close(): void {
    if (this.transport) {
      this.transport.close({ closeCode: 0, reason: 'client closed' });
      this.transport = null;
    }
  }

  /**
   * Returns true if the transport is connected
   */
  get isConnected(): boolean {
    return this.transport !== null;
  }
}

// =============================================================================
// Publisher
// =============================================================================

/**
 * Publisher maintains a persistent stream for publishing packets.
 * The handshake is sent once, and subsequent packets reuse the stream.
 */
export class Publisher {
  private transport: Transport;
  private streamId: string;
  private stream: WebTransportBidirectionalStreamLike | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private seqNum = 0;
  private closed = false;
  private ackBuffer = new BufferedReader();

  constructor(transport: Transport, streamId: string) {
    this.transport = transport;
    this.streamId = streamId;
  }

  /**
   * Initializes the publisher by opening a stream and sending the handshake
   */
  async init(): Promise<void> {
    this.stream = await this.transport.createStream();
    this.writer = this.stream.writable.getWriter();
    this.reader = this.stream.readable.getReader();

    // Send handshake
    const handshake = serializeHandshake({
      version: 1,
      type: STREAM_TYPE_PUBLISH,
      stream_id: this.streamId,
    });
    await this.writer.write(handshake);
  }

  /**
   * Publishes a packet and waits for acknowledgement
   */
  async send(payload: Uint8Array, headers?: Record<string, string>): Promise<Ack> {
    if (this.closed || !this.writer || !this.reader) {
      throw new SISError('Publisher is closed');
    }

    const seqNum = this.seqNum++;
    const packet = serializePacket(seqNum, headers, payload);
    await this.writer.write(packet);

    // Read ACK
    const ack = await this.readAck();
    return ack;
  }

  private async readAck(): Promise<Ack> {
    // Check if we already have a complete ACK in buffer
    const bufferedAck = this.ackBuffer.readAck();
    if (bufferedAck) {
      return bufferedAck;
    }

    // Read more data until we have a complete ACK
    while (this.ackBuffer.available < ACK_SIZE) {
      const result = await this.reader!.read();
      if (result.done) {
        throw new SISError('Stream closed while reading ACK');
      }
      this.ackBuffer.append(result.value);
    }

    const ack = this.ackBuffer.readAck();
    if (!ack) {
      throw new SISError('Failed to read ACK');
    }
    return ack;
  }

  /**
   * Sets the sequence number for resuming after reconnection
   */
  setSequence(seq: number): void {
    this.seqNum = seq;
  }

  /**
   * Closes the publisher
   */
  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;

    try {
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      if (this.reader) {
        this.reader.releaseLock();
        this.reader = null;
      }
    } catch {
      // Ignore errors during close
    }
  }

  /**
   * Aborts the publisher (dirty disconnect for testing)
   */
  abort(): void {
    if (this.closed) return;
    this.closed = true;

    try {
      if (this.writer) {
        this.writer.abort(new Error('Publisher aborted'));
        this.writer = null;
      }
      if (this.reader) {
        this.reader.cancel();
        this.reader = null;
      }
    } catch {
      // Ignore errors during abort
    }
  }
}

// =============================================================================
// Subscriber
// =============================================================================

/**
 * Callback for receiving packets
 */
export type PacketCallback = (packet: Packet) => void;

/**
 * Subscriber receives packets from a stream via WebTransport.
 */
export class Subscriber {
  private transport: Transport;
  private streamId: string;
  private offset?: number;
  private stream: WebTransportBidirectionalStreamLike | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private packetBuffer = new BufferedReader();
  private abortController: AbortController | null = null;

  constructor(transport: Transport, streamId: string, offset?: number) {
    this.transport = transport;
    this.streamId = streamId;
    this.offset = offset;
  }

  /**
   * Initializes the subscriber by opening a stream and sending the handshake
   */
  async init(): Promise<void> {
    this.stream = await this.transport.createStream();
    const writer = this.stream.writable.getWriter();
    this.reader = this.stream.readable.getReader();
    this.abortController = new AbortController();

    // Send handshake
    const handshake = serializeHandshake({
      version: 1,
      type: STREAM_TYPE_SUBSCRIBE,
      stream_id: this.streamId,
      offset: this.offset,
    });
    await writer.write(handshake);
    writer.releaseLock();
  }

  /**
   * Returns an async iterator of packets
   */
  async *packets(): AsyncGenerator<Packet, void, unknown> {
    if (!this.reader) {
      throw new SISError('Subscriber not initialized');
    }

    try {
      while (true) {
        // Try to read a packet from buffer first
        const bufferedPacket = this.packetBuffer.readPacket();
        if (bufferedPacket) {
          yield this.toPacket(bufferedPacket);
          continue;
        }

        // Read more data from stream
        const result = await this.reader.read();
        if (result.done) {
          break; // Stream ended
        }

        this.packetBuffer.append(result.value);

        // Try to parse complete packets
        let packet: DeserializedPacket | null;
        while ((packet = this.packetBuffer.readPacket()) !== null) {
          yield this.toPacket(packet);
        }
      }
    } finally {
      this.packetBuffer.close();
    }
  }

  private toPacket(p: DeserializedPacket): Packet {
    return {
      streamId: this.streamId,
      sequenceNum: p.seqNum,
      headers: p.headers,
      payload: p.payload,
    };
  }

  /**
   * Closes the subscriber
   */
  async close(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
    } catch {
      // Ignore errors during close
    }
  }
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Gets the global WebTransport constructor if available
 */
function getGlobalWebTransport(): WebTransportConstructor | undefined {
  if (typeof globalThis !== 'undefined' && 'WebTransport' in globalThis) {
    return (globalThis as Record<string, unknown>)['WebTransport'] as WebTransportConstructor;
  }
  return undefined;
}

async function universalTransport() {
  if (typeof globalThis !== 'undefined' && 'WebTransport' in globalThis) {
    return (globalThis as Record<string, unknown>)['WebTransport'] as WebTransportConstructor;
  } else if (
    typeof process !== 'undefined' &&
    (process as any).versions != null &&
    (process as any).versions.node != null
  ) {
    // Node.js environment
    try {
      // Dynamically import the WebTransport polyfill
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { WebTransport, quicheLoaded } = await import('@fails-components/webtransport');
      await quicheLoaded;
      return WebTransport;
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }
}

/**
 * Converts a base64 string to Uint8Array
 */
function base64ToBytes(base64: string): Uint8Array {
  // Handle both browser and Node.js
  if (typeof atob !== 'undefined') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } else {
    // Node.js
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
}
