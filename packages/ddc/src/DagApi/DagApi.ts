import {RpcTransport} from '@protobuf-ts/runtime-rpc';

import {PutRequest, GetRequest} from '../grpc/dag_api';
import {DagApiClient} from '../grpc/dag_api.client';

export class DagApi {
    private api: DagApiClient;

    constructor(transport: RpcTransport) {
        this.api = new DagApiClient(transport);
    }

    async putNode(request: PutRequest) {
        const {response} = await this.api.put(request);

        return new Uint8Array(response.cid);
    }

    async getNode(request: GetRequest) {
        const {response} = await this.api.get(request);

        return response.node;
    }
}