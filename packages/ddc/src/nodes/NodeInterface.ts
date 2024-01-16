import { BucketId } from '@cere-ddc-sdk/blockchain';

import { ReadFileRange } from '../FileApi';
import { Record as CnsApiRecord } from '../CnsApi';
import { Piece, MultipartPiece, PieceResponse } from '../Piece';
import { DagNode, DagNodeResponse } from '../DagNode';
import { CnsRecord, CnsRecordResponse } from '../CnsRecord';
import { Cid } from '../Cid';
import { AuthToken } from '../auth';

type NamingOptions = {
  name?: string;
};

export type OperationAuthOptions = {
  accessToken?: AuthToken | string;
};

export type PieceReadOptions = OperationAuthOptions & {
  range?: ReadFileRange;
};

export type DagNodeGetOptions = OperationAuthOptions & {
  path?: string;
};

export type CnsRecordGetOptions = OperationAuthOptions & {
  path?: string;
};

export type PieceStoreOptions = NamingOptions & OperationAuthOptions;
export type DagNodeStoreOptions = NamingOptions & OperationAuthOptions;
export type CnsRecordStoreOptions = OperationAuthOptions;

export interface NodeInterface {
  readonly nodeId: string;

  storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, options?: PieceStoreOptions): Promise<string>;
  storeDagNode(bucketId: BucketId, node: DagNode, options?: DagNodeStoreOptions): Promise<string>;
  readPiece(bucketId: BucketId, cidOrName: string, options?: PieceReadOptions): Promise<PieceResponse>;
  getDagNode(bucketId: BucketId, cidOrName: string, options?: DagNodeGetOptions): Promise<DagNodeResponse | undefined>;
  storeCnsRecord(bucketId: BucketId, record: CnsRecord, options?: CnsRecordStoreOptions): Promise<CnsApiRecord>;
  getCnsRecord(bucketId: BucketId, name: string, options?: CnsRecordGetOptions): Promise<CnsRecordResponse | undefined>;
  resolveName(bucketId: BucketId, cidOrName: string, options?: CnsRecordGetOptions): Promise<Cid>;
}
