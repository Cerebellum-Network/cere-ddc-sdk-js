import {GrpcWebFetchTransport} from '@protobuf-ts/grpcweb-transport';

export class FetchTransport extends GrpcWebFetchTransport {
    constructor(baseUrl: string) {
        super({baseUrl});
    }
}
