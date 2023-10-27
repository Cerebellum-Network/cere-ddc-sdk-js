import {ChannelCredentials} from '@grpc/grpc-js';
import {GrpcTransport} from '@protobuf-ts/grpc-transport';

export class RpcTransport extends GrpcTransport {
    constructor(host: string) {
        super({
            host,
            channelCredentials: ChannelCredentials.createInsecure(),
        });
    }
}
