import {
    Piece as PbPiece,
    Query as PbQuery,
    Request as PbRequest,
    Response as PbResponse,
    SearchResult as PbSearchResult,
    SessionStatus,
    SignedPiece as PbSignedPiece,
} from "@cere-ddc-sdk/proto";
import {SearchResult} from "./models/SearchResult";
import {CidBuilder, CipherInterface, Scheme, SchemeInterface, SchemeName} from "@cere-ddc-sdk/core";
import {SmartContract, SmartContractOptions} from "@cere-ddc-sdk/smart-contract";
import {base58Encode, mnemonicGenerate} from "@polkadot/util-crypto";
import {stringToU8a, u8aToString} from "@polkadot/util";
import {nanoid} from 'nanoid';
import {fetch} from 'cross-fetch';
import {encode} from 'varint';
import {Piece} from "./models/Piece";
import {PieceUri} from "./models/PieceUri";
import {Query} from "./models/Query";
import {Tag} from "./models/Tag";
import {EncryptionOptions} from "./EncryptionOptions";
import {initDefaultOptions, StorageOptions} from "./StorageOptions";

const BASE_PATH_PIECES = "/api/v1/rest/pieces";
const BASE_PATH_SESSION = "/api/v1/rest/session";

export const DEK_PATH_TAG = "dekPath";

function concatArrays(...arrays: Uint8Array[]): Uint8Array {
    const size = arrays.reduce((result, array) => result + array.length, 0);
    const result = new Uint8Array(size);
    let i = 0;
    arrays.forEach((array) => {
        result.set(array, i);
        i += array.length;
    });
    return result;
}

