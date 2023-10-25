import {RpcTransport} from '@protobuf-ts/runtime-rpc';

import {
    PutMultiPartPieceRequest,
    PutRawPieceRequest,
    GetFileRequest,
    PutRawPieceRequest_Metadata,
    PutRawPieceRequest_Content,
} from './grpc/file_api';
import {FileApiClient} from './grpc/file_api.client';

export class FileApi {
    private api: FileApiClient;

    constructor(transport: RpcTransport) {
        this.api = new FileApiClient(transport);
    }

    async storeHead(request: PutMultiPartPieceRequest) {
        const {response} = await this.api.putMultipartPiece(request);

        return response;
    }

    async storeChunk(metadata: PutRawPieceRequest_Metadata, content: PutRawPieceRequest_Content) {
        const {requests, response} = this.api.putRawPiece();

        await requests.send({
            body: {
                oneofKind: 'metadata',
                metadata,
            },
        });

        await requests.send({
            body: {
                oneofKind: 'content',
                content,
            },
        });

        await requests.complete();

        return response;
    }

    async readFile(request: GetFileRequest) {
        const response = this.api.getFile(request);

        for await (let {body} of response.responses) {
            if (body.oneofKind === 'proof') {
                console.log('File proof', body.proof);
            }

            if (body.oneofKind === 'data') {
                console.log('File chunk', body.data);
            }
        }

        await response;
    }
}
