import {ChannelCredentials} from '@grpc/grpc-js';
import {GrpcTransport} from '@protobuf-ts/grpc-transport';

export class NativeTransport extends GrpcTransport {
    constructor(host: string) {
        super({
            host,
            channelCredentials: ChannelCredentials.createInsecure(),
        });
    }
}
