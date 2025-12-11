/**
 * SIS TypeScript SDK - Unified Client
 *
 * This module provides a unified client for the Stream Ingestion Service (SIS).
 * It combines HTTP API operations and WebTransport streaming into a single interface.
 *
 * Works in both Node.js (with WebTransport polyfill) and browsers.
 */

import { HttpClient } from './http';
import { Transport, Publisher as TransportPublisher, Subscriber } from './transport';
import { NodeInfo, ClientConfig, DataStream, ContextPath, CreateStreamOptions, Packet, SISError } from './types';
import fetchCertificateHash from './certificate';
import { normalizeSisUrl } from './utils';

/**
 * Unified SIS client with multi-node support.
 * Provides automatic stream discovery, transparent failover,
 * and manages connections to multiple SIS nodes.
 *
 * @example
 * ```typescript
 * const client = new Client({
 *   nodes: [
 *     { pubKey: 'node-0', httpUrl: 'http://localhost:8085', quicAddr: 'localhost:4433' },
 *   ],
 * });
 *
 * // Create a stream
 * const stream = await client.createStream({
 *   agent_service: 'agent-1',
 *   workspace: 'workspace-1',
 *   stream: 'my-stream',
 * });
 *
 * // Publish data
 * const publisher = await client.newPublisher(stream.id);
 * await publisher.send(new TextEncoder().encode('Hello!'));
 * await publisher.close();
 *
 * // Subscribe to data
 * for await (const packet of client.subscribe(stream.id)) {
 *   console.log(new TextDecoder().decode(packet.payload));
 * }
 * ```
 */

const HTTP_TIMEOUT = 30000;
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY = 100;

export class Client {
  private config: ClientConfig;
  private nodes: Map<string, NodeInfo>;
  private nodeList: NodeInfo[];
  private streamOwners: Map<string, string>;
  private transports: Map<string, Transport>;
  private httpClients: Map<string, HttpClient>;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Creates a new unified SIS client.
   *
   * @param config - Client configuration with at least one bootstrap node
   * @throws SISError if configuration is invalid
   */
  constructor(config: ClientConfig) {
    this.config = {
      ...config,
      httpTimeout: config.httpTimeout ?? HTTP_TIMEOUT,
      retryAttempts: config.retryAttempts ?? RETRY_ATTEMPTS,
      retryBaseDelay: config.retryBaseDelay ?? RETRY_BASE_DELAY,
    };

    // Build node registry
    this.nodes = new Map();
    this.nodeList = [];
    this.streamOwners = new Map();
    this.transports = new Map();
    this.httpClients = new Map();
  }

  async init() {
    const certHash = await fetchCertificateHash(this.config.httpUrl);
    const nodePubKey = ((await (await fetch(`${this.config.httpUrl}/api/v1/node`)).json()) as { pub_key: string })
      .pub_key;
    const nodeInfo: NodeInfo = {
      pubKey: nodePubKey,
      quicAddr: this.config.webTransportUrl,
      httpUrl: this.config.httpUrl,
    };
    this.nodes.set(nodeInfo.pubKey, nodeInfo);
    if (!this.nodeList.find((n) => n.pubKey === nodeInfo.pubKey)) {
      this.nodeList.push(nodeInfo);
    }
    this.config.certificateHash = certHash;
    this.initialized = true;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.init()
      .catch((err) => {
        // reset flags on failure to allow retry on next call
        this.initialized = false;
        throw err;
      })
      .finally(() => {
        this.initPromise = null;
      });
    return this.initPromise;
  }

  // ===========================================================================
  // Node Management
  // ===========================================================================

  /**
   * Gets a random node for load distribution.
   */
  private getRandomNode(): NodeInfo {
    const httpNodes = this.nodeList.filter((n) => n.httpUrl);
    if (httpNodes.length === 0) {
      // Safe because constructor ensures at least one node
      return this.nodeList[0]!;
    }
    // Safe because httpNodes has at least one element
    return httpNodes[Math.floor(Math.random() * httpNodes.length)]!;
  }

  /**
   * Gets a node by its public key.
   */
  private getNodeByPubKey(pubKey: string): NodeInfo | undefined {
    return this.nodes.get(pubKey);
  }

  /**
   * Dynamically registers a new node.
   * Useful for node discovery when stream metadata contains an unknown node.
   */
  addNode(node: NodeInfo): void {
    if (!node.pubKey) return;
    if (!this.nodes.has(node.pubKey) && node.httpUrl) {
      this.nodeList.push(node);
    }
    this.nodes.set(node.pubKey, node);
  }

