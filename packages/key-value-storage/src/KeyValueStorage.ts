import {ContentAddressableStorage, Piece, PieceUri, StorageOptions,} from "@cere-ddc-sdk/content-addressable-storage";

const keyTag = "Key"

export class KeyValueStorage {
    caStorage: ContentAddressableStorage;

    constructor(caStorage: ContentAddressableStorage) {
        this.caStorage = caStorage;
    }

    static async build(secretPhrase: string, storageOptions: StorageOptions): Promise<KeyValueStorage> {
        return new KeyValueStorage(await ContentAddressableStorage.build(secretPhrase, storageOptions))
    }

    async store(bucketId: bigint, key: string, piece: Piece): Promise<PieceUri> {
        if (piece.tags.some(t => t.key == keyTag)) {
            throw Error("'Key' is a reserved tag for key-value storage")
        }

        piece.tags.push({key: keyTag, value: key})

        return this.caStorage.store(bucketId, piece)
    }

    async read(bucketId: bigint, key: string, skipData: boolean = false): Promise<Piece[]> {
        const searchResult = await this.caStorage.search(
            {
                bucketId: bucketId,
                tags: Array.of({key: keyTag, value: key}),
                skipData: skipData
            }
        )

        return searchResult.pieces.map(p => new Piece(
            p.data,
            p.tags.filter(t => t.key != keyTag)
        ))
    }
}
