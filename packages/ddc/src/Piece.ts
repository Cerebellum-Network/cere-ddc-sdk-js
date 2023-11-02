import {arrayBuffer, text, json} from 'stream/consumers';

import {ByteCounterStream, Content, ContentStream, createContentStream} from './streams';
import {ReadFileRange} from './FileApi';
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
    private byteCounter: ByteCounterStream;

    public offset?: bigint;
    readonly body: ContentStream;

    constructor(content: Content | Uint8Array, readonly meta?: PieceMeta) {
        const body = content instanceof Uint8Array ? [content] : content;

        this.offset = meta?.multipartOffset;
        this.byteCounter = new ByteCounterStream();
        this.body = createContentStream(body).pipeThrough(this.byteCounter);
    }

    get size() {
        return this.byteCounter.processedBytes;
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
    protected cidObject: Cid;

    constructor(cid: string | Uint8Array, readonly body: ContentStream, protected meta?: PieceResponseMeta) {
        this.cidObject = new Cid(cid);
    }

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
