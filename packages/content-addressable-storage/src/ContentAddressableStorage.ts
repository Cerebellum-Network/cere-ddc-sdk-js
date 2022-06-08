import {
    Piece as PbPiece,
    Query as PbQuery,
    SearchResult as PbSearchResult,
    SignedPiece as PbSignedPiece,
    SearchedPiece as PbSearchedPiece,
} from "@cere-ddc-sdk/proto";
import {Piece} from "./models/Piece";
import {PieceUri} from "./models/PieceUri";
import {Query} from "./models/Query";
import {SearchResult} from "./models/SearchResult";
import {CidBuilder, CipherInterface, SchemeInterface} from "@cere-ddc-sdk/core";
import {base58Encode} from "@polkadot/util-crypto";
import {stringToU8a} from "@polkadot/util";
import {fetch} from 'cross-fetch';
import {Tag} from "./models/Tag";
import {EncryptionOptions} from "@cere-ddc-sdk/core/src/crypto/encryption/EncryptionOptions";

const BASE_PATH = "/api/rest/pieces";

export class ContentAddressableStorage {
    readonly scheme: SchemeInterface;
    readonly cdnNodeUrl: string;

    readonly cipher?: CipherInterface;
    readonly cidBuilder: CidBuilder;

    constructor(
        scheme: SchemeInterface,
        cdnNodeUrl: string,
        cipher?: CipherInterface,
        cidBuilder: CidBuilder = new CidBuilder()
    ) {
        this.scheme = scheme;
        this.cdnNodeUrl = cdnNodeUrl;
        this.cidBuilder = cidBuilder;
        this.cipher = cipher;
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
        let response = await fetch(this.cdnNodeUrl + BASE_PATH, {
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
        let response = await fetch(`${this.cdnNodeUrl}${BASE_PATH}/${cid}?bucketId=${bucketId}`, {
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

        return this.toPiece(pbSignedPiece.piece, cid);
    }

    async search(query: Query): Promise<SearchResult> {
        //ToDo add piece CID to result
        let pbQuery: PbQuery = {
            bucketId: query.bucketId.toString(),
            tags: query.tags,
            skipData: query.skipData
        }
        let queryAsBytes = PbQuery.toBinary(pbQuery)
        let queryBase58 = base58Encode(queryAsBytes)

        let response = await fetch(this.cdnNodeUrl + BASE_PATH + "?query=" + queryBase58, {
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
        let pieces: Piece[] = pbSearchResult.searchedPieces
            .filter(p => isPiece(p.signedPiece?.piece))
            .map(e => this.toPiece(e.signedPiece!.piece!, e.cid))

        return new SearchResult(pieces);
    }

    async storeEncrypted(bucketId: bigint, piece: Piece, encryptionOptions: EncryptionOptions): Promise<PieceUri> {
        const encryptedPiece = piece.clone();
        encryptedPiece.tags.push(new Tag("encrypted", "true"));
        encryptedPiece.tags.push(new Tag("dekPath", encryptionOptions.dekPath));
        encryptedPiece.data = this.cipher!.encrypt(piece.data, encryptionOptions.dek);
        return this.store(bucketId, encryptedPiece)
    }

    async readDecrypted(bucketId: bigint, cid: string, dek: Uint8Array): Promise<Piece> {
        const piece = await this.read(bucketId, cid);
        piece.data = this.cipher!.decrypt(piece.data, dek)

        return piece;
    }

    private toPiece(piece: PbPiece, cid: string): Piece {
        return new Piece(piece.data, piece.tags, piece.links.map(e => {
            return {cid: e.cid, size: BigInt(e.size), name: e.name}
        }), cid)
    }
}
