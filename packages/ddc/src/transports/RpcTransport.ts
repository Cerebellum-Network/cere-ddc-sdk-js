export type { RpcTransport } from '@protobuf-ts/runtime-rpc';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';

/**
 * The `RpcTransportOptions` type represents the options for an RPC transport.
 *
 * @group RPC Transport
 * @property grpcUrl - The URL for the gRPC server.
 * @property httpUrl - The URL for the HTTP server.
 * @property ssl - An optional boolean indicating whether to use SSL for the connection over WebSocket.
 */
export type RpcTransportOptions = Pick<RpcOptions, 'timeout'> & {
  grpcUrl: string;
  httpUrl: string;
  ssl?: boolean;
};
