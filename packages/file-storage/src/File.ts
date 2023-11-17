import { Content, ContentStream, PieceResponse, createContentStream } from '@cere-ddc-sdk/ddc';

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
  constructor(content: FileContent, readonly meta: StreamMeta | StaticContentMeta = {}) {
    this.body = createContentStream(content);
    this.size = content instanceof Uint8Array ? content.byteLength : meta.size!;
  }
}

export class FileResponse extends PieceResponse {}
