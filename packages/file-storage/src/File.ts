import { Content, ContentStream, PieceResponse, createContentStream, isContentStream } from '@cere-ddc-sdk/ddc';

export type FileContent = Content;

type StreamMeta = {
  size: number;
};

type StaticContentMeta = {
  size?: number;
};

/**
 * Represents a file with content and metadata.
 *
 * @group Files
 */
export class File {
  /**
   * The content of the file as a stream.
   */
  readonly body: ContentStream;

  /**
   * The size of the file in bytes.
   */
  readonly size: number;

  /**
   * The metadata for the file.
   */
  readonly meta: StreamMeta | StaticContentMeta;

  constructor(content: FileContent, meta: StreamMeta);
  constructor(content: Uint8Array, meta?: StaticContentMeta);
  constructor(content: FileContent, meta: StreamMeta | StaticContentMeta = {}) {
    this.body = isContentStream(content) ? content : createContentStream(content);
    this.size = content instanceof Uint8Array ? content.byteLength : meta.size!;
    this.meta = meta;
  }

  /**
   * Checks if a given object is an instance of the `File` class.
   *
   * @param object - The object to check.
   *
   * @returns True if the object is a `File` instance, false otherwise.
   */
  static isFile(object: unknown): object is File {
    const maybeFile = object as File | null;

    if (object instanceof File) {
      return true;
    }

    return typeof maybeFile === 'object' && typeof maybeFile?.size === 'number' && !!maybeFile.body;
  }
}

/**
 * Represents a response from a file read operation.
 *
 * @group Files
 * @extends PieceResponse
 */
export class FileResponse extends PieceResponse {}
