import {
  ServiceUnavailableError,
  type NodeInfo,
  type SisClientConfig,
  type CreateStreamOptions,
  type CreateStreamRequest,
  type CreateStreamResponse,
  type DataStream,
  ContextInterface,
} from '../types';

export type Ctx = ContextInterface;

export class SisClient {
  private readonly config: Required<Omit<SisClientConfig, 'nodes'>> & { nodes: NodeInfo[] };
  private readonly nodes: Map<string, NodeInfo> = new Map();
  private readonly nodeList: NodeInfo[] = [];
  private readonly streamOwners: Map<string, string> = new Map();

  constructor(config: SisClientConfig) {
    if (config.nodes.length === 0) {
      throw new Error('at least one node must be configured');
    }
    this.config = {
      httpTimeout: config.httpTimeout ?? 30_000,
      retryAttempts: config.retryAttempts ?? 3,
      retryBaseDelay: config.retryBaseDelay ?? 100,
      nodes: config.nodes,
    };

    for (const n of config.nodes) {
      if (!n.pubKey) throw new Error('node PubKey is required');
      this.nodes.set(n.pubKey, n);
      this.nodeList.push(n);
    }
    console.log(this.nodeList, this.nodes);
  }

  private getRandomNode(): NodeInfo {
    return this.nodeList[Math.floor(Math.random() * this.nodeList.length)];
  }
  private setCachedOwner(streamID: string, owner: string) {
    this.streamOwners.set(streamID, owner);
  }

  // ===================== HTTP Helpers =====================
  private async http(
    method: string,
    baseURL: string,
    path: string,
    body?: any,
    timeoutMs = this.config.httpTimeout,
    headers: Record<string, string> = { 'Content-Type': 'application/json' },
  ): Promise<{ status: number; json: any }> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const url = new URL(path, baseURL).toString();
      const res = await fetch(url, {
        method,
        body: body != null ? JSON.stringify(body) : undefined,
        headers,
        signal: controller.signal,
      });
      const json = await res.json().catch(() => undefined);
      return { status: res.status, json };
    } finally {
      clearTimeout(id);
    }
  }

  // ===================== Stream Management API =====================
  public async createStream(ctx: Ctx, opts?: CreateStreamOptions): Promise<DataStream> {
    const node = this.getRandomNode();
    return this.createStreamOnNode(ctx, node, opts);
  }

  private async createStreamOnNode(ctx: Ctx, node: NodeInfo, opts?: CreateStreamOptions): Promise<DataStream> {
    const req: CreateStreamRequest = { contextPath: ctx };
    if (opts) {
      if (opts.metadata) req.metadata = opts.metadata;
      if (opts.ttlSeconds !== undefined) req.ttlSeconds = opts.ttlSeconds;
    }

    const { status, json } = await this.http('POST', node.httpUrl, '/api/v1/streams', req);
    if (status !== 201) {
      if (status === 503) throw new ServiceUnavailableError();
      throw new Error(`unexpected status code ${status}: ${JSON.stringify(json)}`);
    }
    const createResp = json as CreateStreamResponse;
    const stream = await this.getStreamFromNode(ctx, node, createResp.id);
    this.setCachedOwner(stream.id, stream.owner_node);
    return stream;
  }

  public async getStream(_ctx: Ctx, streamID: string): Promise<DataStream> {
    const node = this.getRandomNode();
    return this.getStreamFromNode(_ctx, node, streamID);
  }

  private async getStreamFromNode(_ctx: Ctx, node: NodeInfo, streamID: string): Promise<DataStream> {
    const { status, json } = await this.http('GET', node.httpUrl, `/api/v1/streams/${streamID}`);
    if (status !== 200) throw new Error(`unexpected status code ${status}: ${JSON.stringify(json)}`);
    const stream = json as DataStream;
    return stream;
  }
}
