import {PieceContent, PieceContentStream, PieceResponse, createStream} from '@cere-ddc-sdk/ddc';

export type FileContent = PieceContent;
export type FileMeta = {
    size?: bigint;
};

export class File {
    readonly body: PieceContentStream;

    constructor(readonly content: FileContent, readonly meta?: FileMeta) {
        this.body = createStream(content);
    }
}

export class FileResponse extends PieceResponse {}
