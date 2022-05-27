export class ReadOptions {
    // dekPath - Used to get a DEK (bucketId + dekPath + client public key). Empty if not passed.
    dekPath?: string;
    // decrypt - If not passed, check 'cipher' parameter (decrypt if cipher configured)
    decrypt?: boolean;
}
