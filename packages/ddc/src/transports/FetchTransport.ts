import {ChannelCredentials} from '@grpc/grpc-js';
import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport';

export class FetchTransport extends GrpcWebFetchTransport {
    constructor(host: string) {
        super({
            baseUrl: 'http://0.0.0.0:8071',
            channelCredentials: ChannelCredentials.createInsecure(),
        });
    }
}
