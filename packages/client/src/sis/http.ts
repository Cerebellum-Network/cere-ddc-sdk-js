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
  RaftDefinition,
  RaftInstance,
  RaftStats,
  SISError,
  ServiceUnavailableError,
  StreamNotFoundError,
} from './types.js';

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
    this.fetchFn = config.fetch ?? fetch;
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
   * Creates a new raft definition
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
   * Gets a raft definition by ID
   */
  async getRaft(definitionId: string): Promise<RaftDefinition> {
    return this.request<RaftDefinition>('GET', `/api/v1/rafts/${definitionId}`);
  }

  /**
   * Lists raft definitions for a parent stream
   */
  async listRafts(parentStreamId: string): Promise<RaftDefinition[]> {
    if (!parentStreamId) {
      throw new SISError('parentStreamId is required');
    }
    return this.request<RaftDefinition[]>(
      'GET',
      `/api/v1/rafts?parent_stream_id=${encodeURIComponent(parentStreamId)}`,
    );
  }

  /**
   * Deletes a raft definition
   */
  async deleteRaft(definitionId: string): Promise<void> {
    await this.request('DELETE', `/api/v1/rafts/${definitionId}`);
  }

  /**
   * Sets raft active status
   */
  async setRaftActive(definitionId: string, active: boolean): Promise<{ id: string; status: string }> {
    return this.request('PATCH', `/api/v1/rafts/${definitionId}/status`, { active });
  }

  /**
   * Gets instances for a raft definition
   */
  async getRaftInstances(definitionId: string): Promise<RaftInstance[]> {
    return this.request<RaftInstance[]>('GET', `/api/v1/rafts/${definitionId}/instances`);
  }

  /**
   * Queries a raft instance
   */
  async queryRaft(streamId: string, definitionId: string, query?: unknown): Promise<unknown> {
    const response = await this.request<{ result: unknown }>(
      'POST',
      `/api/v1/rafts/${streamId}/${definitionId}/query`,
      { query },
    );
    return response.result;
  }

  /**
   * Gets raft statistics
   */
  async getRaftStats(): Promise<RaftStats> {
    return this.request<RaftStats>('GET', '/api/v1/rafts/stats');
  }

  // ===========================================================================
  // Internal
  // ===========================================================================

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

      const responseText = await response.text();

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
        throw new SISError(responseText || `HTTP ${response.status}`, 'HTTP_ERROR', response.status);
      }

      // Handle empty responses
      if (!responseText) {
        return undefined as T;
      }

      return JSON.parse(responseText) as T;
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
