/**
 * SIS TypeScript SDK - HTTP Client
 *
 * This module implements the HTTP REST API client for stream management operations.
 * Works in both Node.js and browser environments using the Fetch API.
 */

import {
  DataStream,
  ContextPath,
  CreateStreamOptions,
  CreateStreamResponse,
  CreateRaftRequest,
  CreateRaftResponse,
  SISError,
  ServiceUnavailableError,
  StreamNotFoundError,
} from './types';

/**
 * HTTP client configuration
 */
export interface HttpClientConfig {
  /** Base URL for the SIS API */
  baseUrl: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom fetch function (for testing or custom implementations) */
  fetch?: typeof fetch;
}

/**
 * HTTP client for SIS REST API operations.
 * Handles stream management, raft operations, and other HTTP-based functionality.
 */
export class HttpClient {
  private baseUrl: string;
  private timeout: number;
  private fetchFn: typeof fetch;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout ?? 30000;
    this.fetchFn = config.fetch ?? fetch.bind(globalThis);
  }

  // ===========================================================================
  // Stream Management
  // ===========================================================================

  /**
   * Creates a new data stream
   */
  async createStream(contextPath: ContextPath, options?: CreateStreamOptions): Promise<CreateStreamResponse> {
    const body = {
      context_path: contextPath,
      metadata: options?.metadata,
      ttl_seconds: options?.ttlSeconds,
    };

    const response = await this.request<CreateStreamResponse>('POST', '/api/v1/streams', body);
    return response;
  }

  /**
   * Gets a stream by ID
   */
  async getStream(streamId: string): Promise<DataStream> {
    return this.request<DataStream>('GET', `/api/v1/streams/${streamId}`);
  }

  /**
   * Lists streams with optional filtering
   */
  async listStreams(params?: { status?: string; limit?: number; offset?: number }): Promise<DataStream[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    const path = query ? `/api/v1/streams?${query}` : '/api/v1/streams';
    return this.request<DataStream[]>('GET', path);
  }

  // ===========================================================================
  // Raft Management
  // ===========================================================================

  /**
   * Creates a new Raft (processing unit) attached to a parent stream
   */
  async createRaft(req: CreateRaftRequest): Promise<CreateRaftResponse> {
    const body = {
      workspace_id: req.workspaceId,
      parent_stream_id: req.parentStreamId,
      match_expression: req.matchExpression,
      tsCode: req.tsCode,
    };
    return this.request<CreateRaftResponse>('POST', '/api/v1/rafts', body);
  }

  /**
   * Makes an HTTP request with error handling
   */
  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {};
      if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await this.fetchFn(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      // Prefer text when available; fall back to json() for mocks without text()
      const hasText = typeof (response as any).text === 'function';
      const hasJson = typeof (response as any).json === 'function';
      const responseText = hasText ? await (response as any).text() : '';

      if (!response.ok) {
        if (response.status === 503) {
          throw new ServiceUnavailableError();
        }
        if (response.status === 404) {
          // Try to extract stream ID from path
          const streamMatch = path.match(/\/streams\/([^/]+)/);
          if (streamMatch && streamMatch[1]) {
            throw new StreamNotFoundError(streamMatch[1]);
          }
          throw new SISError(responseText || 'Not found', 'NOT_FOUND', 404);
        }
        if (responseText) {
          throw new SISError(responseText || `HTTP ${response.status}`, 'HTTP_ERROR', response.status);
        }
        if (hasJson) {
          try {
            const j = await (response as any).json();
            throw new SISError(typeof j === 'string' ? j : JSON.stringify(j), 'HTTP_ERROR', response.status);
          } catch {
            // ignore json parse errors
          }
        }
        throw new SISError(`HTTP ${response.status}`, 'HTTP_ERROR', response.status);
      }

      // Handle empty responses
      if (responseText) {
        return JSON.parse(responseText) as T;
      }
      if (hasJson) {
        return (await (response as any).json()) as T;
      }
      return undefined as T;
    } catch (error) {
      if (error instanceof SISError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new SISError(`Request timeout after ${this.timeout}ms`, 'TIMEOUT');
        }
        throw new SISError(error.message, 'NETWORK_ERROR');
      }
      throw new SISError(String(error), 'UNKNOWN_ERROR');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
