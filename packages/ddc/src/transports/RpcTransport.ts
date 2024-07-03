export type { RpcTransport } from '@protobuf-ts/runtime-rpc';

import type { RpcOptions } from '@protobuf-ts/runtime-rpc';

/**
 * The `RpcTransportOptions` type represents the options for an RPC transport.
 *
 * @group RPC Transport
 */
export type RpcTransportOptions = Pick<RpcOptions, 'interceptors'> & {
  /**
   * An optional number indicating the timeout for the connection.
   */
  timeout?: number;

  /**
   * The URL for the gRPC server.
   */
  grpcUrl: string;

  /**
   * The URL for the HTTP server.
   */
  httpUrl: string;

  /**
   * An optional boolean indicating whether to use SSL for the connection over WebSocket.
   */
  ssl?: boolean;
};
