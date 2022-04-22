import {PieceUri} from "@cere-ddc-sdk/content-addressable-storage";
import {ReadableStream} from "./stream"

export interface FileStorageInterface {
    upload(bucketId: bigint, stream: ReadableStream<Uint8Array>): Promise<PieceUri>;

    read(bucketId: bigint, cid: string): ReadableStream<Uint8Array>;
}