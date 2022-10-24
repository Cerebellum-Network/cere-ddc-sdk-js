import {
    Piece as PbPiece,
    Query as PbQuery,
    Request as PbRequest,
    Response as PbResponse,
    SearchResult as PbSearchResult,
    SessionStatus,
    SignedPiece as PbSignedPiece,
} from '@cere-ddc-sdk/proto';
import {CidBuilder, CipherInterface, Scheme, SchemeInterface, SchemeName} from '@cere-ddc-sdk/core';
import {SmartContract, SmartContractOptions} from '@cere-ddc-sdk/smart-contract';
import {base58Encode, mnemonicGenerate} from '@polkadot/util-crypto';
import {stringToU8a, u8aToString} from '@polkadot/util';
import {nanoid} from 'nanoid';
import {fetch} from 'cross-fetch';
import {encode} from 'varint';
import {SearchResult} from './models/SearchResult';
import {Piece} from './models/Piece';
import {PieceUri} from './models/PieceUri';
import {Query} from './models/Query';
import {Tag} from './models/Tag';
import {EncryptionOptions} from './EncryptionOptions';
import {initDefaultOptions, StorageOptions} from './StorageOptions';

const BASE_PATH_PIECES = '/api/v1/rest/pieces';
const BASE_PATH_SESSION = '/api/v1/rest/session';

type HTTP_METHOD = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const DEK_PATH_TAG = 'dekPath';

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

