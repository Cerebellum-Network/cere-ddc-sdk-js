import { v4 as uuid } from 'uuid';
import type { Signer, BucketId, StorageNodeMode } from '@cere-ddc-sdk/blockchain';

import { Cid } from '../Cid';
import { CnsApi } from '../CnsApi';
import { DagApi } from '../DagApi';
import { FileApi } from '../FileApi';
import { GRPC_REQUEST_INACTIVITY_TIMEOUT } from '../constants';
import { MultipartPiece, Piece, PieceResponse } from '../Piece';
import { DagNode, DagNodeResponse, mapDagNodeToAPI } from '../DagNode';
import { CnsRecord, CnsRecordResponse, mapCnsRecordToAPI } from '../CnsRecord';
import { DefaultTransport, RpcTransportOptions } from '../transports';
import { bindErrorLogger, createLogger, Logger, LoggerOptions } from '../logger';
import { AuthToken, createSdkToken, getSdkSigner } from '../auth';

import {
  DagNodeGetOptions,
  DagNodeStoreOptions,
  PieceReadOptions,
  PieceStoreOptions,
  NodeInterface,
  OperationAuthOptions,
  CnsRecordStoreOptions,
  CnsRecordGetOptions,
} from './NodeInterface';

export type StorageNodeConfig = RpcTransportOptions &
  LoggerOptions & {
    mode: StorageNodeMode;
    nodeId?: string;
    enableAcks?: boolean;
    authenticate?: boolean;
    authToken?: AuthToken | string;
  };

/**
 * The `StorageNode` class provides methods for communicating with a DDC storage node.
 *
 * @group Storage Node
 * @example
 *
 * ```typescript
 * const signer = new UriSigner('hybrid label reunion ...');
 *
 * const storageNode = new StorageNode(signer, {
 *   mode: StorageNodeMode.Storage,
 * });
 * ```
 */
export class StorageNode implements NodeInterface {
  readonly nodeId: string;
  readonly displayName: string;

  private dagApi: DagApi;
  private fileApi: FileApi;
  private cnsApi: CnsApi;
  private logger: Logger;
  private rootTokenPromise?: Promise<AuthToken>;

  readonly mode: StorageNodeMode;

  constructor(
    private signer: Signer,
    readonly config: StorageNodeConfig,
  ) {
    const authToken = AuthToken.maybeToken(config.authToken);
    const transport = new DefaultTransport({
      ...config,
      timeout: config.timeout ?? GRPC_REQUEST_INACTIVITY_TIMEOUT,
    });

    this.nodeId = config.nodeId || uuid();
    this.mode = config.mode;
    this.logger = createLogger('StorageNode', config);
    this.rootTokenPromise = authToken && Promise.resolve(authToken);

    /**
     * Use the HTTP URL as the display name.
     */
    this.displayName = config.httpUrl;

    const options = {
      signer,
      logger: this.logger,
      authenticate: config.authenticate,
      enableAcks: config.enableAcks,
    };

    this.cnsApi = new CnsApi(transport, options);
    this.dagApi = new DagApi(transport, options);
    this.fileApi = new FileApi(transport, options);

    this.logger.debug(config, 'Storage node initialized');

    bindErrorLogger(this, this.logger, [
      'storePiece',
      'storeDagNode',
      'readPiece',
      'getDagNode',
      'storeCnsRecord',
      'getCnsRecord',
      'resolveName',
    ]);
  }

  private async getRootToken() {
    this.rootTokenPromise ||= createSdkToken(this.signer);

    return this.rootTokenPromise;
  }

  private async createAuthToken({ accessToken }: OperationAuthOptions = {}) {
    const token = AuthToken.maybeToken(accessToken) || (await this.getRootToken());
    const sdkSigner = token.subject && getSdkSigner(this.signer, token.subject);

    return AuthToken.from(token).sign(sdkSigner || this.signer);
  }

