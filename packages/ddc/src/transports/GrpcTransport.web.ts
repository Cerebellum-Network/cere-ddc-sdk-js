import { RpcTransportOptions, RpcTransport } from './RpcTransport';

export type GrpcTransportOptions = Pick<RpcTransportOptions, 'grpcUrl'>;

// @ts-ignore
export class GrpcTransport implements RpcTransport {
  constructor(_options: GrpcTransportOptions) {
    throw new Error('GrpcTransport in not supported in browser environment');
  }
}
