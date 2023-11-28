import { Buffer } from 'buffer';
import { v4 as uuid } from 'uuid';
import { RpcMetadata } from '@protobuf-ts/runtime-rpc';
import { Signer } from '@cere-ddc-sdk/blockchain';

import { RpcTransport } from '../transports';
import { createSignature } from '../signature';
import { Content, createContentStream, getContentSize } from '../streams';
import { PutMultiPartPieceRequest, GetFileRequest_Request, PutRawPieceRequest_Metadata } from '../grpc/file_api';
import { FileApiClient } from '../grpc/file_api.client';
import {
  ActivityRequest,
  ActivityRequest_ContentType,
  ActivityRequest_RequestType as RequestType,
  ActivityAcknowledgment,
} from '../grpc/pb/activity_report';

export type GetFileRequest = GetFileRequest_Request;
export type ReadFileRange = GetFileRequest_Request['range'];
export type PutRawPieceMetadata = PutRawPieceRequest_Metadata & {
  size?: number;
};

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
      ...options,
      enableAcks: options.enableAcks ?? !!options.signer, // ACKs are enabled by default if signer is provided
    };
  }

  private async createActivityRequest(request: Partial<Omit<ActivityRequest, 'contentType' | 'signature'>>) {
    const { signer } = this.options;

    if (!signer) {
      throw new Error('Activity capturing cannot be enabled. Signer requred!');
    }

    const activityRequest = ActivityRequest.create({
      timestamp: Date.now(),
      ...request,
      contentType: ActivityRequest_ContentType.PIECE,
    });

    activityRequest.signature = await createSignature(signer, ActivityRequest.toBinary(activityRequest));

    return Buffer.from(ActivityRequest.toBinary(activityRequest)).toString('hex');
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

  async putRawPiece(metadata: PutRawPieceMetadata, content: Content) {
    const meta: RpcMetadata = {};

    if (this.options.enableAcks) {
      const size = metadata.size || getContentSize(content);

      if (!size) {
        throw new Error('Cannot determine the raw piece size to send ActivityRequest');
      }

      meta.request = await this.createActivityRequest({
        requestId: uuid(),
        bucketId: metadata.bucketId,
        requestType: RequestType.STORE,
        size: metadata.size || getContentSize(content),
      });
    }

    const { requests, response } = this.api.putRawPiece({ meta });

    await requests.send({
      body: {
        oneofKind: 'metadata',
        metadata,
      },
    });

    const reader = createContentStream(content).getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      await requests.send({
        body: {
          oneofKind: 'content',
          content: { data: value },
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
      meta.request = await this.createActivityRequest({
        requestId,
        id: request.cid,
        bucketId: request.bucketId,
        offset: request.range?.start,
        size: request.range && request.range.end - request.range.start + 1,
      });
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
