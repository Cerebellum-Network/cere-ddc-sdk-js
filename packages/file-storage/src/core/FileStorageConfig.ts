export const KB = 1024;
export const MB = 1024 * KB;

export class FileStorageConfig {
    constructor(public readonly parallel: number = 4, public readonly pieceSizeInBytes: number = 5 * MB) {}
}
