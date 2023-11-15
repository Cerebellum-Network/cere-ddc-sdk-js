import {ChannelCredentials} from '@grpc/grpc-js';
import {GrpcTransport as NativeTransport} from '@protobuf-ts/grpc-transport';

import {RpcTransport, RpcTransportOptions} from './RpcTransport';

export type GrpcTransportOptions = Pick<RpcTransportOptions, 'grpcUrl'>;

const URL_PROTOCOL = 'grpc://';
const getHost = (href: string) => {
    return href.startsWith(URL_PROTOCOL) ? href.slice(URL_PROTOCOL.length) : href;
};

export class GrpcTransport extends NativeTransport implements RpcTransport {
    constructor({grpcUrl}: GrpcTransportOptions) {
        super({
            host: getHost(grpcUrl),
            channelCredentials: ChannelCredentials.createInsecure(),
        });
    }
}
