import type { Signer, BucketId } from '@cere-ddc-sdk/blockchain';

import { Cid } from './Cid';
import { CnsApi } from './CnsApi';
import { DagApi } from './DagApi';
import { FileApi, ReadFileRange } from './FileApi';
import { MultipartPiece, Piece, PieceResponse } from './Piece';
import { DagNode, DagNodeResponse, mapDagNodeToAPI } from './DagNode';
import { CnsRecord, CnsRecordResponse, mapCnsRecordToAPI } from './CnsRecord';
import { DefaultTransport, RpcTransportOptions } from './transports';
import { createLogger, Logger, LoggerOptions } from './Logger';

type NamingOptions = {
  name?: string;
};

export type StorageNodeConfig = RpcTransportOptions &
  LoggerOptions & {
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

  constructor(signer: Signer, config: StorageNodeConfig) {
    const transport = new DefaultTransport(config);

    this.logger = createLogger({ ...config, prefix: 'StorageNode' });
    this.dagApi = new DagApi(transport);
    this.cnsApi = new CnsApi(transport, { signer });
    this.fileApi = new FileApi(transport, {
      signer,
      logLevel: config.logLevel,
      enableAcks: config.enableAcks,
    });

    this.logger.debug('Storage node initialized', config);
  }

  async storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, options?: PieceStoreOptions) {
    let cidBytes: Uint8Array | undefined = undefined;
    this.logger.info(`Storing piece into bucket ${bucketId}`);
    this.logger.debug('Piece', piece);

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

    this.logger.info(`Stored piece into bucket ${bucketId}`, { cid });

    return cid;
  }

  async storeDagNode(bucketId: BucketId, node: DagNode, options?: DagNodeStoreOptions) {
    this.logger.info(`Storing DAG node into bucket ${bucketId}`, options);
    this.logger.debug('DAG node', node);

    const cidBytes = await this.dagApi.putNode({
      bucketId,
      node: mapDagNodeToAPI(node),
    });

    const cid = new Cid(cidBytes).toString();

    if (options?.name) {
      await this.storeCnsRecord(bucketId, new CnsRecord(cid, options.name));
    }

    this.logger.info(`Stored DAG Node into bucket ${bucketId}`, { cid });

    return cid;
  }

  async readPiece(bucketId: BucketId, cidOrName: string, options?: PieceReadOptions) {
    this.logger.info(`Reading piece by CID or name "${cidOrName}" from bucket ${bucketId}`, options);

    const cid = await this.resolveName(bucketId, cidOrName);
    const contentStream = await this.fileApi.getFile({
      bucketId,
      cid: cid.toBytes(),
      range: options?.range,
    });

    const response = new PieceResponse(cid, contentStream, {
      range: options?.range,
    });

    this.logger.info(`Read piece by CID or name "${cidOrName}" from bucket ${bucketId}`, { cid: cid.toString() });
    this.logger.debug('Piece response', response);

    return response;
  }

  async getDagNode(bucketId: BucketId, cidOrName: string, options?: DagNodeGetOptions) {
    this.logger.info(`Getting DAG Node by CID or name "${cidOrName}" from bucket ${bucketId}`);

    const cid = await this.resolveName(bucketId, cidOrName);
    const node = await this.dagApi.getNode({
      bucketId,
      cid: cid.toBytes(),
      path: options?.path,
    });

    const response = node && new DagNodeResponse(cid, new Uint8Array(node.data), node.links, node.tags);

    this.logger.info(`Got DAG Node by CID or name "${cidOrName}" from bucket ${bucketId}`, { cid: cid.toString() });
    this.logger.debug('DAG Node response', response);

    return response;
  }

  async storeCnsRecord(bucketId: BucketId, record: CnsRecord) {
    this.logger.info(`Storing CNS record into bucket ${bucketId}`);
    this.logger.debug('CNS record:', record);

    const storredRecord = await this.cnsApi.putRecord({
      bucketId,
      record: mapCnsRecordToAPI(record),
    });

    this.logger.info(`Stored CNS record into bucket ${bucketId}`);

    return storredRecord;
  }

  async getCnsRecord(bucketId: BucketId, name: string) {
    this.logger.info(`Getting CNS record by name "${name}" from bucket ${bucketId}`);

    const record = await this.cnsApi.getRecord({ bucketId, name });

    this.logger.info(`Got CNS record by name "${name}" from bucket ${bucketId}`);
    this.logger.debug('CNS record', record);

    return record && new CnsRecordResponse(record.cid, record.name, record.signature);
  }

  async resolveName(bucketId: BucketId, cidOrName: string) {
    if (Cid.isCid(cidOrName)) {
      return new Cid(cidOrName);
    }

    this.logger.info(`Resolving CNS name "${cidOrName}" from bucket ${bucketId}`);
    const cnsRecord = await this.getCnsRecord(bucketId, cidOrName);

    if (!cnsRecord) {
      throw new Error(`Cannot resolve CNS name: "${cidOrName}"`);
    }

    this.logger.info(`Resolved CNS name "${cidOrName}" from bucket ${bucketId} to "${cnsRecord.cid}"`);
    this.logger.debug('CNS record', cnsRecord);

    return new Cid(cnsRecord.cid);
  }
}