  /**
   * Stores a piece (raw or multipart) of data in a specific bucket.
   *
   * @param bucketId - The ID of the bucket to store the piece in.
   * @param piece - The instance of Piece or MultipartPiece.
   * @param options - Optional parameters for storing the piece.
   *
   * @returns A promise that resolves to the CID of the stored piece.
   *
   * @example
   *
   * ```typescript
   * const bucketId: BucketId = 1n;
   * const piece: Piece = new Piece(new Uint8Array([1, 2, 3]));
   * const pieceCid = await storageNode.storePiece(bucketId, piece);
   *
   * console.log(pieceCid);
   * ```
   *
   * ```typescript
   * const bucketId: BucketId = 1n;
   * const piece: MultipartPiece = new MultipartPiece(['CID1', 'CID2'], {
   *  partSize: 1024,
   *  totalSize: 2048,
   * });
   *
   * const pieceCid = await storageNode.storePiece(bucketId, piece);
   *
   * console.log(pieceCid);
   * ```
   */
  async storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, options?: PieceStoreOptions) {
    let cidBytes: Uint8Array | undefined = undefined;
    const token = await this.createAuthToken(options);

    this.logger.debug({ piece, options }, 'Store piece');

    if (MultipartPiece.isMultipartPiece(piece)) {
      this.logger.info('Storing multipart piece into bucket %s', bucketId);

      cidBytes = await this.fileApi.putMultipartPiece({
        bucketId,
        token,
        correlationId: options?.correlationId,
        partHashes: piece.partHashes,
        partSize: piece.meta.partSize,
        totalSize: piece.meta.totalSize,
      });
    }

    if (Piece.isPiece(piece)) {
      this.logger.info('Storing raw piece into bucket %s', bucketId);

      cidBytes = await this.fileApi.putRawPiece(
        {
          bucketId,
          token,
          correlationId: options?.correlationId,
          isMultipart: piece.isPart,
          offset: piece.offset,
          size: piece.size,
        },
        piece.body,
      );
    }

    if (!cidBytes) {
      throw new Error('`piece` argument is neither Piece nor MultipartPiece');
    }

    const cid = new Cid(cidBytes).toString();

    if (options?.name) {
      await this.storeCnsRecord(bucketId, new CnsRecord(cid, options.name), options);
    }

    this.logger.info('Stored piece into bucket %s with CID %s', bucketId, cid);

    return cid;
  }

  /**
   * Stores a DAG node in a specific bucket.
   *
   * @param bucketId - The ID of the bucket to store the DAG node in.
   * @param node - The DAGNode instance to store.
   * @param options - Optional parameters for storing the DAG node.
   *
   * @returns A promise that resolves to the CID of the stored DAG node.
   *
   * @example
   *
   * ```typescript
   * const bucketId: BucketId = 1n;
   * const firstLink = new Link('CID', 10, 'first-link');
   * const node: DagNode = new DagNode('node content', [firstLink]);
   * const nodeCid = await storageNode.storeDagNode(bucketId, node, {
   *  name: 'node-name', // CNS name for the DAG node
   * });
   *
   * console.log(nodeCid);
   * ```
   */
  async storeDagNode(bucketId: BucketId, node: DagNode, options?: DagNodeStoreOptions) {
    const token = await this.createAuthToken(options);

    this.logger.info('Storing DAG node into bucket %s', bucketId);
    this.logger.debug({ bucketId, node, options }, 'Store DAG node');

    const cidBytes = await this.dagApi.putNode({
      bucketId,
      token,
      correlationId: options?.correlationId,
      node: mapDagNodeToAPI(node),
    });

    const cid = new Cid(cidBytes).toString();

    if (options?.name) {
      await this.storeCnsRecord(bucketId, new CnsRecord(cid, options.name), options);
    }

    this.logger.info('Stored DAG Node into bucket %s with CID %s', bucketId, cid);

    return cid;
  }

  /**
   * Reads a piece of data from a specific bucket.
   *
   * @param bucketId - The ID of the bucket to read the piece from.
   * @param cidOrName - The CID or CNS name of the piece to read.
   * @param options - Optional parameters for reading the piece.
   *
   * @returns A promise that resolves to a PieceResponse instance.
   *
   * @example
   *
   * ```typescript
   * const bucketId: BucketId = 1n;
   * const cidOrName = '...'; // CID or CNS name of the piece
   * const piece = await storageNode.readPiece(bucketId, cidOrName);
   *
   * console.log(piece);
   * ```
   */
  async readPiece(bucketId: BucketId, cidOrName: string, options?: PieceReadOptions) {
    const token = await this.createAuthToken(options);

    this.logger.debug({ bucketId, cidOrName, options }, 'Read piece');
    this.logger.info('Reading piece by CID or name "%s" from bucket %s', cidOrName, bucketId);

    const cid = await this.resolveName(bucketId, cidOrName, options);
    const contentStream = await this.fileApi.getFile({
      bucketId,
      token,
      correlationId: options?.correlationId,
      cid: cid.toBytes(),
      range: options?.range,
    });

    const response = new PieceResponse(cid, contentStream, {
      range: options?.range,
    });

    this.logger.info('Read piece by CID or name "%s" from bucket %s', cidOrName, bucketId);
    this.logger.debug({ cid: cid.toString(), response }, 'Piece response');

    return response;
  }

  /**
   * Retrieves a DAG node from a specific bucket.
   *
   * @param bucketId - The ID of the bucket to retrieve the DAG node from.
   * @param cidOrName - The CID or CNS name of the DAG node to retrieve.
   * @param options - Optional parameters for retrieving the DAG node.
   *
   * @returns A promise that resolves to a DagNodeResponse instance.
   *
   * @example
   *
   * ```typescript
   * const bucketId: bigint = 1n;
   * const cidOrName = '...'; // CID or CNS name of the DAG node
   * const dagNode = await storageNode.getDagNode(bucketId, cidOrName);
   *
   * console.log(dagNode);
   * ```
   */
  async getDagNode(bucketId: BucketId, cidOrName: string, options?: DagNodeGetOptions) {
    const token = await this.createAuthToken(options);

    this.logger.info('Getting DAG Node by CID or name "%s" from bucket %s', cidOrName, bucketId);
    this.logger.debug({ token }, 'Auth token');

    const cid = await this.resolveName(bucketId, cidOrName, options);
    const node = await this.dagApi.getNode({
      bucketId,
      token,
      correlationId: options?.correlationId,
      cid: cid.toBytes(),
      path: options?.path,
    });

    const response = node && new DagNodeResponse(cid, new Uint8Array(node.data), node.links, node.tags);

    this.logger.info('Got DAG Node by CID or name "%s" from bucket %s', cidOrName, bucketId);
    this.logger.debug({ cid: cid.toString(), response }, 'DAG Node response');

    return response;
  }

  /**
   * Stores a Content Name System (CNS) record in a specific bucket.
   *
   * @param bucketId - The ID of the bucket to store the CNS record in.
   * @param record - The CNS record to store.
   * @param options - Optional parameters for storing the CNS record.
   *
   * @returns A promise that resolves to the CID of the stored CNS record.
   *
   * @example
   *
   * ```typescript
   * const bucketId: bigint = 1n;
   * const record: CnsRecord = new CnsRecord('CID', 'record-name');
   * const recordCid = await storageNode.storeCnsRecord(bucketId, record);
   *
   * console.log(recordCid);
   * ```
   */
  async storeCnsRecord(bucketId: BucketId, record: CnsRecord, options?: CnsRecordStoreOptions) {
    const token = await this.createAuthToken(options);

    this.logger.debug({ bucketId, record, options }, 'Store CNS record');
    this.logger.info('Storing CNS record into bucket %s', bucketId);

    const storredRecord = await this.cnsApi.putRecord({
      bucketId,
      token,
      correlationId: options?.correlationId,
      record: mapCnsRecordToAPI(record),
    });

    this.logger.info('Stored CNS record into bucket %s', bucketId);

    return storredRecord;
  }

  /**
   * Retrieves a Content Name System (CNS) record from a specific bucket.
   *
   * @param bucketId - The ID of the bucket to retrieve the CNS record from.
   * @param name - The name of the CNS record to retrieve.
   * @param options - Optional parameters for retrieving the CNS record.
   *
   * @returns A promise that resolves to CnsRecordResponse штыефтсу.
   *
   * @example
   *
   * ```typescript
   * const bucketId = 1n;
   * const name = 'record-name';
   * const cnsRecord = await storageNode.getCnsRecord(bucketId, name);
   *
   * console.log(cnsRecord);
   * ```
   */
  async getCnsRecord(bucketId: BucketId, name: string, options?: CnsRecordGetOptions) {
    const token = await this.createAuthToken(options);

    this.logger.info(`Getting CNS record by name "${name}" from bucket ${bucketId}`);
    this.logger.debug({ token }, 'Auth token');

    const record = await this.cnsApi.getRecord({ bucketId, name, token, correlationId: options?.correlationId });

    this.logger.info('Got CNS record by name "%s" from bucket %s', name, bucketId);
    this.logger.debug({ record }, 'CNS record');

    return record && new CnsRecordResponse(record.cid, record.name, record.signature);
  }

  /**
   * Resolves a name to a CID in the Content Name System (CNS).
   *
   * @param name - The CNS name to resolve.
   * @param options - Optional parameters for resolving the name.
   *
   * @returns A promise that resolves to the CID corresponding to the CNS name.
   *
   * @example
   *
   * ```typescript
   * const name: string = 'record-name';
   * const cid = await storageNode.resolveName(name, options);
   *
   * console.log(cid);
   * ```
   */
  async resolveName(bucketId: BucketId, cidOrName: string, options?: CnsRecordGetOptions) {
    if (Cid.isCid(cidOrName)) {
      return new Cid(cidOrName);
    }

    this.logger.info('Resolving CNS name "%s" from bucket %s', cidOrName, bucketId);
    const record = await this.getCnsRecord(bucketId, cidOrName, options);

    if (!record) {
      throw new Error(`Cannot resolve CNS name: "${cidOrName}"`);
    }

    this.logger.info('Resolved CNS name "%s" from bucket %s to "%s"', cidOrName, bucketId, record.cid);
    this.logger.debug({ record }, 'CNS record');

    return new Cid(record.cid);
  }
}
