import { ClientConfig, SignedWallet, CubbyRequestError, CubbyTimeoutError, CubbyQueryRequestBody } from './types';
import { Client as SisClient } from './sis';
import { ContextPath, Packet } from './sis/types';
import Event from './event';
import Wallet from './wallet';
import { parsePacket } from './utils';

export class ClientSdk {
  private readonly clusterUrl: string;
  private readonly eventRuntimeUrl: string;
  private readonly agentRuntimeUrl: string;
  private readonly sisUrl: string;
  private readonly webTransportUrl: string;
  private readonly basePath: string;
  private readonly wallet: SignedWallet;
  private readonly context: ClientConfig['context'];
  private readonly sis: SisClient;

  constructor(config: ClientConfig) {
    this.clusterUrl = config.url;
    this.basePath = `/api/v1/`;
    this.eventRuntimeUrl = config?.eventRuntimeUrl || `${this.clusterUrl}/event`;
    this.agentRuntimeUrl = config?.agentRuntimeUrl || `${this.clusterUrl}/agent`;
    this.sisUrl = config?.sisUrl || `${this.clusterUrl}/sis`;
    this.webTransportUrl = config.webTransportUrl || `${this.clusterUrl}:4433`;
    if (!config.wallet) {
      throw new Error('Wallet configuration is required. Provide a JsonSigner or EmbedWallet via ClientConfig.wallet');
    }
    const wallet = new Wallet(config.wallet);
    this.wallet = wallet.wallet;
    this.context = config.context;
    this.sis = new SisClient({
      httpUrl: this.sisUrl,
      webTransportUrl: this.webTransportUrl,
    });
  }

  private buildURL(baseURL: string, path: string): string {
    path = `${this.basePath}${path}`;
    const url = new URL(baseURL + (baseURL.endsWith('/') && path.startsWith('/') ? path.slice(1) : path));

    return url.toString();
  }

  public event = {
    create: async (eventName: string, payload: unknown): Promise<unknown> => {
      const data = {
        event_type: eventName,
        context_path: this.context,
        payload,
      };
      const event = new Event(data, this.wallet, this.context);
      const body = await event.body();
      const url = this.buildURL(this.eventRuntimeUrl, 'events');
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json();
    },
  };

  public stream = {
    create: async () => {
      const stream = await this.sis.createStream(this.context as ContextPath, {});
      return stream;
    },
    get: (streamId: string) => {
      return this.sis.getStream(streamId);
    },
    publisher: async (streamId: string) => {
      return this.sis.newPublisher(streamId);
    },
    subscribe: (
      streamId: string,
      callback: (data: { headers: Packet['headers']; data: any } | null, error: Error | null) => void,
    ): AbortController => {
      const abortController = new AbortController();
      const signal = abortController.signal;
      const packets = this.sis.subscribe(streamId, signal);

      (async () => {
        if (signal.aborted) return;

        try {
          for await (const packet of packets) {
            if (signal.aborted) break;
            const headers = packet.headers;
            const data = parsePacket(packet);
            callback({ headers, data }, null);
          }
        } catch (error) {
          if (!signal.aborted) {
            callback(null, error as Error);
          }
        } finally {
          packets.return?.();
        }
      })();

      return abortController;
    },
    unsubscribe: (streamId: string) => {
      return this.sis.unsubscribe(streamId);
    },
    unsubscribeAll: () => {
      return this.sis.closeAll();
    },
  };

  public query = {
    fetch: async (
      cubbyName: string,
      queryName: string,
      params?: unknown,
      timeoutMs: number = 60000,
    ): Promise<unknown> => {
      const path = `agent-services/${this.context.agent_service}/cubbies/${cubbyName}/queries/${queryName}`;
      const url = this.buildURL(this.agentRuntimeUrl, path);
      const requestBody = {
        params: params,
        timeoutMs: timeoutMs,
      } as CubbyQueryRequestBody;

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortController.signal,
        });
        const json = await response.json();
        if (response.ok) {
          const resultData = json?.result?.data;
          return resultData !== undefined ? resultData : json;
        }
        const errMessage =
          (json && json.error && json.error.message) || `Request failed with status ${response.status}`;
        throw new CubbyRequestError(errMessage, response.status, json?.error?.code);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new CubbyTimeoutError(timeoutMs);
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    },
  };
}

export default ClientSdk;
