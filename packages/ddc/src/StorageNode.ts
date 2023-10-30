import {CnsApi} from './CnsApi';
import {DagApi} from './DagApi';
import {FileApi, ReadFileRange} from './FileApi';
import {RpcTransport} from './RpcTransport';
import {MultipartPiece, Piece, PieceResponse} from './Piece';

import {DagNode, DagNodeResponse} from './DagNode';

export type StorageNodeConfig = {
    rpcHost: string;
};

type NamingOptions = {
    name?: string;
};

export type PieceStoreOptions = NamingOptions & {};
export type DagNodeStoreOptions = NamingOptions & {};
export type PieceReadOptions = {
    range?: ReadFileRange;
};

export class StorageNode {
    private dagApi: DagApi;
    private fileApi: FileApi;
    private cnsApi: CnsApi;

    constructor({rpcHost}: StorageNodeConfig) {
        const transport = new RpcTransport(rpcHost);

        this.dagApi = new DagApi(transport);
        this.fileApi = new FileApi(transport);
        this.cnsApi = new CnsApi(transport);
    }

    async storePiece(piece: Piece | MultipartPiece, options?: PieceStoreOptions) {
        if (piece instanceof MultipartPiece) {
            return this.storeMultipartPiece(piece, options);
        }

        const cid = await this.fileApi.putRawPiece(
            {
                bucketId: piece.bucketId.toString(), // TODO: Inconsistent bucketId type,
                isMultipart: piece.isPart,
                offset: piece.offset,
            },
            piece.content,
        );

        if (options?.name) {
            /**
             * TODO: Not yet implemented API. Inconsistent CID type - figure out how to convert u8a CID to string and back
             */
            await this.assignName(piece.bucketId, cid.toString(), options.name);
        }

        return cid;
    }

    private async storeMultipartPiece(piece: MultipartPiece, options?: PieceStoreOptions) {
        return this.fileApi.putMultipartPiece({
            bucketId: piece.bucketId.toString(), // TODO: Inconsistent bucketId type,
            partHashes: piece.partHashes,
            partSize: piece.meta.partSize,
            totalSize: piece.meta.totalSize,
        });
    }

    async storeDagNode(node: DagNode, options?: DagNodeStoreOptions) {
        const cid = await this.dagApi.putNode({
            node: node,
            bucketId: Number(node.bucketId), // TODO: Inconsistent bucketId type
        });

        if (options?.name) {
            await this.assignName(node.bucketId, cid, options.name);
        }

        return cid;
    }

    async readPiece(bucketId: bigint, cid: Uint8Array, options?: PieceReadOptions) {
        const contentStream = this.fileApi.readPiece({
            cid, // TODO: Figure out how to use string CIDs
            bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
            range: options?.range,
        });

        return new PieceResponse(bucketId, cid, contentStream, {
            range: options?.range,
        });
    }

    async getDagNode(bucketId: bigint, cid: string) {
        const node = await this.dagApi.getNode({
            cid,
            bucketId: Number(bucketId), // TODO: Inconsistent bucketId type
        });

        return node && new DagNodeResponse(bucketId, cid, new Uint8Array(node.data), node.links, node.tags);
    }

    async assignName(bucketId: bigint, cid: string, name: string) {
        return this.cnsApi.assignName({
            cid,
            name,
            bucketId: Number(bucketId), // TODO: Inconsistent bucketId type
        });
    }

    async getCidByName(bucketId: bigint, cid: string, name: string) {
        return this.cnsApi.getCid({
            name,
            bucketId: Number(bucketId), // TODO: Inconsistent bucketId type
        });
    }
}
