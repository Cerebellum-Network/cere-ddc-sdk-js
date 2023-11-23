import { arrayBuffer, text, json } from 'stream/consumers';
import { Content, ContentStream, createContentStream } from './streams';

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
    content: Content,
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
    if (this.contentLength) {
      throw new Error('The piece size can not be determined');
    }

    return this.contentLength;
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
    return arrayBuffer(this.body);
  }

  async text() {
    return text(this.body);
  }

  async json() {
    return json(this.body);
  }
}
