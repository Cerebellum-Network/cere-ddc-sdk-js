import {ContentAddressableStorage, Piece, PieceUri, Session, Tag} from "@cere-ddc-sdk/content-addressable-storage";
import {GetFirstArgument, RequiredSelected} from '@cere-ddc-sdk/core';

const keyTag = "Key"

type CaCreateOptions = GetFirstArgument<typeof ContentAddressableStorage.build>;
type Options = RequiredSelected<Partial<CaCreateOptions>, 'clusterAddress'>;

export class KeyValueStorage {
    caStorage: ContentAddressableStorage;

    constructor(caStorage: ContentAddressableStorage) {
        this.caStorage = caStorage;
    }

    static async build(storageOptions: Options, secretPhrase: string): Promise<KeyValueStorage> {
        return new KeyValueStorage(await ContentAddressableStorage.build(storageOptions, secretPhrase))
    }

    disconnect(): Promise<void> {
        return this.caStorage.disconnect();
    }

    async store(bucketId: bigint, session: Session, key: Uint8Array | string, piece: Piece): Promise<PieceUri> {
        if (piece.tags.some(t => t.keyString == keyTag)) {
            throw Error("'Key' is a reserved tag for key-value storage")
        }

        piece.tags.push(new Tag(keyTag, key))

        return this.caStorage.store(bucketId, session, piece)
    }

    async read(bucketId: bigint, session: Session, key: Uint8Array | string, skipData: boolean = false): Promise<Piece[]> {
        const searchResult = await this.caStorage.search(
            {
                bucketId: bucketId,
                tags: Array.of(new Tag(keyTag, key)),
                skipData: skipData
            },
            session,
        )

        return searchResult.pieces.map(p => new Piece(
            p.data,
            p.tags.filter(t => t.keyString != keyTag)
        ))
    }
}