  /**
   * Gets the cached owner for a stream.
   */
  private getCachedOwner(streamId: string): string | undefined {
    return this.streamOwners.get(streamId);
  }

  /**
   * Sets the cached owner for a stream.
   */
  private setCachedOwner(streamId: string, ownerPubKey: string): void {
    this.streamOwners.set(streamId, ownerPubKey);
  }

  /**
   * Gets an HTTP client for a node (lazy initialized).
   */
  private getHttpClient(node: NodeInfo): HttpClient {
    let client = this.httpClients.get(node.pubKey);
    if (!client) {
      client = new HttpClient({
        baseUrl: node.httpUrl,
        timeout: this.config.httpTimeout,
      });
      this.httpClients.set(node.pubKey, client);
    }
    return client;
  }

  /**
   * Gets a Transport for a node (lazy initialized).
   */
  private getTransport(node: NodeInfo): Transport {
    let transport = this.transports.get(node.pubKey);
    if (!transport) {
      // Normalize WebTransport URL to always point to the SIS endpoint
      const url = normalizeSisUrl(node.quicAddr);
      transport = new Transport({
        url,
        certificateHash: this.config.certificateHash,
      });
      this.transports.set(node.pubKey, transport);
    }
    return transport;
  }

  // ===========================================================================
  // Stream Management API
  // ===========================================================================

  /**
   * Creates a new data stream via the HTTP API.
   * The stream is created on a randomly selected node.
   * Streams start in "paused" state and auto-activate on first packet.
   *
   * @param contextPath - Links the stream to Event Runtime context
   * @param options - Optional parameters (metadata, TTL)
   * @returns The created DataStream
   */
  async createStream(contextPath: ContextPath, options?: CreateStreamOptions): Promise<DataStream> {
    await this.ensureInitialized();
    const node = this.getRandomNode();
    const client = this.getHttpClient(node);

    const response = await client.createStream(contextPath, options);

    // Fetch full stream details
    const stream = await this.getStreamFromNode(node, response.id);

    // Cache the owner
    if (stream.owner_node) {
      this.setCachedOwner(stream.id, stream.owner_node);
    }

    return stream;
  }

  /**
   * Gets stream metadata via the HTTP API.
   * Uses any available node - stream metadata is replicated across all nodes.
   *
   * @param streamId - Unique identifier of the stream
   * @returns The DataStream
   */
  async getStream(streamId: string): Promise<DataStream> {
    await this.ensureInitialized();
    const node = this.getRandomNode();
    return this.getStreamFromNode(node, streamId);
  }

  /**
   * Gets stream metadata from a specific node.
   */
  private async getStreamFromNode(node: NodeInfo, streamId: string): Promise<DataStream> {
    const client = this.getHttpClient(node);
    const stream = await client.getStream(streamId);

    // Cache the owner and discover new nodes
    if (stream.owner_node) {
      this.setCachedOwner(stream.id, stream.owner_node);

      // Dynamic node discovery - use WebTransport address (for browsers) or QUIC address
      const discoveredAddr = stream.owner_node_webtransport_addr || stream.owner_node_addr;
      if (discoveredAddr && !this.nodes.has(stream.owner_node)) {
        this.addNode({
          pubKey: stream.owner_node,
          quicAddr: discoveredAddr, // WebTransport URL or QUIC address
          httpUrl: '', // Not included in stream metadata
        });
      }
    }

    return stream;
  }

  /**
   * Discovers which node owns a stream.
   * Can be called on any node - ownership info is replicated via Redis.
   *
   * @param streamId - Unique identifier of the stream
   * @returns The owner node's public key
   */
  async discoverOwner(streamId: string): Promise<string> {
    await this.ensureInitialized();
    // Check cache first
    const cached = this.getCachedOwner(streamId);
    if (cached) return cached;

    // Query any node
    const stream = await this.getStream(streamId);
    if (!stream.owner_node) {
      throw new SISError(`Stream ${streamId} has no owner node`);
    }

    return stream.owner_node;
  }

  // ===========================================================================
  // Publishing API
  // ===========================================================================

