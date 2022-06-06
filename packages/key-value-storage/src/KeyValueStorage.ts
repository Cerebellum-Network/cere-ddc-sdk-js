import {
    ContentAddressableStorage,
    Piece,
    PieceUri,
} from "@cere-ddc-sdk/content-addressable-storage";
import {SchemeInterface} from "@cere-ddc-sdk/core";

const keyTag = "Key"

export class KeyValueStorage {
    scheme: SchemeInterface;
    cdnNodeUrl: string;

    caStorage: ContentAddressableStorage;

    constructor(
        scheme: SchemeInterface,
        cdnNodeUrl: string,
    ) {
        this.scheme = scheme;
        this.cdnNodeUrl = cdnNodeUrl;

        this.caStorage = new ContentAddressableStorage(scheme, cdnNodeUrl)
    }

    async store(bucketId: bigint, key: string, piece: Piece): Promise<PieceUri> {
        if (piece.tags.some(t => t.key == keyTag)) {
            throw Error("'Key' is a reserved tag for key-value storage")
        }

        piece.tags.push({key: keyTag, value: key})

        return this.caStorage.store(bucketId, piece)
    }

    async read(bucketId: bigint, key: string, loadData: boolean = true): Promise<Piece[]> {
        const searchResult = await this.caStorage.search(
            {
                bucketId: bucketId,
                tags: Array.of({key: keyTag, value: key}),
                loadData: loadData
            }
        )

        return searchResult.pieces.map(p => new Piece(
            p.data,
            p.tags.filter(t => t.key != keyTag)
        ))
    }
}
