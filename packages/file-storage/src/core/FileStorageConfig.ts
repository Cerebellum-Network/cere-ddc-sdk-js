export const KB = 1024
export const MB = 1024 * KB

export interface FileStorageConfig {
    readonly parallel: number;
    readonly pieceSizeInBytes: number;
}

export const DEFAULT_FILE_STORAGE_CONFIG: FileStorageConfig = {
    parallel:  4,
    pieceSizeInBytes:  5 * MB,
}