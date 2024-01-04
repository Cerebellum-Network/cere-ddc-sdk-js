import { consumers, Content, ContentStream, createContentStream, StreamValidator } from './streams';

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
  protected validator: StreamValidator;
  protected validatePromise?: Promise<boolean>;

  readonly body: ContentStream;

  constructor(
    cid: string | Uint8Array | Cid,
    body: ContentStream,
    protected meta?: PieceResponseMeta,
  ) {
    this.cidObject = cid instanceof Cid ? cid : new Cid(cid);
    this.validator = new StreamValidator();
    this.body = body.pipeThrough(this.validator);
  }

  get range() {
    return this.meta?.range;
  }

  get hash() {
    return this.cidObject.contentHash;
  }

  async isValid() {
    return this.validate()
      .then(() => true)
      .catch(() => false);
  }

  get cid() {
    return this.cidObject.toString();
  }

  async arrayBuffer() {
    const buffer = await consumers.arrayBuffer(this.body);

    return this.validate().then(() => buffer);
  }

  async text() {
    const text = await consumers.text(this.body);

    return this.validate().then(() => text);
  }

  async json() {
    const json = await consumers.json(this.body);

    return this.validate().then(() => json);
  }

  private async validate() {
    /**
     * Piece validation is not supported for ranged reads
     *
     * TODO: Implement piece validation for ranged reads
     */
    if (this.meta?.range) {
      return;
    }

    if (!this.validatePromise) {
      this.validatePromise = this.validator.validate(this.cidObject.contentHash);
    }

    if (!(await this.validatePromise)) {
      throw new Error('Received piece is not valid - the content hash does not match');
    }
  }
}
