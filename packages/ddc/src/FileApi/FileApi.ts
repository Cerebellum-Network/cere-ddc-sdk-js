import { Signer } from '@cere-ddc-sdk/blockchain';

import { MAX_PIECE_SIZE, MB } from '../constants';
import { FileValidator } from '../validators';
import { RpcTransport } from '../transports';
import { Content, createContentStream, getContentSize, isContentStream } from '../streams';
import { createLogger, Logger, LoggerOptions } from '../logger';
import { createRpcMeta as createAuthRpcMeta, AuthMetaParams } from '../auth';
import {
  PutMultiPartPieceRequest as ProtoPutMultiPartPieceRequest,
  GetFileRequest_Request,
  PutRawPieceRequest_Metadata,
} from '../grpc/file_api';
import { FileApiClient } from '../grpc/file_api.client';
import {
  ActivityRequestType,
  createAck,
  createActivityRequest,
  createRequestId,
  CorrelationMetaParams,
  createRpcMeta as createCorrelationRpcMeta,
} from '../activity';

export type ReadFileRange = GetFileRequest_Request['range'];
export type GetFileRequest = Omit<GetFileRequest_Request, 'authenticate'> & AuthMetaParams & CorrelationMetaParams;
export type PutMultiPartPieceRequest = ProtoPutMultiPartPieceRequest & AuthMetaParams & CorrelationMetaParams;
export type PutRawPieceMetadata = Omit<PutRawPieceRequest_Metadata, 'size'> &
  AuthMetaParams &
  CorrelationMetaParams & {
    size?: number;
  };

export type FileApiOptions = LoggerOptions & {
  signer?: Signer;
  authenticate?: boolean;
  enableAcks?: boolean;
};

const ceilToPowerOf2 = (n: number) => Math.pow(2, Math.ceil(Math.log2(n)));

