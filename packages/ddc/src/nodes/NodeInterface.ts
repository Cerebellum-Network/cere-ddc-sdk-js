import { BucketId } from '@cere-ddc-sdk/blockchain';

import { ReadFileRange } from '../FileApi';
import { Record as CnsApiRecord } from '../CnsApi';
import { Piece, MultipartPiece, PieceResponse } from '../Piece';
import { DagNode, DagNodeResponse } from '../DagNode';
import { CnsRecord, CnsRecordResponse } from '../CnsRecord';
import { Cid } from '../Cid';

type NamingOptions = {
  name?: string;
};

export type PieceReadOptions = {
  range?: ReadFileRange;
};

export type DagNodeGetOptions = {
  path?: string;
};

export type PieceStoreOptions = NamingOptions;
export type DagNodeStoreOptions = NamingOptions;

export interface NodeInterface {
  readonly nodeId: string;

  storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, options?: PieceStoreOptions): Promise<string>;
  storeDagNode(bucketId: BucketId, node: DagNode, options?: DagNodeStoreOptions): Promise<string>;
  readPiece(bucketId: BucketId, cidOrName: string, options?: PieceReadOptions): Promise<PieceResponse>;
  getDagNode(bucketId: BucketId, cidOrName: string, options?: DagNodeGetOptions): Promise<DagNodeResponse | undefined>;
  storeCnsRecord(bucketId: BucketId, record: CnsRecord): Promise<CnsApiRecord>;
  getCnsRecord(bucketId: BucketId, name: string): Promise<CnsRecordResponse | undefined>;
  resolveName(bucketId: BucketId, cidOrName: string): Promise<Cid>;
}
