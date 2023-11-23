import { Buffer } from 'buffer';
import { v4 as uuid } from 'uuid';
import { RpcMetadata } from '@protobuf-ts/runtime-rpc';
import { Signer } from '@cere-ddc-sdk/blockchain';

import { RpcTransport } from '../transports';
import { createSignature } from '../signature';
import { Content, createContentStream } from '../streams';
import { PutMultiPartPieceRequest, GetFileRequest_Request, PutRawPieceRequest_Metadata } from '../grpc/file_api';
import { FileApiClient } from '../grpc/file_api.client';
import {
  ActivityRequest,
  ActivityRequest_ContentType,
  ActivityRequest_RequestType,
  ActivityAcknowledgment,
} from '../grpc/pb/activity_report';

export type GetFileRequest = GetFileRequest_Request;
export type ReadFileRange = GetFileRequest_Request['range'];
export type PutFileMetadata = PutRawPieceRequest_Metadata;

export type FileApiOptions = {
  signer?: Signer;
  enableAcks?: boolean;
};

const ceilToPowerOf2 = (n: number) => Math.pow(2, Math.ceil(Math.log2(n)));

export class FileApi {
  private api: FileApiClient;
  private options: FileApiOptions;

  constructor(transport: RpcTransport, options: FileApiOptions = {}) {
    this.api = new FileApiClient(transport);

    this.options = {
      enableAcks: !!options.signer, // ACKs are enabled by default if signer is provided
      ...options,
    };
  }

  private async createActivityRequest(requestId: string, { bucketId, cid, range }: GetFileRequest) {
    const { signer } = this.options;

    if (!signer) {
      throw new Error('Activity capturing cannot be enabled. Signer requred!');
    }

    const request = ActivityRequest.create({
      id: cid,
      bucketId,
      requestId,
      offset: range?.start,
      size: range && range.end - range.start + 1,
      contentType: ActivityRequest_ContentType.PIECE,
      requestType: ActivityRequest_RequestType.GET,
      timestamp: Date.now(),
    });

    request.signature = await createSignature(signer, ActivityRequest.toBinary(request));

    return Buffer.from(ActivityRequest.toBinary(request)).toString('hex');
  }

  private async createAck(ack: Omit<ActivityAcknowledgment, 'signature'>) {
    const { signer } = this.options;

    if (!signer) {
      throw new Error('Cannot sign acknowledgment. Signer requred!');
    }

    return ActivityAcknowledgment.create({
      ...ack,
      signature: await createSignature(signer, ActivityAcknowledgment.toBinary(ack)),
    });
  }

  async putMultipartPiece(request: PutMultiPartPieceRequest) {
    const { response } = await this.api.putMultipartPiece({
      ...request,
      partSize: ceilToPowerOf2(request.partSize),
    });

    return new Uint8Array(response.cid);
  }

  async putRawPiece(metadata: PutRawPieceRequest_Metadata, content: Content) {
    const { requests, response } = this.api.putRawPiece();

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
          content: { data },
        },
      });
    }

    await requests.complete();
    const { cid } = await response;

    return new Uint8Array(cid);
  }

  async getFile(request: GetFileRequest) {
    const requestId = uuid();
    const meta: RpcMetadata = {};
    const { enableAcks } = this.options;

    if (enableAcks) {
      meta.request = await this.createActivityRequest(requestId, request);
    }

    const { responses, requests } = this.api.getFile({ meta });

    await requests.send({
      body: {
        oneofKind: 'request',
        request,
      },
    });

    const createAck = (bytesStoredOrDelivered: number) =>
      this.createAck({
        requestId,
        timestamp: Date.now(),
        bytesStoredOrDelivered,
      });

    async function* toDataStream() {
      let bytesDelivered = 0;

      for await (const { body } of responses) {
        if (body.oneofKind === 'data') {
          yield body.data;

          bytesDelivered += body.data.byteLength;

          if (enableAcks) {
            await requests.send({
              body: {
                oneofKind: 'ack',
                ack: await createAck(bytesDelivered),
              },
            });
          }
        }

        if (body.oneofKind === 'proof') {
          // TODO: validate proof
        }
      }

      await requests.complete();
    }

    return createContentStream(toDataStream());
  }
}
