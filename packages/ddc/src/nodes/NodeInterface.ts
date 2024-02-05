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

/**
 * The `OperationAuthOptions` type defines the authentication options for a DDC operation.
 *
 * @hidden
 */
export type OperationAuthOptions = {
  /**
   * An optional access token that can be either an `AuthToken` object or a string.
   */
  accessToken?: AuthToken | string;
};

/**
 * The `PieceReadOptions` type defines the options for reading a piece.
 *
 * @hidden
 * @extends OperationAuthOptions
 */
export type PieceReadOptions = OperationAuthOptions & {
  /**
   * An optional range to read from the piece.
   */
  range?: ReadFileRange;
};

/**
 * The `DagNodeGetOptions` type defines the options for retrieving a DAG node.
 *
 * @hidden
 * @extends OperationAuthOptions
 */
export type DagNodeGetOptions = OperationAuthOptions & {
  /**
   * An optional path to retrieve from the DAG node.
   */
  path?: string;
};

/**
 * The `CnsRecordGetOptions` type defines the options for retrieving a CNS record.
 *
 * @hidden
 * @extends OperationAuthOptions
 */
export type CnsRecordGetOptions = OperationAuthOptions & {
  /**
   * An optional path to retrieve from the CNS record.
   */
  path?: string;
};

/**
 * The `PieceStoreOptions` type defines the options for storing a piece.
 *
 * @hidden
 * @extends NamingOptions
 * @extends OperationAuthOptions
 */
export type PieceStoreOptions = NamingOptions & OperationAuthOptions;

/**
 * The `DagNodeStoreOptions` type defines the options for storing a DAG node.
 *
 * @hidden
 * @extends NamingOptions
 * @extends OperationAuthOptions
 */
export type DagNodeStoreOptions = NamingOptions & OperationAuthOptions;

/**
 * The `CnsRecordStoreOptions` type defines the options for storing a CNS record.
 *
 * @hidden
 * @extends OperationAuthOptions
 */
export type CnsRecordStoreOptions = OperationAuthOptions;

/**
 * The `NodeInterface` interface defines the methods to interact with DDC storage nodes.
 *
 * @group Storage Node
 */
export interface NodeInterface {
  /**
   * The identifier of the node.
   */
  readonly nodeId: string;

  /**
   * Stores a piece in a specific bucket.
   *
   * @returns A promise that resolves to the CID of the stored piece.
   */
  storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, options?: PieceStoreOptions): Promise<string>;

  /**
   * Stores a DAG node in a specific bucket.
   *
   * @returns A promise that resolves to the CID of the stored DAG node.
   */
  storeDagNode(bucketId: BucketId, node: DagNode, options?: DagNodeStoreOptions): Promise<string>;

  /**
   * Reads a piece from a specific bucket.
   *
   * @returns A promise that resolves to a PieceResponse instance.
   */
  readPiece(bucketId: BucketId, cidOrName: string, options?: PieceReadOptions): Promise<PieceResponse>;

  /**
   * Retrieves a DAG node from a specific bucket.
   *
   * @returns A promise that resolves to a DagNodeResponse instance.
   */
  getDagNode(bucketId: BucketId, cidOrName: string, options?: DagNodeGetOptions): Promise<DagNodeResponse | undefined>;

  /**
   * Stores a CNS record in a specific bucket.
   *
   * @returns A promise that resolves to the stored CNS record.
   */
  storeCnsRecord(bucketId: BucketId, record: CnsRecord, options?: CnsRecordStoreOptions): Promise<CnsApiRecord>;

  /**
   * Retrieves a CNS record from a specific bucket.
   *
   * @returns A promise that resolves to the retrieved CNS record.
   */
  getCnsRecord(bucketId: BucketId, name: string, options?: CnsRecordGetOptions): Promise<CnsRecordResponse | undefined>;

  /**
   * Resolves a name to a CID in the CNS.
   *
   * @returns A promise that resolves to the CID corresponding to the CNS name.
   */
  resolveName(bucketId: BucketId, cidOrName: string, options?: CnsRecordGetOptions): Promise<Cid>;
}
