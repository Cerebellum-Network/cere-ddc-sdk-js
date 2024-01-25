import { consumers, Content, ContentStream, createContentStream, isContentStream, getContentSize } from './streams';

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

/**
 * The `Piece` class represents a piece of content.
 *
 * @property offset - The offset of the piece in a multipart upload.
 * @property body - The body of the piece as a content stream.
 * @property meta - The metadata of the piece.
 * @property isPart - Checks if the piece is part of a multipart upload.
 * @property size - The size of the piece.
 *
 * @example
 *
 * ```typescript
 * const content = new Uint8Array([1, 2, 3]);
 * const piece = new Piece(content, { size: 3 });
 *
 * console.log(Piece.isPiece(piece)); // true
 * ```
 */
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
    this.body = isContentStream(content) ? content : createContentStream(content);
    this.contentLength = getContentSize(content, meta.size);
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

  /**
   * Checks if an object is an instance of `Piece`.
   *
   * @param object - The object to check.
   *
   * @returns `true` if the object is an instance of `Piece` or has the same properties as a `Piece`, `false` otherwise.
   */
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

  /**
   * Checks if an object is an instance of `Piece` with static content.
   *
   * @param object - The object to check.
   *
   * @returns `true` if the object is an instance of `Piece` and its content is a `Uint8Array`, `false` otherwise.
   */
  static isStaticPiece(object: unknown): object is Piece {
    return Piece.isPiece(object) && object.content instanceof Uint8Array;
  }

  /**
   * Creates a new `Piece` from an existing one.
   *
   * @param piece - The existing `Piece` to create a new one from.
   *
   * @returns A new `Piece` with the same content and metadata as the existing one.
   */
  static from(piece: Piece) {
    return new Piece(piece.content, piece.meta as StreamPieceMeta);
  }
}

/**
 * The `MultipartPiece` class represents a piece cobined from multiple parts (raw pieces).
 *
 * @property parts - The parts of the multipart piece.
 * @property meta - The metadata of the multipart piece.
 * @property partHashes - The hashes of the parts of the multipart piece.
 *
 * @example
 *
 * ```typescript
 * const parts = ['CID1', 'CID2'];
 * const multipartPiece = new MultipartPiece(parts, {
 *  partSize: 1024,
 *  totalSize: 2048,
 * });
 *
 * console.log(MultipartPiece.isMultipartPiece(multipartPiece)); // true
 * ```
 */
export class MultipartPiece {
  readonly partHashes: Uint8Array[];

  constructor(
    readonly parts: string[],
    readonly meta: MultipartPieceMeta,
  ) {
    this.partHashes = parts.map((part) => new Cid(part).contentHash);
  }

  /**
   * Checks if an object is an instance of `MultipartPiece`.
   *
   * @param object - The object to check.
   *
   * @returns `true` if the object is an instance of `MultipartPiece` or has the same properties as a `MultipartPiece`, `false` otherwise.
   */
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

/**
 * The `PieceResponse` class represents a response for a piece content.
 *
 * @property body - The body of the piece as a stream.
 * @property range - The range of the piece response.
 * @property hash - The hash of the piece.
 * @property cid - The CID of the piece.
 */
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

  /**
   * Converts the body stream of the piece to an `ArrayBuffer`.
   *
   * @returns The piece content as an `ArrayBuffer`.
   */
  async arrayBuffer() {
    return consumers.arrayBuffer(this.body);
  }

  /**
   * Converts the body stream of the piece to a string.
   *
   * @returns The piece content as a string.
   */
  async text() {
    return consumers.text(this.body);
  }

  /**
   * Converts the body stream of the piece to a JSON object.
   *
   * @returns The piece content as a JSON object.
   */
  async json() {
    return consumers.json(this.body);
  }
}
