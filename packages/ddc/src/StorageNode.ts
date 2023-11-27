import type { Signer, BucketId } from '@cere-ddc-sdk/blockchain';

import { Cid } from './Cid';
import { CnsApi } from './CnsApi';
import { DagApi } from './DagApi';
import { FileApi, ReadFileRange } from './FileApi';
import { MultipartPiece, Piece, PieceResponse } from './Piece';
import { DagNode, DagNodeResponse, mapDagNodeToAPI } from './DagNode';
import { CnsRecord, CnsRecordResponse, mapCnsRecordToAPI } from './CnsRecord';
import { DefaultTransport, RpcTransportOptions } from './transports';

type NamingOptions = {
  name?: string;
};

export type StorageNodeConfig = RpcTransportOptions & {
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

  constructor(signer: Signer, config: StorageNodeConfig) {
    const transport = new DefaultTransport(config);

    this.dagApi = new DagApi(transport);
    this.fileApi = new FileApi(transport, { signer, enableAcks: config.enableAcks });
    this.cnsApi = new CnsApi(transport, { signer });
  }

  async storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, options?: PieceStoreOptions) {
    let cidBytes: Uint8Array | undefined = undefined;

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

    return cid;
  }

  async storeDagNode(bucketId: BucketId, node: DagNode, options?: DagNodeStoreOptions) {
    const cidBytes = await this.dagApi.putNode({
      bucketId,
      node: mapDagNodeToAPI(node),
    });

    const cid = new Cid(cidBytes).toString();

    if (options?.name) {
      await this.storeCnsRecord(bucketId, new CnsRecord(cid, options.name));
    }

    return cid;
  }

  async readPiece(bucketId: BucketId, cidOrName: string, options?: PieceReadOptions) {
    const cid = await this.resolveName(bucketId, cidOrName);
    const contentStream = await this.fileApi.getFile({
      bucketId,
      cid: cid.toBytes(),
      range: options?.range,
    });

    return new PieceResponse(cid, contentStream, {
      range: options?.range,
    });
  }

  async getDagNode(bucketId: BucketId, cidOrName: string, options?: DagNodeGetOptions) {
    const cid = await this.resolveName(bucketId, cidOrName);
    const node = await this.dagApi.getNode({
      bucketId,
      cid: cid.toBytes(),
      path: options?.path,
    });

    return node && new DagNodeResponse(cid, new Uint8Array(node.data), node.links, node.tags);
  }

  async storeCnsRecord(bucketId: BucketId, record: CnsRecord) {
    return this.cnsApi.putRecord({
      bucketId,
      record: mapCnsRecordToAPI(record),
    });
  }

  async getCnsRecord(bucketId: BucketId, name: string) {
    const record = await this.cnsApi.getRecord({ bucketId, name });

    return record && new CnsRecordResponse(record.cid, record.name, record.signature);
  }

  async resolveName(bucketId: BucketId, cidOrName: string) {
    if (Cid.isCid(cidOrName)) {
      return new Cid(cidOrName);
    }

    const cnsRecord = await this.getCnsRecord(bucketId, cidOrName);

    if (!cnsRecord) {
      throw new Error(`Cannot resolve CNS name: "${cidOrName}"`);
    }

    return new Cid(cnsRecord.cid);
  }
}
