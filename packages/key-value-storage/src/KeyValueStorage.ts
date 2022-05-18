import {
    ContentAddressableStorage,
    Piece,
    PieceUri,
} from "@cere-ddc-sdk/content-addressable-storage";
import {SchemeInterface} from "@cere-ddc-sdk/core";

const keyTag = "Key"

export class KeyValueStorage {
    scheme: SchemeInterface;
    gatewayNodeUrl: string;

    caStorage: ContentAddressableStorage;

    constructor(
        scheme: SchemeInterface,
        gatewayNodeUrl: string,
    ) {
        this.scheme = scheme;
        this.gatewayNodeUrl = gatewayNodeUrl;

        this.caStorage = new ContentAddressableStorage(scheme, gatewayNodeUrl)
    }

    async store(bucketId: bigint, key: string, piece: Piece): Promise<PieceUri> {
        if (piece.tags.some(t => t.key == keyTag)) {
            throw Error("'Key' is a reserved tag for key-value storage")
        }

        piece.tags.push({key: keyTag, value: key})

        return this.caStorage.store(bucketId, piece)
    }

    async read(bucketId: bigint, key: string): Promise<Piece[]> {
        const searchResult = await this.caStorage.search(
            {
                bucketId: bucketId,
                tags: Array.of({key: keyTag, value: key})
            }
        )

        return searchResult.pieces.map(p => ({
            data: p.data,
            tags: p.tags.filter(t => t.key != keyTag),
            links: p.links
        }))
    }
}
