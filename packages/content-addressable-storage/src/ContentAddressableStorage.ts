import {
  Piece as PbPiece,
  SignedPiece as PbSignedPiece,
  Query as PbQuery,
  SearchResult as PbSearchResult,
} from "@cere-ddc-sdk/proto";
import { CidBuilder } from "./cid/CidBuilder";
import { Scheme } from "./crypto/Scheme";
import {stringToU8a} from "@cere-ddc-sdk/util";
import {Piece} from "./models/Piece";
import {PieceUri} from "./models/PieceUri";
import {Query} from "./models/Query";
import {SearchResult} from "./models/SearchResult";

const BASE_PATH = "/api/rest/pieces";

export class ContentAddressableStorage {
  scheme: Scheme;
  gatewayNodeUrl: string;

  cidBuilder: CidBuilder;

  constructor(
    scheme: Scheme,
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
    };
    let pieceAsBytes = PbPiece.toBinary(pbPiece);
    let cid = this.cidBuilder.build(pieceAsBytes);
    let signature = this.scheme.sign(stringToU8a(cid));

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
    let response = await fetch(this.gatewayNodeUrl + BASE_PATH + "/" + cid, {
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

    return new Piece(pbSignedPiece.piece.data, pbSignedPiece.piece.tags);
  }

  async search(query: Query): Promise<SearchResult> {
    let pbQuery: PbQuery = {
      bucketId: query.bucketId.toString(),
      tags: query.tags,
    }

    let response = await fetch(this.gatewayNodeUrl + BASE_PATH, {
      method: "GET",
      body: PbQuery.toBinary(pbQuery),
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
      .map((p) => p.piece)
      .filter(isPiece);

    return new SearchResult(pieces);
  }
}