/**
 * The `FileApi` class provides methods to interact with the DDC File API.
 *
 * @group Files
 * @example
 *
 * ```typescript
 * import { FileApi, GrpcTransport } from '@cere-ddc-sdk/ddc';
 *
 * const transport = new GrpcTransport(...);
 * const fileApi = new FileApi(transport);
 * ```
 */
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
      authenticate: options.authenticate ?? false,
    };
  }

  /**
   * Stores a multipart piece in DDC.
   *
   * @param request - An object that includes the access token, the part size, and the piece to store.
   *
   * @returns The CID of the stored piece as a `Uint8Array`.
   *
   * @example
   *
   * ```typescript
   * const request: PutMultiPartPieceRequest = {
   *   token: '...',
   *   partSize: 1024,
   *   piece: { ... }
   * };
   *
   * const cid = await fileApi.putMultipartPiece(request);
   *
   * console.log(cid);
   * ```
   */
  async putMultipartPiece({ token, correlationId, ...request }: PutMultiPartPieceRequest) {
    const { signer } = this.options;
    const meta = createCorrelationRpcMeta(correlationId, createAuthRpcMeta(token));
    const partSize = ceilToPowerOf2(request.partSize);
    this.logger.debug({ ...request, partSize, token, correlationId }, 'Storing multipart piece');

    if (signer) {
      meta.request = await createActivityRequest(
        {
          bucketId: request.bucketId,
          size: ProtoPutMultiPartPieceRequest.toBinary(request).byteLength,
          requestType: ActivityRequestType.STORE,
        },
        { token, signer, logger: this.logger },
      );
    }

    const { response } = await this.api.putMultipartPiece({ ...request, partSize }, { meta });

    this.logger.debug({ response, correlationId }, 'Multipart piece stored');

    return new Uint8Array(response.cid);
  }

  /**
   * Stores a raw piece in DDC.
   *
   * @param metadata - An object that includes the access token and the metadata for the raw piece.
   * @param content - The content of the raw piece as a `Content` object.
   *
   * @returns The CID of the stored piece as a `Uint8Array`.
   *
   * @throws Will throw an error if the size of the raw piece cannot be determined, or if it exceeds the maximum size.
   *
   * @example
   *
   * ```typescript
   * const content: Content = ...;
   * const metadata: PutRawPieceMetadata = {
   *   token: '...',
   *   bucketId: '...',
   *   ...
   * };
   *
   * const cid = await fileApi.putRawPiece(metadata, content);
   *
   * console.log(cid);
   * ```
   */
  async putRawPiece({ token, correlationId, ...metadata }: PutRawPieceMetadata, content: Content) {
    const meta = createCorrelationRpcMeta(correlationId, createAuthRpcMeta(token));
    const size = getContentSize(content, metadata.size);
    const { signer } = this.options;

    this.logger.debug({ metadata, token, correlationId }, 'Storing raw piece of size %d', size);

    if (!size) {
      throw new Error('Cannot determine the raw piece size');
    }

    if (size > MAX_PIECE_SIZE) {
      throw new Error(`Raw piece size should not be greather then ${MAX_PIECE_SIZE / MB} MB`);
    }

    if (signer) {
      meta.request = await createActivityRequest(
        { size, bucketId: metadata.bucketId, requestType: ActivityRequestType.STORE },
        { token, signer, logger: this.logger },
      );
    }

    const call = this.api.putRawPiece({ meta });

    /**
     * Send none-blocking request message.
     */
    call.requests.send({
      body: {
        oneofKind: 'metadata',
        metadata: { ...metadata, size },
      },
    });

    /**
     * Wait for responce headers before start streaming piece content.
     */
    const headers = await call.headers;
    this.logger.debug({ headers, correlationId }, 'Server responded with headers');

    let bytesSent = 0;
    const contentStream = isContentStream(content) ? content : createContentStream(content);
    const reader = contentStream.getReader();

    while (bytesSent < MAX_PIECE_SIZE) {
      const { done, value } = await reader.read();

      if (done || !value) {
        break;
      }

      await Promise.race([
        call.status,
        call.requests.send({
          body: { oneofKind: 'content', content: { data: value } },
        }),
      ]);

      bytesSent += value.byteLength;
    }

    reader.releaseLock();

    await call.requests.complete();
    const { cid } = await call.response;
    this.logger.debug({ cid, correlationId }, 'Raw piece stored');

    return new Uint8Array(cid);
  }

  /**
   * Retrieves a file from DDC.
   *
   * @param request - An object that includes the access token, the CID of the file to retrieve, and an optional range.
   *
   * @returns A stream of the file's content as a `ContentStream`.
   *
   * @example
   *
   * ```typescript
   * const request: GetFileRequest = { token: '...', cid: '...' };
   *
   * const contentStream = await fileApi.getFile(request);
   *
   * for await (const chunk of contentStream) {
   *   console.log(chunk);
   * }
   * ```
   */
  async getFile({ token, correlationId, ...request }: GetFileRequest) {
    const { enableAcks, signer, authenticate = false } = this.options;

    this.logger.debug({ request, token, correlationId }, 'Started reading data');

    const requestId = createRequestId();
    const meta = createCorrelationRpcMeta(correlationId, createAuthRpcMeta(token));
    const validator = new FileValidator(request.cid, {
      logger: this.logger,
      enable: authenticate,
      range: request.range,
    });

    if (signer) {
      meta.request = await createActivityRequest(
        {
          requestId,
          id: request.cid,
          bucketId: request.bucketId,
          offset: request.range?.start,
          size: request.range && request.range.end - request.range.start + 1,
          requestType: ActivityRequestType.GET,
        },
        { token, signer, logger: this.logger },
      );
    }

    const call = this.api.getFile({ meta });

    /**
     * Send none-blocking request message.
     */
    call.requests.send({
      body: {
        oneofKind: 'request',
        request: { ...request, authenticate },
      },
    });

    /**
     * Wait for responce headers to be received.
     */
    const headers = await call.headers;
    this.logger.debug({ headers, correlationId }, 'Server responded with headers');

    /**
     * Create data stream from responce messages.
     */
    async function* toDataStream(this: FileApi) {
      let bytesStoredOrDelivered = 0;

      try {
        for await (const { body } of call.responses) {
          if (body.oneofKind === 'data') {
            yield body.data;

            bytesStoredOrDelivered += body.data.byteLength;

            if (enableAcks) {
              call.requests
                .send({
                  body: {
                    oneofKind: 'ack',
                    ack: await createAck(
                      { requestId, bytesStoredOrDelivered, timestamp: Date.now() },
                      { token, signer, logger: this.logger },
                    ),
                  },
                })
                .then(() => {
                  this.logger.info(
                    'Acknowledgment sent with request ID: %s (%d bytes)',
                    requestId,
                    bytesStoredOrDelivered,
                  );
                })
                .catch(() => {
                  this.logger.warn(
                    'Failed to send acknowledgment with request ID: %s (%d bytes)',
                    requestId,
                    bytesStoredOrDelivered,
                  );
                });
            }

            await validator.update(body.data);
          }

          if (body.oneofKind === 'proof') {
            await validator.prove(body.proof);
          }
        }

        await call.requests.complete();
        await validator.validate();
      } catch (error) {
        this.logger.error(error, 'An error occurred while reading file stream');

        throw error;
      }
    }

    /**
     * Create content stream from Iterator using original chunk size to avoid unnecessary buffering.
     */
    return createContentStream(toDataStream.call(this), null);
  }
}
