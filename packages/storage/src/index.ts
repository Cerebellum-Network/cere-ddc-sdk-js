import {GrpcTransport} from '@protobuf-ts/grpc-transport';
import {ChannelCredentials} from '@grpc/grpc-js';

import {PutRequest, GetRequest} from './grpc/protos/dag_api';
import {DagApiClient} from './grpc/protos/dag_api.client';

export class StorageNode {
    private dagApi: DagApiClient;

    constructor(readonly host: string) {
        const transport = new GrpcTransport({
            host,
            channelCredentials: ChannelCredentials.createInsecure(),
        });

        this.dagApi = new DagApiClient(transport);
    }

    async store(request: PutRequest) {
        const {response, status} = await this.dagApi.put(request);

        console.log('RPC status', status);

        return response.cid;
    }

    async read(request: GetRequest) {
        const {response} = await this.dagApi.get(request);

        return response.node;
    }
}
