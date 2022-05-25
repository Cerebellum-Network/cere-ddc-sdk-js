import {
    Piece as PbPiece,
    Query as PbQuery,
    SearchResult as PbSearchResult,
    SignedPiece as PbSignedPiece,
} from "@cere-ddc-sdk/proto";
import {Piece} from "./models/Piece";
import {PieceUri} from "./models/PieceUri";
import {Query} from "./models/Query";
import {SearchResult} from "./models/SearchResult";
import {CidBuilder, SchemeInterface} from "@cere-ddc-sdk/core";
import {base58Encode} from "@polkadot/util-crypto";
import {stringToU8a} from "@polkadot/util";
import {fetch} from 'cross-fetch';

const BASE_PATH = "/api/rest/pieces";
const decoder = new TextDecoder();
const decodeResponseBody = async (response: Response) => decoder.decode(await response.arrayBuffer());

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
        const pbPiece: PbPiece = {
            bucketId: bucketId.toString(),
            data: piece.data,
            tags: piece.tags,
            links: piece.links.map(e => {
                return {cid: e.cid, size: e.size.toString(), name: e.name}
            })
        };
        const pieceAsBytes = PbPiece.toBinary(pbPiece);
        const cid = this.cidBuilder.build(pieceAsBytes);
        const signature = await this.scheme.sign(stringToU8a(cid));

        const pbSignedPiece: PbSignedPiece = {
            piece: pbPiece,
            signature: {
                value: signature,
                scheme: this.scheme.name,
                signer: this.scheme.publicKeyHex,
            },
        };

        const response = await this.sendRequest(BASE_PATH, {
            method: "PUT",
            body: PbSignedPiece.toBinary(pbSignedPiece),
        });

        if (201 != response.status) {
            throw Error(`Failed to store. Response: status='${response.status}' body=${await decodeResponseBody(response)}`);
        }

        return new PieceUri(bucketId, cid);
    }

    async read(bucketId: bigint, cid: string): Promise<Piece> {
        const response = await this.sendRequest(`${BASE_PATH}/${cid}?bucketId=${bucketId}`);

        if (200 != response.status) {
            throw Error(`Failed to read piece. Response: status='${response.status}' body=${await decodeResponseBody(response)}`);
        }

        const pbSignedPiece = await response.arrayBuffer().then(value => PbSignedPiece.fromBinary(new Uint8Array(value)))
            .catch(() => {
                throw new Error("Can't parse read response bytes to SignedPiece.");
            });


        if (!pbSignedPiece.piece) {
            throw new Error(`Failed to parse signed piece. Response: status='${response.status}' body=${await decodeResponseBody(response)}`);
        }

        return this.toPiece(pbSignedPiece.piece);
    }

    async search(query: Query): Promise<SearchResult> {
        const pbQuery: PbQuery = {
            bucketId: query.bucketId.toString(),
            tags: query.tags,
        };
        const queryAsBytes = PbQuery.toBinary(pbQuery);
        const queryBase58 = base58Encode(queryAsBytes);

        const response = await this.sendRequest(`${BASE_PATH}?query=${queryBase58}`);

        if (200 != response.status) {
            throw Error(`Failed to search. Response: status='${response.status}' body=${await decodeResponseBody(response)}`);
        }

        const pbSearchResult = await response.arrayBuffer()
            .then(value => PbSearchResult.fromBinary(new Uint8Array(value)))
            .catch(() => {
                throw new Error("Can't parse search response bytes to SearchResult.");
            })

        const isPiece = (val: PbPiece | undefined): val is PbPiece => val !== null;
        const pieces: Piece[] = pbSearchResult.signedPieces
            .map((p: PbSignedPiece) => p.piece)
            .filter(isPiece)
            .map(this.toPiece);

        return new SearchResult(pieces);
    }

    private toPiece(piece: PbPiece): Piece {
        return new Piece(piece.data, piece.tags, piece.links.map(e => {
            return {cid: e.cid, size: BigInt(e.size), name: e.name}
        }));
    }

    private sendRequest(path: String, init?: RequestInit): Promise<Response> {
        let url = `${this.gatewayNodeUrl}${path}`
        return fetch(url, init).catch((error) => {
            throw new Error(`Can't send request url='${url}', method='${init?.method || "GET"}', error='${error}'`);
        });
    }
}
