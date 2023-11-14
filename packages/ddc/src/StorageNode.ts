import {Cid} from './Cid';
import {CnsApi} from './CnsApi';
import {DagApi} from './DagApi';
import {FileApi, ReadFileRange} from './FileApi';
import {MultipartPiece, Piece, PieceResponse} from './Piece';
import {DagNode, DagNodeResponse, mapDagNodeToAPI} from './DagNode';
import {Signer} from './Signer';
import {CnsRecord, CnsRecordResponse, mapCnsRecordToAPI} from './CnsRecord';
import {DefaultTranport, RpcTransportOptions} from './transports';

type NamingOptions = {
    name?: string;
};

export type StorageNodeConfig = RpcTransportOptions;
export type PieceReadOptions = {
    range?: ReadFileRange;
};

export type PieceStoreOptions = NamingOptions;
export type DagNodeStoreOptions = NamingOptions;

export class StorageNode {
    private dagApi: DagApi;
    private fileApi: FileApi;
    private cnsApi: CnsApi;

    constructor(private signer: Signer, config: StorageNodeConfig) {
        const transport = new DefaultTranport(config);

        this.signer = signer;
        this.dagApi = new DagApi(transport);
        this.fileApi = new FileApi(transport);
        this.cnsApi = new CnsApi(transport);
    }

    async storePiece(bucketId: number, piece: Piece | MultipartPiece, options?: PieceStoreOptions) {
        let cidBytes: Uint8Array;

        if (piece instanceof MultipartPiece) {
            cidBytes = await this.fileApi.putMultipartPiece({
                bucketId,
                partHashes: piece.partHashes,
                partSize: piece.meta.partSize,
                totalSize: piece.meta.totalSize,
            });
        } else {
            cidBytes = await this.fileApi.putRawPiece(
                {
                    bucketId,
                    isMultipart: piece.isPart,
                    offset: piece.offset,
                },
                piece.body,
            );
        }

        const cid = new Cid(cidBytes).toString();

        if (options?.name) {
            await this.storeCnsRecord(bucketId, new CnsRecord(cid, options.name));
        }

        return cid;
    }

    async storeDagNode(bucketId: number, node: DagNode, options?: DagNodeStoreOptions) {
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

    async readPiece(bucketId: number, cidOrName: string, options?: PieceReadOptions) {
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

    async getDagNode(bucketId: number, cidOrName: string) {
        const cid = await this.resolveName(bucketId, cidOrName);
        const node = await this.dagApi.getNode({
            bucketId,
            cid: cid.toBytes(),
        });

        return node && new DagNodeResponse(cid, new Uint8Array(node.data), node.links, node.tags);
    }

    async storeCnsRecord(bucketId: number, record: CnsRecord) {
        if (!record.signature && this.signer) {
            await this.signer.isReady();

            record.sign(this.signer);
        }

        return this.cnsApi.putRecord({
            bucketId,
            record: mapCnsRecordToAPI(record),
        });
    }

    async getCnsRecord(bucketId: number, name: string) {
        const record = await this.cnsApi.getRecord({bucketId, name});

        return record && new CnsRecordResponse(record.cid, record.name, record.signature);
    }

    async resolveName(bucketId: number, cidOrName: string) {
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
