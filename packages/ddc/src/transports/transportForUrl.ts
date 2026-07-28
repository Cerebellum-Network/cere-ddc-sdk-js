import { GrpcTransport } from './GrpcTransport';
import { WebsocketTransport } from './WebsocketTransport';
import { RpcTransport, RpcTransportOptions } from './RpcTransport';

export type TransportForUrlOptions = Pick<RpcTransportOptions, 'timeout' | 'interceptors'>;

const GRPC_SCHEME = /^grpc:\/\//i;
const SSL_SCHEME = /^(https|wss):\/\//i;
const PLAIN_SCHEME = /^(http|ws):\/\//i;

/**
 * Builds an `RpcTransport` for a single endpoint URL, selecting the
 * implementation by URL scheme. This is the scheme-driven counterpart to the
 * env-based (`DefaultTransport`) node/browser swap used by `Router`-selected nodes:
 *
 * - `grpc://` selects the native `GrpcTransport` (in the browser build this
 *   throws via `GrpcTransport.web`, since native gRPC sockets aren't available there).
 * - `https://`/`wss://` and `http://`/`ws://` select `WebsocketTransport` (grpc-web,
 *   works in both node and the browser), with `ssl` derived from the scheme.
 *
 * @group RPC Transport
 */
export const transportForUrl = (url: string, options: TransportForUrlOptions = {}): RpcTransport => {
  if (GRPC_SCHEME.test(url)) {
    /**
     * In the browser build `GrpcTransport` resolves to `GrpcTransport.web` (native gRPC
     * sockets aren't available there), a stub whose constructor throws before returning
     * — it doesn't structurally implement `RpcTransport`, hence the cast.
     */
    return new GrpcTransport({ grpcUrl: url, ...options }) as unknown as RpcTransport;
  }

  if (SSL_SCHEME.test(url) || PLAIN_SCHEME.test(url)) {
    const ssl = SSL_SCHEME.test(url);

    /**
     * `WebsocketTransport` only understands `http(s)://` hosts (it derives the
     * actual `ws`/`wss` protocol internally from the `ssl` flag), so normalize
     * a `ws://`/`wss://` endpoint URL to its `http(s)://` equivalent first.
     */
    const httpUrl = url.replace(/^wss:\/\//i, 'https://').replace(/^ws:\/\//i, 'http://');

    return new WebsocketTransport({ httpUrl, ssl, ...options });
  }

  throw new Error(`Unsupported transport URL scheme in "${url}"`);
};
