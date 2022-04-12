import {
    Piece as PbPiece,
    Query as PbQuery,
    SearchResult as PbSearchResult,
    SignedPiece as PbSignedPiece,
} from "@cere-ddc-sdk/proto";
import {CidBuilder} from "./cid/CidBuilder";
import {Piece} from "./models/Piece";
import {PieceUri} from "./models/PieceUri";
import {Query} from "./models/Query";
import {SearchResult} from "./models/SearchResult";
import {SchemeInterface} from "./crypto/Scheme.interface";
import {base58Encode} from "@polkadot/util-crypto";
import {stringToU8a} from "@polkadot/util";
import {fetch} from 'cross-fetch';

const BASE_PATH = "/api/rest/pieces";

export class ContentAddressableStorage {
    scheme: SchemeInterface;
    gatewayNodeUrl: string;

    cidBuilder: CidBuilder;

    constructor(
        scheme: SchemeInterface,
        gatewayNodeUrl: string,
        cidBuilder: CidBuilder = new CidBuilder()
    ) {
        this.scheme = scheme;
        this.gatewayNodeUrl = gatewayNodeUrl;
        this.cidBuilder = cidBuilder;
    }

    async store(bucketId: bigint, piece: Piece): Promise<PieceUri> {
        let pbPiece: PbPiece = {
            bucketId: bucketId.toString(),
            data: piece.data,
            tags: piece.tags,
            links: piece.links.map(e => {
                return {cid: e.cid, size: e.size.toString(), name: e.name}
            })
        };
        let pieceAsBytes = PbPiece.toBinary(pbPiece);
        let cid = this.cidBuilder.build(pieceAsBytes);
        let signature = await this.scheme.sign(stringToU8a(cid));

        let pbSignedPiece: PbSignedPiece = {
            piece: pbPiece,
            signature: {
                value: signature,
                scheme: this.scheme.name,
                signer: this.scheme.publicKeyHex,
            },
        };
        let response = await fetch(this.gatewayNodeUrl + BASE_PATH, {
            method: "PUT",
            body: PbSignedPiece.toBinary(pbSignedPiece),
        });

        if (201 != response.status) {
            throw Error(
                `Failed to store. Response: status='${response.status}' body='${response.body}'`
            );
        }

        return new PieceUri(bucketId, cid);
    }

    async read(bucketId: bigint, cid: string): Promise<Piece> {
        let response = await fetch(`${this.gatewayNodeUrl}${BASE_PATH}/${cid}?bucketId=${bucketId}`, {
            method: "GET",
        });

        if (200 != response.status) {
            throw Error(
                `Failed to read. Response: status='${response.status}' body='${response.body}'`
            );
        }

        let pbSignedPiece = PbSignedPiece.fromBinary(
            new Uint8Array(await response.arrayBuffer())
        );
        if (!pbSignedPiece.piece) {
            throw new Error(
                `Failed to parse signed piece. Response: status='${response.status}' body='${response.body}'`
            );
        }

        return this.toPiece(pbSignedPiece.piece);
    }

    async search(query: Query): Promise<SearchResult> {
        let pbQuery: PbQuery = {
            bucketId: query.bucketId.toString(),
            tags: query.tags,
        }
        let queryAsBytes = PbQuery.toBinary(pbQuery)
        let queryBase58 = base58Encode(queryAsBytes)

        let response = await fetch(this.gatewayNodeUrl + BASE_PATH + "?query=" + queryBase58, {
            method: "GET",
        });

        if (200 != response.status) {
            throw Error(
                `Failed to search. Response: status='${response.status}' body='${response.body}'`
            );
        }

        let pbSearchResult = PbSearchResult.fromBinary(
            new Uint8Array(await response.arrayBuffer())
        );

        const isPiece = (val: PbPiece | undefined): val is PbPiece => val !== null;
        let pieces: Piece[] = pbSearchResult.signedPieces
            .map((p: PbSignedPiece) => p.piece)
            .filter(isPiece)
            .map(this.toPiece)

        return new SearchResult(pieces);
    }

    private toPiece(piece: PbPiece): Piece {
        return new Piece(piece.data, piece.tags, piece.links.map(e => {
            return {cid: e.cid, size: BigInt(e.size), name: e.name}
        }))

    }
}
