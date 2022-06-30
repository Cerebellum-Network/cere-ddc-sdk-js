import {
    Piece as PbPiece,
    Query as PbQuery,
    SearchResult as PbSearchResult,
    SignedPiece as PbSignedPiece,
} from "@cere-ddc-sdk/proto";
import {Piece} from "./models/Piece.js";
import {PieceUri} from "./models/PieceUri.js";
import {Query} from "./models/Query.js";
import {SearchResult} from "./models/SearchResult.js";
import {CidBuilder, CipherInterface, Scheme, SchemeInterface, SchemeName} from "@cere-ddc-sdk/core";
import {base58Encode, mnemonicGenerate} from "@polkadot/util-crypto";
import {stringToU8a} from "@polkadot/util";
import {fetch} from 'cross-fetch';
import {Tag} from "./models/Tag.js";
import {EncryptionOptions} from "./EncryptionOptions.js";
import {SmartContract, SmartContractOptions} from "@cere-ddc-sdk/smart-contract";
import {initDefaultOptions, StorageOptions} from "./StorageOptions.js";

const BASE_PATH = "/api/rest/pieces";
const decoder = new TextDecoder();
const decodeResponseBody = async (response: Response) => decoder.decode(await response.arrayBuffer());

export const DEK_PATH_TAG = "dekPath";

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

    static async build(options: StorageOptions, secretPhrase?: string): Promise<ContentAddressableStorage> {
        const caOptions = initDefaultOptions(options);
        const scheme = (typeof options.scheme === "string") ? await Scheme.createScheme(options.scheme as SchemeName, secretPhrase!) : options.scheme!;
        const cdn = await ContentAddressableStorage.getCdnAddress(caOptions.smartContract!, caOptions.clusterAddress);

        return new ContentAddressableStorage(scheme, cdn, caOptions.cipher, caOptions.cidBuilder);
    }

    //TODO implement balancer
    private static async getCdnAddress(smartContractOptions: SmartContractOptions, clusterAddress: string | number): Promise<string> {
        if (typeof clusterAddress === "string") {
            return clusterAddress;
        }

        const smartContract = await SmartContract.buildAndConnect(mnemonicGenerate(), smartContractOptions);
        try {
            const cluster = await smartContract.clusterGet(clusterAddress as number);
            const vNodes = new Set<bigint>(cluster.cluster.vnodes);
            for (const vNode of vNodes) {
                const node = await smartContract.nodeGet(Number(vNode));
                const parameters = JSON.parse(node.params);

                if (parameters.type === "cdn") {
                    return parameters.url;
                }
            }
        } finally {
            await smartContract.disconnect();
        }

        throw new Error(`unable to find cdn nodes in cluster='${clusterAddress}'`);
    }

    async buildStoreRequest(bucketId: bigint, piece: Piece): Promise<StoreRequest> {
        const pbPiece: PbPiece = piece.toProto(bucketId);
        const pieceAsBytes = PbPiece.toBinary(pbPiece);
        const cid = await this.cidBuilder.build(pieceAsBytes);
        const timestamp = new Date();
        const signature = await this.scheme.sign(stringToU8a(`<Bytes>DDC store ${cid} at ${timestamp.toISOString()}</Bytes>`));

        const pbSignedPiece: PbSignedPiece = {
            piece: pieceAsBytes,
            signature: {
                value: signature,
                scheme: this.scheme.name,
                signer: this.scheme.publicKey,
                multiHashType: 0n, // default blake2b-256
                timestamp: BigInt(timestamp.getTime())
            },
        };

        const signedPieceSerial = PbSignedPiece.toBinary(pbSignedPiece);

        return {body: signedPieceSerial, cid, method: "PUT", path: BASE_PATH};
    }

    async store(bucketId: bigint, piece: Piece): Promise<PieceUri> {
        const request = await this.buildStoreRequest(bucketId, piece);

        const response = await this.sendRequest(request.path, {
            method: request.method,
            body: request.body,
        });

        if (201 != response.status) {
            throw Error(`Failed to store. Response: status='${response.status}' body=${await decodeResponseBody(response)}`);
        }

        return new PieceUri(bucketId, request.cid);
    }

    async read(bucketId: bigint, cid: string): Promise<Piece> {
        const response = await this.sendRequest(`${BASE_PATH}/${cid}?bucketId=${bucketId}`);

        if (200 != response.status) {
            throw Error(`Failed to read piece. Response: status='${response.status}' body=${await decodeResponseBody(response)}`);
        }

        const pbSignedPiece = await response.arrayBuffer().then(value => PbSignedPiece.fromBinary(new Uint8Array(value)))
            .catch(() => {
                throw new Error("Can't parse read response body to SignedPiece.");
            });


        if (!pbSignedPiece.piece) {
            throw new Error(`Failed to parse signed piece. Response: status='${response.status}' body=${await decodeResponseBody(response)}`);
        }

        return this.toPiece(PbPiece.fromBinary(pbSignedPiece.piece), cid);
    }

    async search(query: Query): Promise<SearchResult> {
        const pbQuery: PbQuery = {
            bucketId: Number(query.bucketId),
            tags: query.tags,
            skipData: query.skipData
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
                throw new Error("Can't parse search response body to SearchResult.");
            })

        const isPiece = (val: Uint8Array | undefined): val is Uint8Array => val != null;
        let pieces: Piece[] = pbSearchResult.searchedPieces
            .filter(p => isPiece(p.signedPiece?.piece))
            .map(e => this.toPiece(PbPiece.fromBinary(e.signedPiece!.piece!), e.cid))

        return new SearchResult(pieces);
    }

    async storeEncrypted(bucketId: bigint, piece: Piece, encryptionOptions: EncryptionOptions): Promise<PieceUri> {
        const encryptedPiece = piece.clone();
        encryptedPiece.tags.push(new Tag(DEK_PATH_TAG, encryptionOptions.dekPath));
        encryptedPiece.data = this.cipher!.encrypt(piece.data, encryptionOptions.dek);
        return this.store(bucketId, encryptedPiece)
    }

    async readDecrypted(bucketId: bigint, cid: string, dek: Uint8Array): Promise<Piece> {
        const piece = await this.read(bucketId, cid);
        piece.data = this.cipher!.decrypt(piece.data, dek)

        return piece;
    }

    private toPiece(piece: PbPiece, cid: string): Piece {
        return new Piece(piece.data, piece.tags.map(t => new Tag(t.key, t.value, t.searchable)), piece.links.map(e => {
            return {cid: e.cid, size: BigInt(e.size), name: e.name}
        }), cid);
    }

    private sendRequest(path: String, init?: RequestInit): Promise<Response> {
        let url = `${this.cdnNodeUrl}${path}`
        return fetch(url, init).catch((error) => {
            throw new Error(`Can't send request url='${url}', method='${init?.method || "GET"}', error='${error}'`);
        });
    }
}

type StoreRequest = {
    body: Uint8Array;
    cid: string;
    method: string;
    path: string;
};
