import {
    ContentAddressableStorage,
    SchemeInterface,
    Piece,
    PieceUri,
} from "@cere-ddc-sdk/content-addressable-storage";

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

    async read(bucketId: bigint, cid: string): Promise<Piece[]> {
        const searchResult = await this.caStorage.search(
            {
                bucketId: bucketId,
                tags: Array.of({key: keyTag, value: cid})
            }
        )

        return searchResult.pieces.map(p => ({
            data: p.data,
            tags: p.tags.filter(t => t.key != keyTag),
            links: p.links
        }))
    }
}
