import {ReadableStream} from 'stream/web';
import {arrayBuffer, text, json} from 'stream/consumers';

import {PieceContent, ReadFileRange} from './FileApi';
import {Cid} from './Cid';

export type PieceMeta = {
    multipartOffset?: bigint;
    size?: bigint;
};

export type MultipartPieceMeta = {
    partSize: bigint;
    totalSize: bigint;
};

export type PieceResponseMeta = {
    range?: ReadFileRange;
};

export class Piece {
    public offset?: bigint;
    readonly size?: bigint;
    readonly content: PieceContent;

    constructor(readonly bucketId: bigint, content: PieceContent | Uint8Array, readonly meta?: PieceMeta) {
        this.content = content instanceof Uint8Array ? [content] : content; // TODO: find a better way to use direct Uint8Array input
        this.offset = meta?.multipartOffset;
        this.size = meta?.size;
    }

    get isPart() {
        return this.offset !== undefined;
    }
}

export class MultipartPiece {
    readonly partHashes: Uint8Array[];

    constructor(readonly bucketId: bigint, readonly parts: string[], readonly meta: MultipartPieceMeta) {
        this.partHashes = parts.map((part) => new Cid(part).contentHash);
    }
}

export class PieceResponse {
    constructor(
        readonly bucketId: bigint,
        protected cidObject: Cid,
        readonly body: ReadableStream<Uint8Array>,
        protected meta?: PieceResponseMeta,
    ) {}

    get range() {
        return this.meta?.range;
    }

    get hash() {
        return this.cidObject.contentHash;
    }

    get cid() {
        return this.cidObject.toString();
    }

    async arrayBuffer() {
        return arrayBuffer(this.body);
    }

    async text() {
        return text(this.body);
    }

    async json() {
        return json(this.body);
    }
}
