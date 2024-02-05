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
 * @property body - The content of the file as a stream.
 * @property size - The size of the file in bytes.
 * @property meta - The metadata for the file.
 */
export class File {
  readonly body: ContentStream;
  readonly size: number;

  constructor(content: FileContent, meta: StreamMeta);
  constructor(content: Uint8Array, meta?: StaticContentMeta);
  constructor(
    content: FileContent,
    readonly meta: StreamMeta | StaticContentMeta = {},
  ) {
    this.body = isContentStream(content) ? content : createContentStream(content);
    this.size = content instanceof Uint8Array ? content.byteLength : meta.size!;
  }

  /**
   * Checks if a given object is an instance of the `File` class.
   *
   * @param object - The object to check.
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
 * @extends PieceResponse
 */
export class FileResponse extends PieceResponse {}
