import { BucketId } from '@cere-ddc-sdk/blockchain';
import { Router, RouterOperation } from '../routing';
import { Piece, MultipartPiece } from '../Piece';
import { DagNode } from '../DagNode';
import { CnsRecord } from '../CnsRecord';
import {
  DagNodeGetOptions,
  DagNodeStoreOptions,
  PieceReadOptions,
  PieceStoreOptions,
  NodeInterface,
} from './NodeInterface';

export class BalancedNode implements NodeInterface {
  constructor(private router: Router) {}

  async storePiece(bucketId: BucketId, piece: Piece | MultipartPiece, options?: PieceStoreOptions) {
    const node = await this.router.getNode(RouterOperation.STORE_PIECE, bucketId);

    return node.storePiece(bucketId, piece, options);
  }

  async storeDagNode(bucketId: BucketId, dagNode: DagNode, options?: DagNodeStoreOptions) {
    const node = await this.router.getNode(RouterOperation.STORE_DAG_NODE, bucketId);

    return node.storeDagNode(bucketId, dagNode, options);
  }

  async readPiece(bucketId: BucketId, cidOrName: string, options?: PieceReadOptions) {
    const node = await this.router.getNode(RouterOperation.READ_PIECE, bucketId);

    return node.readPiece(bucketId, cidOrName, options);
  }

  async getDagNode(bucketId: BucketId, cidOrName: string, options?: DagNodeGetOptions) {
    const node = await this.router.getNode(RouterOperation.READ_DAG_NODE, bucketId);

    return node.getDagNode(bucketId, cidOrName, options);
  }

  async storeCnsRecord(bucketId: BucketId, record: CnsRecord) {
    const node = await this.router.getNode(RouterOperation.STORE_CNS_RECORD, bucketId);

    return node.storeCnsRecord(bucketId, record);
  }

  async getCnsRecord(bucketId: BucketId, name: string) {
    const node = await this.router.getNode(RouterOperation.READ_CNS_RECORD, bucketId);

    return node.getCnsRecord(bucketId, name);
  }

  async resolveName(bucketId: BucketId, cidOrName: string) {
    const node = await this.router.getNode(RouterOperation.READ_CNS_RECORD, bucketId);

    return node.resolveName(bucketId, cidOrName);
  }
}
