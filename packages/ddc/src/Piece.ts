import { consumers, Content, ContentStream, createContentStream } from './streams';

import { ReadFileRange } from './FileApi';
import { Cid } from './Cid';

type StaticPieceMeta = {
  multipartOffset?: number;
  size?: number;
};

type StreamPieceMeta = {
  multipartOffset?: number;
  size: number;
};

export type PieceMeta = StaticPieceMeta;
export type MultipartPieceMeta = {
  partSize: number;
  totalSize: number;
};

export type PieceResponseMeta = {
  range?: ReadFileRange;
};

export class Piece {
  public offset?: number;
  readonly body: ContentStream;
  private contentLength?: number;

  constructor(content: Content, meta: StreamPieceMeta);
  constructor(content: Uint8Array, meta?: StaticPieceMeta);
  constructor(
    protected content: Content,
    readonly meta: PieceMeta = {},
  ) {
    this.offset = meta.multipartOffset;
    this.body = createContentStream(content);
    this.contentLength = content instanceof Uint8Array ? content.byteLength : meta.size;
  }

  get isPart() {
    return this.offset !== undefined;
  }

  get size() {
    if (!this.contentLength) {
      throw new Error('The piece size can not be determined');
    }

    return this.contentLength;
  }

  static isPiece(object: unknown): object is Piece {
    const maybePiece = object as Piece | null;

    if (object instanceof Piece) {
      return true;
    }

    return (
      typeof maybePiece === 'object' &&
      typeof maybePiece?.meta === 'object' &&
      typeof maybePiece.isPart === 'boolean' &&
      !!maybePiece.body
    );
  }

  static isStaticPiece(object: unknown): object is Piece {
    return Piece.isPiece(object) && object.content instanceof Uint8Array;
  }

  static from(piece: Piece) {
    return new Piece(piece.content, piece.meta as StreamPieceMeta);
  }
}

export class MultipartPiece {
  readonly partHashes: Uint8Array[];

  constructor(
    readonly parts: string[],
    readonly meta: MultipartPieceMeta,
  ) {
    this.partHashes = parts.map((part) => new Cid(part).contentHash);
  }

  static isMultipartPiece(object: unknown): object is MultipartPiece {
    const maybeMultipartPiece = object as MultipartPiece | null;

    if (object instanceof MultipartPiece) {
      return true;
    }

    return (
      typeof maybeMultipartPiece === 'object' &&
      typeof maybeMultipartPiece?.meta === 'object' &&
      typeof maybeMultipartPiece.meta.partSize === 'number' &&
      typeof maybeMultipartPiece.meta.totalSize === 'number' &&
      Array.isArray(maybeMultipartPiece.parts) &&
      Array.isArray(maybeMultipartPiece.partHashes)
    );
  }
}

export class PieceResponse {
  protected cidObject: Cid;

  constructor(
    cid: string | Uint8Array | Cid,
    readonly body: ContentStream,
    protected meta?: PieceResponseMeta,
  ) {
    this.cidObject = cid instanceof Cid ? cid : new Cid(cid);
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
    return consumers.arrayBuffer(this.body);
  }

  async text() {
    return consumers.text(this.body);
  }

  async json() {
    return consumers.json(this.body);
  }
}
