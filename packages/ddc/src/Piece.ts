import { arrayBuffer, text, json } from 'stream/consumers';
import { Content, ContentStream, createContentStream } from './streams';

import { ReadFileRange } from './FileApi';
import { Cid } from './Cid';

export type PieceMeta = {
  multipartOffset?: number;
};

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

  constructor(
    content: Content | Uint8Array,
    readonly meta?: PieceMeta,
  ) {
    this.offset = meta?.multipartOffset;
    this.body = createContentStream(content);
  }

  get isPart() {
    return this.offset !== undefined;
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
