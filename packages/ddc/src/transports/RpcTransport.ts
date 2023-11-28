export type { RpcTransport } from '@protobuf-ts/runtime-rpc';

export type RpcTransportOptions = {
  grpcUrl: string;
  httpUrl: string;
  ssl?: boolean;
};
