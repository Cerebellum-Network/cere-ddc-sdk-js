import {RpcTransport} from '@protobuf-ts/runtime-rpc';

import {PutRequest, GetRequest} from '../grpc/dag_api';
import {DagApiClient} from '../grpc/dag_api.client';

export class DagApi {
    private api: DagApiClient;

    constructor(transport: RpcTransport) {
        this.api = new DagApiClient(transport);
    }

    async store(request: PutRequest) {
        const {response} = await this.api.put(request);

        return response.cid;
    }

    async read(request: GetRequest) {
        const {response} = await this.api.get(request);

        return response.node;
    }
}
