import {RpcTransport} from '@protobuf-ts/runtime-rpc';

import {PutMultiPartPieceRequest, GetFileRequest, PutRawPieceRequest_Metadata} from '../grpc/file_api';
import {FileApiClient} from '../grpc/file_api.client';
import {Content, createStream} from './streams';

export type ReadFileRange = GetFileRequest['range'];

function ceilToPowerOf2(n: bigint) {
    if (n <= 1n) {
        return 1n;
    }

    let powerOf2 = 2n;

    while (powerOf2 < n) {
        powerOf2 *= 2n;
    }

    return powerOf2;
}

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

        const contentStream = createStream(content);
        console.log('Piece stream', contentStream);
        for await (const data of contentStream) {
            console.log('Data', data.byteLength);
            await requests.send({
                body: {
                    oneofKind: 'content',
                    content: {data},
                },
            });
        }

        console.log('Before complete');

        await requests.complete();
        const {cid} = await response;

        console.log('Complete');

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

        return createStream(toDataStream());
    }
}
