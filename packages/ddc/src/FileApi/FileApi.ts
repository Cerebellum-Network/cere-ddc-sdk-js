import { Buffer } from 'buffer';
import { v4 as uuid } from 'uuid';
import { Signer } from '@cere-ddc-sdk/blockchain';

import { RpcTransport } from '../transports';
import { createSignature } from '../signature';
import { Content, createContentStream, getContentSize } from '../streams';
import { createLogger, Logger, LoggerOptions } from '../Logger';
import {
  PutMultiPartPieceRequest as ProtoPutMultiPartPieceRequest,
  GetFileRequest_Request,
  PutRawPieceRequest_Metadata,
} from '../grpc/file_api';
import { FileApiClient } from '../grpc/file_api.client';
import { createRpcMeta, AuthToken } from '../auth';
import {
  ActivityRequest,
  ActivityRequest_ContentType,
  ActivityRequest_RequestType as RequestType,
  ActivityAcknowledgment,
} from '../grpc/activity_report/activity_report';

type AuthParams = { token?: AuthToken };
export type ReadFileRange = GetFileRequest_Request['range'];
export type GetFileRequest = Omit<GetFileRequest_Request, 'authenticate'> & AuthParams;
export type PutMultiPartPieceRequest = ProtoPutMultiPartPieceRequest & AuthParams;
export type PutRawPieceMetadata = Omit<PutRawPieceRequest_Metadata, 'size'> &
  AuthParams & {
    size?: number;
  };

export type FileApiOptions = LoggerOptions & {
  signer?: Signer;
  enableAcks?: boolean;
};

const ceilToPowerOf2 = (n: number) => Math.pow(2, Math.ceil(Math.log2(n)));

export class FileApi {
  private logger: Logger;
  private api: FileApiClient;
  private options: FileApiOptions;

  constructor(transport: RpcTransport, options: FileApiOptions = {}) {
    this.api = new FileApiClient(transport);
    this.logger = createLogger('FileApi', options);

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
    this.logger.debug({ activityRequest }, 'Activity request');

    return Buffer.from(ActivityRequest.toBinary(activityRequest)).toString('base64');
  }

  private async createAck(ack: Omit<ActivityAcknowledgment, 'signature'>) {
    const { signer } = this.options;

    if (!signer) {
      throw new Error('Cannot sign acknowledgment. Signer requred!');
    }

    const signedAck = ActivityAcknowledgment.create({
      ...ack,
      signature: await createSignature(signer, ActivityAcknowledgment.toBinary(ack)),
    });

    this.logger.debug({ signedAck }, 'Activity acknowledgment');

    return signedAck;
  }

  async putMultipartPiece({ token, ...request }: PutMultiPartPieceRequest) {
    const partSize = ceilToPowerOf2(request.partSize);
    this.logger.debug({ ...request, partSize, token }, 'Storing multipart piece');

    const { response } = await this.api.putMultipartPiece(
      { ...request, partSize },
      {
        meta: createRpcMeta(token),
      },
    );

    this.logger.debug({ response }, 'Multipart piece stored');

    return new Uint8Array(response.cid);
  }

  async putRawPiece({ token, ...metadata }: PutRawPieceMetadata, content: Content) {
    const meta = createRpcMeta(token);
    const size = metadata.size || getContentSize(content);

    if (!size) {
      throw new Error('Cannot determine the raw piece size');
    }

    this.logger.debug({ metadata, token }, 'Storing raw piece of size %d', size);

    if (this.options.enableAcks) {
      meta.request = await this.createActivityRequest({
        size,
        requestId: uuid(),
        bucketId: metadata.bucketId,
        requestType: RequestType.STORE,
      });
    }

    const { requests, response } = this.api.putRawPiece({ meta });

    await requests.send({
      body: {
        oneofKind: 'metadata',
        metadata: { ...metadata, size },
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

    this.logger.debug({ cid }, 'Raw piece stored');

    return new Uint8Array(cid);
  }

  async getFile({ token, ...request }: GetFileRequest) {
    this.logger.debug({ request, token }, 'Started reading data');

    const requestId = uuid();
    const meta = createRpcMeta(token);
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

    const { responses, requests, status } = this.api.getFile({ meta });

    status.then((status) => {
      this.logger.debug({ status }, 'Data stream ended');
    });

    await requests.send({
      body: {
        oneofKind: 'request',
        request: {
          ...request,
          /**
           * Currently the proofs are not validated, so we don't need to authenticate the request.
           *
           * TODO: Implement proof validation and enable authentication.
           */
          authenticate: false,
        },
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
          // TODO: Enable request authentication and validate the proof here.
        }
      }

      await requests.complete();
    }

    return createContentStream(toDataStream());
  }
}
