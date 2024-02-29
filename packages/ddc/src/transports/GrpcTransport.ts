import { ChannelCredentials } from '@grpc/grpc-js';
import { GrpcTransport as NativeTransport, GrpcOptions } from '@protobuf-ts/grpc-transport';

import { RpcTransport, RpcTransportOptions } from './RpcTransport';
import { TimeoutInterceptor } from './TimeoutInterceptor';

export type GrpcTransportOptions = Pick<RpcTransportOptions, 'grpcUrl' | 'timeout'> & Pick<GrpcOptions, 'interceptors'>;

const URL_PROTOCOL = 'grpc://';
const getHost = (href: string) => {
  return href.startsWith(URL_PROTOCOL) ? href.slice(URL_PROTOCOL.length) : href;
};

/**
 * The `GrpcTransport` class represents a gRPC transport layer for RPC communication.
 *
 * @group RPC Transport
 */
export class GrpcTransport extends NativeTransport implements RpcTransport {
  constructor({ grpcUrl, interceptors = [], timeout }: GrpcTransportOptions) {
    super({
      interceptors: timeout ? [new TimeoutInterceptor(timeout), ...interceptors] : interceptors,
      host: getHost(grpcUrl),
      channelCredentials: ChannelCredentials.createInsecure(),
    });
  }
}
