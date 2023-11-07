import {RpcTransport} from '@protobuf-ts/runtime-rpc';

import {PutMultiPartPieceRequest, GetFileRequest_Request, PutRawPieceRequest_Metadata} from '../grpc/file_api';
import {FileApiClient} from '../grpc/file_api.client';
import {Content, createContentStream} from '../streams';

export type GetFileRequest = GetFileRequest_Request;
export type ReadFileRange = GetFileRequest_Request['range'];
export type PutFileMetadata = PutRawPieceRequest_Metadata;

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

        return new Uint8Array(response.cid);
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

        return new Uint8Array(cid);
    }

    async getFile(request: GetFileRequest) {
        const {responses, requests} = this.api.getFile();

        await requests.send({
            body: {
                oneofKind: 'request',
                request,
            },
        });

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
