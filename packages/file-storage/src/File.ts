import { Content, ContentStream, PieceResponse, createContentStream, isContentStream } from '@cere-ddc-sdk/ddc';

export type FileContent = Content;

type StreamMeta = {
  size: number;
};

type StaticContentMeta = {
  size?: number;
};

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

  static isFile(object: unknown): object is File {
    const maybeFile = object as File | null;

    if (object instanceof File) {
      return true;
    }

    return typeof maybeFile === 'object' && typeof maybeFile?.size === 'number' && !!maybeFile.body;
  }
}

export class FileResponse extends PieceResponse {}