type CreateSessionParams = {
    gas: number;
    endOfEpoch: number;
    bucketId: BigInt;
};

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


    getPath(path: string, method: 'GET' | 'POST' | 'PUT' = 'GET'): Uint8Array {
        const url = new URL(`${this.cdnNodeUrl}${path}`);
        url.searchParams.delete('data');

        const link = `${url.pathname}${url.search}`;

        return concatArrays(
            new Uint8Array(encode(method.length)),
            stringToU8a(method),
            new Uint8Array(encode(link.length)),
            stringToU8a(link),
        );
    }

    async createSession({bucketId, gas, endOfEpoch}: CreateSessionParams): Promise<Uint8Array> {
        const sessionId = stringToU8a(nanoid());
        const sessionStatus = SessionStatus.create({
            publicKey: this.scheme.publicKey,
            gas,
            sessionId,
            bucketId: Number(bucketId),
            endOfEpoch: BigInt(endOfEpoch),
        });
        const sessionStatusEncoded = SessionStatus.toBinary(sessionStatus);

        const data = concatArrays(
            this.getPath(BASE_PATH_SESSION, 'POST'),
            new Uint8Array(encode(sessionStatusEncoded.length)),
            sessionStatusEncoded,
            new Uint8Array(encode(0)),
        );
        const cid = await this.cidBuilder.build(data);
        const signature = await this.scheme.sign(stringToU8a(`<Bytes>${cid}</Bytes>`));

        const request = PbRequest.create({
            body: sessionStatusEncoded,
            scheme: this.scheme.name,
            multiHashType: 0n,
            signature,
            publicKey: this.scheme.publicKey
        });

        const response = await this.sendRequest(BASE_PATH_SESSION, {
            method: 'POST',
            body: PbRequest.toBinary(request).buffer,
        });

        if (!response.ok) {
            const responseData = await response.arrayBuffer();
            const protoResponse = PbResponse.fromBinary(new Uint8Array(responseData));
            throw Error(JSON.stringify({
                code: protoResponse.responseCode,
                body: u8aToString(protoResponse.body),
            }))
        }

        return sessionId;
    }

    async buildStoreRequest(bucketId: bigint, piece: Piece, sessionId: Uint8Array): Promise<StoreRequest> {
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
                multiHashType: 0n,
                timestamp: BigInt(timestamp.getTime())
            },
        };

        const signedPieceSerial = PbSignedPiece.toBinary(pbSignedPiece);

        const request = PbRequest.create({
            body: signedPieceSerial,
            scheme: this.scheme.name,
            sessionId,
            publicKey: this.scheme.publicKey,
            multiHashType: 0n,
        });

        return {body: PbRequest.toBinary(request), cid, method: "PUT", path: BASE_PATH_PIECES};
    }

    async store(bucketId: bigint, piece: Piece, sessionId: Uint8Array): Promise<PieceUri> {
        const request = await this.buildStoreRequest(bucketId, piece, sessionId);

        const response = await this.sendRequest(request.path, {
            method: request.method,
            body: request.body,
        });
        const responseData = await response.arrayBuffer();
        const protoResponse = PbResponse.fromBinary(new Uint8Array(responseData));

        if (!response.ok) {
            throw Error(`Failed to store. Response: status='${protoResponse.responseCode}' body=${u8aToString(protoResponse.body)}`);
        }

        return new PieceUri(bucketId, request.cid);
    }

    async read(bucketId: bigint, cid: string, session: Uint8Array): Promise<Piece> {
        const pbRequest = PbRequest.create({
            scheme: this.scheme.name,
            sessionId: session,
            publicKey: this.scheme.publicKey,
        });
        const search = new URLSearchParams();
        search.set('bucketId', bucketId.toString());
        search.set('data', Buffer.from(PbRequest.toBinary(pbRequest)).toString('base64'));

        const response = await this.sendRequest(`${BASE_PATH_PIECES}/${cid}?${search.toString()}`);
        const responseData = await response.arrayBuffer();
        const protoResponse = PbResponse.fromBinary(new Uint8Array(responseData));

        if (!response.ok) {
            throw Error(`Failed to read piece. Response: code='${protoResponse.responseCode}' body=${u8aToString(protoResponse.body)}`);
        }

        const pbSignedPiece = await new Promise<PbSignedPiece>((resolve) => {
            try {
                resolve(PbSignedPiece.fromBinary(protoResponse.body));
            } catch (e) {
                throw new Error("Can't parse read response body to SignedPiece.");
            }
        });

        if (!pbSignedPiece.piece) {
            throw new Error(`Failed to parse signed piece. Response: status='${protoResponse.responseCode}' body=${u8aToString(protoResponse.body)}`);
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

        const response = await this.sendRequest(`${BASE_PATH_PIECES}?query=${queryBase58}`);
        const responseData = await response.arrayBuffer();
        const protoResponse = PbResponse.fromBinary(new Uint8Array(responseData));

        if (!response.status) {
            throw Error(`Failed to search. Response: status='${protoResponse.responseCode}' body=${u8aToString(protoResponse.body)}`);
        }

        const pbSearchResult = await new Promise<PbSearchResult>((resolve) => {
            try {
                resolve(PbSearchResult.fromBinary(protoResponse.body));
            } catch (e) {
                throw new Error("Can't parse search response body to SearchResult.");
            }
        });

        const isPiece = (val: Uint8Array | undefined): val is Uint8Array => val != null;
        let pieces: Piece[] = pbSearchResult.searchedPieces
            .filter(p => isPiece(p.signedPiece?.piece))
            .map(e => this.toPiece(PbPiece.fromBinary(e.signedPiece!.piece!), e.cid))

        return new SearchResult(pieces);
    }

    async storeEncrypted(bucketId: bigint, piece: Piece, session: Uint8Array, encryptionOptions: EncryptionOptions): Promise<PieceUri> {
        const encryptedPiece = piece.clone();
        encryptedPiece.tags.push(new Tag(DEK_PATH_TAG, encryptionOptions.dekPath));
        encryptedPiece.data = this.cipher!.encrypt(piece.data, encryptionOptions.dek);
        return this.store(bucketId, encryptedPiece, session);
    }

    async readDecrypted(bucketId: bigint, cid: string, dek: Uint8Array, session: Uint8Array): Promise<Piece> {
        const piece = await this.read(bucketId, cid, session);
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