  /**
   * Creates a Publisher for publishing to a stream.
   * The Publisher maintains a persistent connection with automatic discovery.
   *
   * @param streamId - Target stream identifier
   * @returns A Publisher instance
   */
  async newPublisher(streamId: string): Promise<Publisher> {
    await this.ensureInitialized();
    // Discover owner node
    const ownerPubKey = await this.discoverOwner(streamId);

    // Get the owner node info
    let ownerNode = this.getNodeByPubKey(ownerPubKey);
    if (!ownerNode) {
      ownerNode = this.getRandomNode();
    }

    // Get transport and create publisher
    const transport = this.getTransport(ownerNode);
    const transportPublisher = new TransportPublisher(transport, streamId);
    await transportPublisher.init();

    return new Publisher(transportPublisher);
  }

  // ===========================================================================
  // Subscription API
  // ===========================================================================

  /**
   * Subscribes to a stream in live mode.
   * Receives only packets published after subscription is established.
   *
   * @param streamId - Target stream identifier
   * @returns An async iterator of Packets
   */
  async *subscribe(streamId: string): AsyncGenerator<Packet, void, unknown> {
    await this.ensureInitialized();
    yield* this.subscribeWithOffset(streamId);
  }

  /**
   * Subscribes to a stream starting from a specific offset.
   *
   * @param streamId - Target stream identifier
   * @param offset - Starting sequence number (undefined = live mode)
   * @returns An async iterator of Packets
   */
  async *subscribeWithOffset(streamId: string, offset?: number): AsyncGenerator<Packet, void, unknown> {
    await this.ensureInitialized();
    // Discover owner node
    const ownerPubKey = await this.discoverOwner(streamId);

    // Get the owner node info
    let ownerNode = this.getNodeByPubKey(ownerPubKey);
    if (!ownerNode) {
      ownerNode = this.getRandomNode();
    }

    // Get transport and create subscriber
    const transport = this.getTransport(ownerNode);
    const subscriber = new Subscriber(transport, streamId, offset);
    await subscriber.init();

    try {
      yield* subscriber.packets();
    } finally {
      await subscriber.close();
    }
  }

  // ===========================================================================
  // Raft API (delegated to HTTP client)
  // ===========================================================================

  /**
   * Gets an HTTP client for raft operations on a specific node.
   * If pubKey is not provided, uses a random node.
   */
  raftClient(pubKey?: string): HttpClient {
    // ensureInitialized is not awaited here because raftClient is synchronous;
    // best-effort safeguard for consumers that call synchronous method first.
    // They should call any async method or init() before using raft client.
    // However, if we already have initialization, it will use populated nodes.
    // For strictness, throw if not initialized yet.
    if (!this.initialized) {
      throw new SISError('Client is not initialized. Call init() first.');
    }
    const node = pubKey ? this.getNodeByPubKey(pubKey) : this.getRandomNode();
    if (!node) {
      throw new SISError(`Node ${pubKey} not found`);
    }
    return this.getHttpClient(node);
  }

  // ===========================================================================
  // Cleanup
  // ===========================================================================

  /**
   * Closes all connections and cleans up resources.
   */
  async close(): Promise<void> {
    for (const transport of this.transports.values()) {
      transport.close();
    }
    this.transports.clear();
    this.httpClients.clear();
    this.streamOwners.clear();
  }
}

/**
 * Publisher wraps the transport publisher with a simpler API.
 */
export class Publisher {
  private publisher: TransportPublisher;

  constructor(publisher: TransportPublisher) {
    this.publisher = publisher;
  }

  /**
   * Publishes a packet and waits for acknowledgement.
   *
   * @returns The acknowledged sequence number and timestamp
   * @param data
   */
  async send(data: { message: any; index?: number }): Promise<{ sequenceNum: number; timestamp: number }> {
    const payload = new TextEncoder().encode(data.message);
    const headers = {
      'content-type': 'text/plain',
      'message-index': String(data.index || 0),
    };
    const ack = (await this.publisher.send(payload, headers)) as any;
    const sequenceNum = ack?.sequenceNum ?? ack?.seq;
    const timestamp = ack?.timestamp ?? 0;
    return { sequenceNum, timestamp };
  }

  /**
   * Sets the sequence number for resuming after reconnection.
   */
  setSequence(seq: number): void {
    this.publisher.setSequence(seq);
  }

  /**
   * Closes the publisher.
   */
  async close(): Promise<void> {
    await this.publisher.close();
  }

  /**
   * Aborts the publisher (dirty disconnect for testing).
   */
  abort(): void {
    this.publisher.abort();
  }
}
