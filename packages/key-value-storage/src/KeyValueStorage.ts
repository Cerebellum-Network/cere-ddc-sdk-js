import {RequiredSelected} from '@cere-ddc-sdk/core';
import {
    ContentAddressableStorage,
    ContentAddressableStorageOptions,
    Piece,
    PieceUri,
    Tag,
    StoreOptions,
    SearchOptions as CASearchOptions,
} from '@cere-ddc-sdk/content-addressable-storage';

const keyTag = 'Key';

type Options = RequiredSelected<Partial<ContentAddressableStorageOptions>, 'clusterAddress'>;
type ReadOptions = CASearchOptions & {
    skipData?: boolean;
};

export class KeyValueStorage {
    caStorage: ContentAddressableStorage;

    constructor(caStorage: ContentAddressableStorage) {
        this.caStorage = caStorage;
    }

    static async build(storageOptions: Options, secretPhrase: string): Promise<KeyValueStorage> {
        return new KeyValueStorage(await ContentAddressableStorage.build(storageOptions, secretPhrase));
    }

    disconnect(): Promise<void> {
        return this.caStorage.disconnect();
    }

    async store(
        bucketId: bigint,
        key: Uint8Array | string,
        piece: Piece,
        storeOptions: StoreOptions = {},
    ): Promise<PieceUri> {
        if (piece.tags.some((tag) => tag.keyString == keyTag)) {
            throw Error("'Key' is a reserved tag for key-value storage");
        }

        piece.tags.push(new Tag(keyTag, key));

        return this.caStorage.store(bucketId, piece, storeOptions);
    }

    async read(
        bucketId: bigint,
        key: Uint8Array | string,
        {skipData = false, ...options}: ReadOptions = {},
    ): Promise<Piece[]> {
        const tags = [new Tag(keyTag, key)];
        const searchResult = await this.caStorage.search({bucketId, skipData, tags}, options);

        return searchResult.pieces.map(
            (piece) =>
                new Piece(
                    piece.data,
                    piece.tags.filter((tag) => tag.keyString != keyTag),
                ),
        );
    }
}
