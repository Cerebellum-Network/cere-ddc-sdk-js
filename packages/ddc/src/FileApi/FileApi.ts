import {RpcTransport} from '@protobuf-ts/runtime-rpc';

import {PutMultiPartPieceRequest, GetFileRequest, PutRawPieceRequest_Metadata} from '../grpc/file_api';
import {FileApiClient} from '../grpc/file_api.client';
import {Content, createContentStream} from '../streams';

export type ReadFileRange = GetFileRequest['range'];

const ceilToPowerOf2 = (n: number) => Math.pow(2, Math.ceil(Math.log2(n)));

export class FileApi {
    private api: FileApiClient;

    constructor(transport: RpcTransport) {
        this.api = new FileApiClient(transport);
    }

    async putMultipartPiece(request: PutMultiPartPieceRequest) {
        const {response} = await this.api.putMultipartPiece({
            ...request,
            partSize: ceilToPowerOf2(request.partSize),
        });

        return response.cid;
    }

    async putRawPiece(metadata: PutRawPieceRequest_Metadata, content: Content) {
        const {requests, response} = this.api.putRawPiece();

        await requests.send({
            body: {
                oneofKind: 'metadata',
                metadata,
            },
        });

        for await (const data of createContentStream(content)) {
            await requests.send({
                body: {
                    oneofKind: 'content',
                    content: {data},
                },
            });
        }

        await requests.complete();
        const {cid} = await response;

        return cid;
    }

    getFile(request: GetFileRequest) {
        const {responses} = this.api.getFile(request);

        async function* toDataStream() {
            for await (const {body} of responses) {
                if (body.oneofKind === 'data') {
                    yield body.data;
                }

                if (body.oneofKind === 'proof') {
                    // TODO: validate proof
                }
            }
        }

        return createContentStream(toDataStream());
    }
}
