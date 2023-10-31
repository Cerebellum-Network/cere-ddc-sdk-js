import {arrayBuffer, text, json} from 'stream/consumers';

import {PieceContent, PieceContentStream, ReadFileRange} from './FileApi';
import {Cid} from './Cid';

export type PieceMeta = {
    multipartOffset?: bigint;
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
    readonly content: PieceContent;

    constructor(content: PieceContent | Uint8Array, readonly meta?: PieceMeta) {
        this.content = content instanceof Uint8Array ? [content] : content; // TODO: find a better way to use direct Uint8Array input
        this.offset = meta?.multipartOffset;
    }

    get isPart() {
        return this.offset !== undefined;
    }
}

export class MultipartPiece {
    readonly partHashes: Uint8Array[];

    constructor(readonly parts: string[], readonly meta: MultipartPieceMeta) {
        this.partHashes = parts.map((part) => new Cid(part).contentHash);
    }
}

export class PieceResponse {
    constructor(protected cidObject: Cid, readonly body: PieceContentStream, protected meta?: PieceResponseMeta) {}

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
