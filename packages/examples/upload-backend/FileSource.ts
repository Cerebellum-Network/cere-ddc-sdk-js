import * as streamWeb from "stream/web";
import {open, FileHandle} from 'node:fs/promises';
import {PathLike} from "node:fs";
import { FileStorage } from "packages/file-storage/src/node";
import { PieceUri } from "packages/content-addressable-storage/src";

class FileSource implements streamWeb.UnderlyingByteSource {

    private file!: FileHandle;
    private readonly filePath: PathLike;
    readonly type = "bytes";

    constructor(filePath: PathLike) {
        this.filePath = filePath;
    }

    async start(controller: streamWeb.ReadableByteStreamController) {
        this.file = await open(this.filePath, "r");
    }

    async pull(controller: streamWeb.ReadableByteStreamController) {
        const {bytesRead, buffer} = await this.file.read();

        if (bytesRead === 0) {
            await this.file.close();
            controller.close();
        }

        controller.enqueue(buffer.slice(buffer.byteOffset, bytesRead))
    }

    async cancel() {
        await this.file.close()
    }
}

// TODO
const buildEncryptingStream = (privKey: string, instream: streamWeb.ReadableStream<Uint8Array>): streamWeb.ReadableStream<Uint8Array> =>
    // TODO add a stream that pipes in from instream and 
    // encrypts on the fly
    instream;

// Simple file stream
const getFileStream = (fileName: string): streamWeb.ReadableStream<Uint8Array> => 
    new streamWeb.ReadableStream(new FileSource(fileName));

// Utility function to compose fiel stream and encrypting stream
const getEncryptingFileStream = (encKey: string) =>
    (fileName: string): streamWeb.ReadableStream<Uint8Array> => {
        const instream = getFileStream(fileName);
        const encryptingStream = buildEncryptingStream(encKey, instream);
        return encryptingStream;
    }

const TBD = "TODO";

export const FileApi = (gatewayUrl: string, schemeName: string) => {
    const fileStorage = new FileStorage(schemeName, gatewayUrl);

    const upload =  (bucketId: bigint) => (fileName: string) => 
        fileStorage.upload(bucketId, getFileStream(fileName));

    const encryptNupload =  (encKey: string) => (bucketId: bigint) => (fileName: string) => 
        fileStorage.upload(bucketId, 
            getEncryptingFileStream(encKey)(fileName)
        );

    // TODO
    const download = () => TBD;

    // TODO
    const addTags = (cid: PieceUri, tag: string[]) => TBD;

    return {
        upload, encryptNupload,
        download, addTags
    }
};

