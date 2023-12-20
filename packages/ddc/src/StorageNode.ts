import type { Signer, BucketId, StorageNodeMode } from '@cere-ddc-sdk/blockchain';

import { Cid } from './Cid';
import { CnsApi } from './CnsApi';
import { DagApi } from './DagApi';
import { FileApi, ReadFileRange } from './FileApi';
import { MultipartPiece, Piece, PieceResponse } from './Piece';
import { DagNode, DagNodeResponse, mapDagNodeToAPI } from './DagNode';
import { CnsRecord, CnsRecordResponse, mapCnsRecordToAPI } from './CnsRecord';
import { DefaultTransport, RpcTransportOptions } from './transports';
import { bindErrorLogger, createLogger, Logger, LoggerOptions } from './Logger';

type NamingOptions = {
  name?: string;
};

export type StorageNodeConfig = RpcTransportOptions &
  LoggerOptions & {
    mode: StorageNodeMode;
    enableAcks?: boolean;
  };

export type PieceReadOptions = {
  range?: ReadFileRange;
};

export type DagNodeGetOptions = {
  path?: string;
};

export type PieceStoreOptions = NamingOptions;
export type DagNodeStoreOptions = NamingOptions;

export class StorageNode {
  private dagApi: DagApi;
  private fileApi: FileApi;
  private cnsApi: CnsApi;
  private logger: Logger;
  readonly mode: StorageNodeMode;

  constructor(signer: Signer, config: StorageNodeConfig) {
    const transport = new DefaultTransport(config);

    this.mode = config.mode;
    this.logger = createLogger('StorageNode', config);
    this.dagApi = new DagApi(transport);
    this.cnsApi = new CnsApi(transport, { signer });
    this.fileApi = new FileApi(transport, {
      signer,
      logger: this.logger,
      enableAcks: config.enableAcks,
    });

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

  async storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, options?: PieceStoreOptions) {
    let cidBytes: Uint8Array | undefined = undefined;
    this.logger.info(options, 'Storing piece into bucket %s', bucketId);
    this.logger.debug({ piece }, 'Piece');

    if (MultipartPiece.isMultipartPiece(piece)) {
      cidBytes = await this.fileApi.putMultipartPiece({
        bucketId,
        partHashes: piece.partHashes,
        partSize: piece.meta.partSize,
        totalSize: piece.meta.totalSize,
      });
    }

    if (Piece.isPiece(piece)) {
      cidBytes = await this.fileApi.putRawPiece(
        {
          bucketId,
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
      await this.storeCnsRecord(bucketId, new CnsRecord(cid, options.name));
    }

    this.logger.info({ cid }, 'Stored piece into bucket %s', bucketId);

    return cid;
  }

  async storeDagNode(bucketId: BucketId, node: DagNode, options?: DagNodeStoreOptions) {
    this.logger.info(options, 'Storing DAG node into bucket %s', bucketId);
    this.logger.debug({ node }, 'DAG node');

    const cidBytes = await this.dagApi.putNode({
      bucketId,
      node: mapDagNodeToAPI(node),
    });

    const cid = new Cid(cidBytes).toString();

    if (options?.name) {
      await this.storeCnsRecord(bucketId, new CnsRecord(cid, options.name));
    }

    this.logger.info({ cid }, 'Stored DAG Node into bucket %s', bucketId);

    return cid;
  }

  async readPiece(bucketId: BucketId, cidOrName: string, options?: PieceReadOptions) {
    this.logger.info(options, 'Reading piece by CID or name "%s" from bucket %s', cidOrName, bucketId);

    const cid = await this.resolveName(bucketId, cidOrName);
    const contentStream = await this.fileApi.getFile({
      bucketId,
      cid: cid.toBytes(),
      range: options?.range,
    });

    const response = new PieceResponse(cid, contentStream, {
      range: options?.range,
    });

    this.logger.info({ cid: cid.toString() }, 'Read piece by CID or name "%s" from bucket %s', cidOrName, bucketId);
    this.logger.debug({ response }, 'Piece response');

    return response;
  }

  async getDagNode(bucketId: BucketId, cidOrName: string, options?: DagNodeGetOptions) {
    this.logger.info('Getting DAG Node by CID or name "%s" from bucket %s', cidOrName, bucketId);

    const cid = await this.resolveName(bucketId, cidOrName);
    const node = await this.dagApi.getNode({
      bucketId,
      cid: cid.toBytes(),
      path: options?.path,
    });

    const response = node && new DagNodeResponse(cid, new Uint8Array(node.data), node.links, node.tags);

    this.logger.info({ cid: cid.toString() }, 'Got DAG Node by CID or name "%s" from bucket %s', cidOrName, bucketId);
    this.logger.debug({ response }, 'DAG Node response');

    return response;
  }

  async storeCnsRecord(bucketId: BucketId, record: CnsRecord) {
    this.logger.info('Storing CNS record into bucket %s', bucketId);
    this.logger.debug({ record }, 'CNS record');

    const storredRecord = await this.cnsApi.putRecord({
      bucketId,
      record: mapCnsRecordToAPI(record),
    });

    this.logger.info('Stored CNS record into bucket %s', bucketId);

    return storredRecord;
  }

  async getCnsRecord(bucketId: BucketId, name: string) {
    this.logger.info(`Getting CNS record by name "${name}" from bucket ${bucketId}`);

    const record = await this.cnsApi.getRecord({ bucketId, name });

    this.logger.info('Got CNS record by name "%s" from bucket %s', name, bucketId);
    this.logger.debug({ record }, 'CNS record');

    return record && new CnsRecordResponse(record.cid, record.name, record.signature);
  }

  async resolveName(bucketId: BucketId, cidOrName: string) {
    if (Cid.isCid(cidOrName)) {
      return new Cid(cidOrName);
    }

    this.logger.info('Resolving CNS name "%s" from bucket %s', cidOrName, bucketId);
    const record = await this.getCnsRecord(bucketId, cidOrName);

    if (!record) {
      throw new Error(`Cannot resolve CNS name: "${cidOrName}"`);
    }

    this.logger.info('Resolved CNS name "%s" from bucket %s to "%s"', cidOrName, bucketId, record.cid);
    this.logger.debug({ record }, 'CNS record');

    return new Cid(record.cid);
  }
}
