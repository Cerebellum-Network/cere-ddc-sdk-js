import {Tag} from "@cere-ddc-sdk/content-addressable-storage";

type Data = ReadableStream<Uint8Array> | string | Uint8Array

export class File {
    data: Data;
    tags: Array<Tag>;
    cid?: string;

    constructor(data: Data, tags: Array<Tag> = new Array<Tag>(), cid?: string) {
        this.data = data;
        this.tags = tags;
        this.cid = cid;
    }

    static isFile(obj: any): obj is File {
        return obj instanceof File || (obj instanceof Object && obj.data && obj.tags instanceof Array && typeof obj.dataReader === "function");
    }

    async* dataReader() {
        if (this.data === null || typeof this.data === "string") {
            return;
        }

        if (this.data instanceof Uint8Array) {
            yield this.data;
        } else {
            const stream = this.data as ReadableStream<Uint8Array>;
            const reader = stream.getReader();

            let result
            while (!(result = await reader.read()).done) {
                yield result.value;
            }
        }
    }
}