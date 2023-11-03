import {RpcTransport} from '@protobuf-ts/runtime-rpc';

import {PutRequest, GetRequest} from '../grpc/cns_api';
import {CnsApiClient} from '../grpc/cns_api.client';

export class CnsApi {
    private api: CnsApiClient;

    constructor(transport: RpcTransport) {
        this.api = new CnsApiClient(transport);
    }

    async assignName(request: PutRequest) {
        await this.api.put(request);
    }

    async getCid(request: GetRequest) {
        const {response} = await this.api.get(request);

        return response.record;
    }
}
