import {ContentAddressableStorage, Piece, PieceUri, StorageOptions, Tag} from "@cere-ddc-sdk/content-addressable-storage";

const keyTag = "Key"

export class KeyValueStorage {
    caStorage: ContentAddressableStorage;

    constructor(caStorage: ContentAddressableStorage) {
        this.caStorage = caStorage;
    }

    static async build(storageOptions: StorageOptions, secretPhrase?: string): Promise<KeyValueStorage> {
        return new KeyValueStorage(await ContentAddressableStorage.build(storageOptions, secretPhrase))
    }

    async store(bucketId: bigint, key: Uint8Array | string, piece: Piece, session: Uint8Array): Promise<PieceUri> {
        if (piece.tags.some(t => t.keyString == keyTag)) {
            throw Error("'Key' is a reserved tag for key-value storage")
        }

        piece.tags.push(new Tag(keyTag, key))

        return this.caStorage.store(bucketId, piece, session)
    }

    async read(bucketId: bigint, key: Uint8Array | string, skipData: boolean = false): Promise<Piece[]> {
        const searchResult = await this.caStorage.search(
            {
                bucketId: bucketId,
                tags: Array.of(new Tag(keyTag, key)),
                skipData: skipData
            }
        )

        return searchResult.pieces.map(p => new Piece(
            p.data,
            p.tags.filter(t => t.keyString != keyTag)
        ))
    }
}
