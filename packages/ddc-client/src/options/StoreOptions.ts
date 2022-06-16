export class StoreOptions {
    // dekPath - Used to calculate DEK (bucketId + dekPath + client public key). Empty if not passed.
    dekPath?: string;

    // encrypt - If not passed, check 'cipher' parameter (encrypt if cipher configured)
    encrypt?: boolean;
}