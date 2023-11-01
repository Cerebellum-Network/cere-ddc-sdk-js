import {Content, ContentStream, PieceResponse, createContentStream} from '@cere-ddc-sdk/ddc';

export type FileContent = Content;
export type FileMeta = {
    size?: bigint;
};

export class File {
    readonly body: ContentStream;

    constructor(readonly content: FileContent, readonly meta?: FileMeta) {
        this.body = createContentStream(content);
    }

    get size() {
        return this.meta?.size;
    }
}

export class FileResponse extends PieceResponse {}
