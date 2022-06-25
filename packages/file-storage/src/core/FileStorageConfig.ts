export const KB = 1024
export const MB = 1024 * KB

export class FileStorageConfig {
    readonly parallel: number;
    readonly pieceSizeInBytes: number;

    constructor(parallel: number = 4, chunkSizeInBytes: number = 5 * MB) {
        this.parallel = parallel;
        this.pieceSizeInBytes = chunkSizeInBytes;
    }
}