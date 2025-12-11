import type { ClientConfig, SignedWallet } from './types';
import { Client as SisClient } from './sis';
import { ContextPath, Packet } from './sis/types';
import Event from './event';
import MPC from './mcp';
import Wallet from './wallet';
import { parsePacket } from './utils'

export class ClientSdk {
  private readonly clusterUrl: string;
  private readonly eventRuntimeUrl: string;
  private readonly mcpUrl: string;
  private readonly sisUrl: string;
  private readonly webTransportUrl: string;
  private readonly basePath: string;
  private readonly wallet: SignedWallet;
  private readonly context: ClientConfig['context'];
  private readonly sis: SisClient;

  constructor(config: ClientConfig) {
    this.clusterUrl = config.url;
    this.basePath = `/api/v1/`;
    this.eventRuntimeUrl = config?.eventRuntimeUrl || `${this.clusterUrl}/er`;
    this.mcpUrl = config?.mcpUrl || `${this.clusterUrl}/orchestrator`;
    this.sisUrl = config?.sisUrl || `${this.clusterUrl}/sis`;
    this.webTransportUrl = config.webTransportUrl || this.clusterUrl;
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
    ) => {
      const packets = this.sis.subscribe(streamId);

      (async () => {
        try {
          for await (const packet of packets) {
            const headers = packet.headers;
            const data = parsePacket(packet);
            console.log('data', data);
            callback({ headers, data }, null);
          }
        } catch (error) {
          callback(null, error as Error);
        }
      })();
    },
    unsubscribe: () => {
      return this.sis.close();
    },
  };

  public query = {
    fetch: async (raftId: string, raftAlias: string, payload?: unknown): Promise<unknown> => {
      const path = `mcp/agent-services/${this.context.agent_service}/rafts/${raftId}`;
      const url = this.buildURL(this.mcpUrl, path);
      const request = new MPC(raftAlias, payload || {});
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(request.body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      if (response.ok) {
        const resultData = json?.result?.data;
        return resultData !== undefined ? resultData : json;
      }
      const errMessage = (json && json.error && json.error.message) || `Request failed with status ${response.status}`;
      const error = new Error(errMessage);
      // @ts-expect-error augment error with extra context
      error.status = response.status;
      // @ts-expect-error augment error with extra context
      error.code = json?.error?.code;
      throw error;
    },
  };
}

export default ClientSdk;