type StoreRequest = {
    body: Uint8Array;
    cid: string;
    method: string;
    path: string;
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
        cidBuilder: CidBuilder = new CidBuilder(),
    ) {
        this.scheme = scheme;
        this.cdnNodeUrl = cdnNodeUrl;
        this.cidBuilder = cidBuilder;
        this.cipher = cipher;
    }

    static async build(options: StorageOptions, secretPhrase?: string): Promise<ContentAddressableStorage> {
        const caOptions = initDefaultOptions(options);
        const scheme =
            typeof options.scheme === 'string'
                ? await Scheme.createScheme(options.scheme as SchemeName, secretPhrase!)
                : options.scheme!;
        const cdn = await ContentAddressableStorage.getCdnAddress(caOptions.smartContract!, caOptions.clusterAddress);

        return new ContentAddressableStorage(scheme, cdn, caOptions.cipher, caOptions.cidBuilder);
    }

    //TODO implement balancer
    private static async getCdnAddress(
        smartContractOptions: SmartContractOptions,
        clusterAddress: string | number,
    ): Promise<string> {
        if (typeof clusterAddress === 'string') {
            return clusterAddress;
        }

        const smartContract = await SmartContract.buildAndConnect(mnemonicGenerate(), smartContractOptions);
        try {
            const cluster = await smartContract.clusterGet(clusterAddress as number);
            const vNodes = new Set<bigint>(cluster.cluster.vnodes);
            for (const vNode of vNodes) {
                const node = await smartContract.nodeGet(Number(vNode));
                const parameters = JSON.parse(node.params);

                if (parameters.type === 'cdn') {
                    return parameters.url;
                }
            }
        } finally {
            await smartContract.disconnect();
        }

        throw new Error(`unable to find cdn nodes in cluster='${clusterAddress}'`);
    }

    private getPath(path: string, method: HTTP_METHOD = 'GET'): Uint8Array {
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

    private async signRequest(request: PbRequest, path: string, method: HTTP_METHOD = 'GET'): Promise<Uint8Array | undefined> {
        const cid = await this.cidBuilder.build(
            concatArrays(
                this.getPath(path, method),
                new Uint8Array(encode(request.body.length)),
                request.body,
                new Uint8Array(encode(request.sessionId.length)),
                request.sessionId,
            ),
        );
        return this.scheme.sign(stringToU8a(`<Bytes>${cid}</Bytes>`));
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
        const signature = await this.signRequest(
            PbRequest.create({
                // @ts-ignore
                body: SessionStatus.toBinary(sessionStatus),
                scheme: this.scheme.name,
                multiHashType: 0n,
                publicKey: this.scheme.publicKey,
            }),
            BASE_PATH_SESSION,
            'POST',
        );

        const request = PbRequest.create({
            // @ts-ignore
            body: SessionStatus.toBinary(sessionStatus),
            scheme: this.scheme.name,
            multiHashType: 0n,
            signature,
            publicKey: this.scheme.publicKey,
        });

        const response = await this.sendRequest(BASE_PATH_SESSION, {
            method: 'POST',
            // @ts-ignore
            body: PbRequest.toBinary(request).buffer,
        });

        if (!response.ok) {
            const responseData = await response.arrayBuffer();
            // @ts-ignore
            const protoResponse = PbResponse.fromBinary(new Uint8Array(responseData));
            throw Error(
                JSON.stringify({
                    code: protoResponse.responseCode,
                    body: u8aToString(protoResponse.body),
                }),
            );
        }

        return sessionId;
    }

    async buildStoreRequest(bucketId: bigint, piece: Piece): Promise<StoreRequest> {
        const pbPiece: PbPiece = piece.toProto(bucketId);
        // @ts-ignore
        const pieceAsBytes = PbPiece.toBinary(pbPiece);
        const cid = await this.cidBuilder.build(pieceAsBytes);
        const timestamp = new Date();
        const signature = await this.scheme.sign(
            stringToU8a(`<Bytes>DDC store ${cid} at ${timestamp.toISOString()}</Bytes>`),
        );

        const pbSignedPiece: PbSignedPiece = {
            piece: pieceAsBytes,
            signature: {
                value: signature,
                scheme: this.scheme.name,
                signer: this.scheme.publicKey,
                multiHashType: 0n,
                timestamp: BigInt(timestamp.getTime()),
            },
        };

        // @ts-ignore
        const signedPieceSerial = PbSignedPiece.toBinary(pbSignedPiece);
        const requestSignature = await this.signRequest(
            PbRequest.create({
                body: signedPieceSerial,
            }),
            BASE_PATH_PIECES,
            'PUT',
        );

        const request = PbRequest.create({
            body: signedPieceSerial,
            scheme: this.scheme.name,
            publicKey: this.scheme.publicKey,
            multiHashType: 0n,
            signature: requestSignature,
        });

        // @ts-ignore
        return {body: PbRequest.toBinary(request), cid, method: 'PUT', path: BASE_PATH_PIECES};
    }

    async store(bucketId: bigint, piece: Piece): Promise<PieceUri> {
        const request = await this.buildStoreRequest(bucketId, piece);

        const response = await this.sendRequest(request.path, {
            method: request.method,
            body: request.body,
        });
        const responseData = await response.arrayBuffer();
        // @ts-ignore
        const protoResponse = PbResponse.fromBinary(new Uint8Array(responseData));

        if (!response.ok) {
            throw Error(
                `Failed to store. Response: status='${protoResponse.responseCode}' body=${u8aToString(
                    protoResponse.body,
                )}`,
            );
        }

        return new PieceUri(bucketId, request.cid);
    }

    async read(bucketId: bigint, cid: string, session?: Uint8Array): Promise<Piece> {
        const search = new URLSearchParams();
        search.set('bucketId', bucketId.toString());
        const requestSignature = session && session.length > 0
            ? undefined
            : await this.signRequest(
                PbRequest.create(),
                `${BASE_PATH_PIECES}/${cid}?${search.toString()}`,
            );
        const pbRequest = PbRequest.create({
            scheme: this.scheme.name,
            sessionId: session,
            signature: requestSignature,
            publicKey: this.scheme.publicKey,
        });
        // @ts-ignore
        search.set('data', Buffer.from(PbRequest.toBinary(pbRequest)).toString('base64'));

        const response = await this.sendRequest(`${BASE_PATH_PIECES}/${cid}?${search.toString()}`);
        const responseData = await response.arrayBuffer();
        // @ts-ignore
        const protoResponse = PbResponse.fromBinary(new Uint8Array(responseData));

        if (!response.ok) {
            throw Error(
                `Failed to read piece. Response: code='${protoResponse.responseCode}' body=${u8aToString(
                    protoResponse.body,
                )}`,
            );
        }

        const pbSignedPiece = await new Promise<PbSignedPiece>((resolve) => {
            try {
                // @ts-ignore
                resolve(PbSignedPiece.fromBinary(protoResponse.body));
            } catch (e) {
                throw new Error("Can't parse read response body to SignedPiece.");
            }
        });

        if (!pbSignedPiece.piece) {
            throw new Error(
                `Failed to parse signed piece. Response: status='${protoResponse.responseCode}' body=${u8aToString(
                    protoResponse.body,
                )}`,
            );
        }

        // @ts-ignore
        return this.toPiece(PbPiece.fromBinary(pbSignedPiece.piece), cid);
    }

    async search(query: Query, session?: Uint8Array): Promise<SearchResult> {
        const pbQuery: PbQuery = {
            bucketId: Number(query.bucketId),
            tags: query.tags,
            skipData: query.skipData,
        };
        // @ts-ignore
        const queryAsBytes = PbQuery.toBinary(pbQuery);
        const queryBase58 = base58Encode(queryAsBytes);

        const search = new URLSearchParams();
        search.append('query', queryBase58);

        const requestSignature = session && session.length > 0
            ? undefined
            : await this.signRequest(
                PbRequest.create(),
                `${BASE_PATH_PIECES}?${search.toString()}`,
            );
        const pbRequest = PbRequest.create({
            scheme: this.scheme.name,
            sessionId: session,
            signature: requestSignature,
            publicKey: this.scheme.publicKey,
        });
        // @ts-ignore
        search.set('data', Buffer.from(PbRequest.toBinary(pbRequest)).toString('base64'))

        const response = await this.sendRequest(`${BASE_PATH_PIECES}?${search.toString()}`);
        const responseData = await response.arrayBuffer();
        // @ts-ignore
        const protoResponse = PbResponse.fromBinary(new Uint8Array(responseData));

        if (!response.status) {
            throw Error(
                `Failed to search. Response: status='${protoResponse.responseCode}' body=${u8aToString(
                    protoResponse.body,
                )}`,
            );
        }

        const pbSearchResult = await new Promise<PbSearchResult>((resolve) => {
            try {
                // @ts-ignore
                resolve(PbSearchResult.fromBinary(protoResponse.body));
            } catch (e) {
                throw new Error(`Can't parse search response body to SearchResult.\n${u8aToString(protoResponse.body)}`);
            }
        });

        const isPiece = (val: Uint8Array | undefined): val is Uint8Array => val != null;
        let pieces: Piece[] = pbSearchResult.searchedPieces
            .filter((p) => isPiece(p.signedPiece?.piece))
            // @ts-ignore
            .map((e) => this.toPiece(PbPiece.fromBinary(e.signedPiece!.piece!), e.cid));

        return new SearchResult(pieces);
    }

    async storeEncrypted(
        bucketId: bigint,
        piece: Piece,
        encryptionOptions: EncryptionOptions,
    ): Promise<PieceUri> {
        const encryptedPiece = piece.clone();
        encryptedPiece.tags.push(new Tag(DEK_PATH_TAG, encryptionOptions.dekPath));
        encryptedPiece.data = this.cipher!.encrypt(piece.data, encryptionOptions.dek);
        return this.store(bucketId, encryptedPiece);
    }

    async readDecrypted(bucketId: bigint, cid: string, dek: Uint8Array, session?: Uint8Array): Promise<Piece> {
        const piece = await this.read(bucketId, cid, session);
        piece.data = this.cipher!.decrypt(piece.data, dek);

        return piece;
    }

    private toPiece(piece: PbPiece, cid: string): Piece {
        return new Piece(
            piece.data,
            piece.tags.map((t) => new Tag(t.key, t.value, t.searchable)),
            piece.links.map((e) => {
                return {cid: e.cid, size: BigInt(e.size), name: e.name};
            }),
            cid,
        );
    }

    private sendRequest(path: String, init?: RequestInit): Promise<Response> {
        let url = `${this.cdnNodeUrl}${path}`;
        return fetch(url, init).catch((error) => {
            throw new Error(`Can't send request url='${url}', method='${init?.method || 'GET'}', error='${error}'`);
        });
    }
}
