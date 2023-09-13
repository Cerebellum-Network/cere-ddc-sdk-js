import {
    Ack as PbAck,
    Piece as PbPiece,
    Query as PbQuery,
    Request as PbRequest,
    Response as PbResponse,
    SearchResult as PbSearchResult,
    SignedPiece as PbSignedPiece,
} from '@cere-ddc-sdk/proto';
import {
    CidBuilder,
    CipherInterface,
    isSchemeName,
    randomUint8,
    RequiredSelected,
    Scheme,
    SchemeInterface,
} from '@cere-ddc-sdk/core';
import {SmartContract, SmartContractOptions} from '@cere-ddc-sdk/smart-contract';
import {base58Encode, mnemonicGenerate, randomAsU8a} from '@polkadot/util-crypto';
import {stringToU8a, u8aToString, bnToU8a} from '@polkadot/util';
import {fetch} from 'cross-fetch';
import {encode} from 'varint';
import {SearchResult} from './models/SearchResult';
import {Piece} from './models/Piece';
import {PieceUri} from './models/PieceUri';
import {Query} from './models/Query';
import {Tag} from './models/Tag';
import {EncryptionOptions} from './EncryptionOptions';
import {CaCreateOptions, Session} from './ca-create-options';
import {concatArrays} from './lib/concat-arrays';
import {DEFAULT_SESSION_ID_SIZE, DEK_PATH_TAG, REQIEST_ID_HEADER} from './constants';
import {initDefaultOptions} from './lib/init-default-options';
import {repeatableFetch} from './lib/repeatable-fetch';
import {Route} from './router';

const BASE_PATH_PIECES = '/api/v1/rest/pieces';

type HTTP_METHOD = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type SessionOptions = {
    session?: Session;
};

type RouteOptions = {
    route?: Route;
};

export type ReadOptions = SessionOptions & RouteOptions & {};
export type StoreOptions = SessionOptions & RouteOptions & {};
export type SearchOptions = SessionOptions & RouteOptions & {};

type StoreRequest = {
    body: Uint8Array;
    cid: string;
    method: string;
    path: string;
};

type AckParams = {
    response: Response;
    payload: PbResponse;
    session: Session;
    piece: Piece;
    cid?: string;
};

export type ContentAddressableStorageOptions = RequiredSelected<Partial<CaCreateOptions>, 'clusterAddress'>;

export class ContentAddressableStorage {
    private constructor(
        public readonly scheme: SchemeInterface,
        public readonly cdnNodeUrl: string,
        public readonly cipher: CipherInterface,
        private readonly cidBuilder: CidBuilder,
        private readonly readAttempts: number = 1,
        private readonly writeAttempts: number = 1,
        private defaultSession: Session | null = null,
    ) {}

    static async build(
        options: ContentAddressableStorageOptions,
        secretMnemonicOrSeed: string,
    ): Promise<ContentAddressableStorage> {
        const caOptions = initDefaultOptions(options);
        const scheme = isSchemeName(caOptions.scheme)
            ? await Scheme.createScheme(caOptions.scheme, secretMnemonicOrSeed)
            : caOptions.scheme;
        const cdn = await ContentAddressableStorage.getCdnAddress(caOptions.smartContract, caOptions.clusterAddress);

        return new ContentAddressableStorage(
            scheme,
            cdn,
            caOptions.cipher,
            caOptions.cidBuilder,
            caOptions.readAttempts,
            caOptions.writeAttempts,
            caOptions.session,
        );
    }

    async disconnect(): Promise<void> {}

    private static async getCdnAddress(
        smartContractOptions: SmartContractOptions,
        clusterAddress: string | number,
    ): Promise<string> {
        if (typeof clusterAddress === 'string') {
            return clusterAddress;
        }

        const smartContract = await SmartContract.buildAndConnect(mnemonicGenerate(), smartContractOptions);
        try {
            const {cluster} = await smartContract.clusterGet(clusterAddress);

            if (cluster.cdnNodesKeys.length === 0) {
                throw new Error(`unable to find cdn nodes in cluster='${clusterAddress}'`);
            }

            const index = randomUint8(cluster.cdnNodesKeys.length);
            const cdnNodeKey = cluster.cdnNodesKeys[index];
            const {cdnNode} = await smartContract.cdnNodeGet(cdnNodeKey);

            if (!cdnNode.cdnNodeParams.url) {
                throw new Error(`unable to get CDN node URL. Node key '${cdnNodeKey}'`);
            }

            return new URL(cdnNode.cdnNodeParams.url).href;
        } finally {
            await smartContract.disconnect();
        }

        throw new Error(`unable to find cdn nodes in cluster='${clusterAddress}'`);
    }

    private getPath(path: string, method: HTTP_METHOD = 'GET'): Uint8Array {
        const url = new URL(this.cdnNodeUrl);
        const [pathname, search] = path.split('?');
        url.pathname = pathname;
        if (search) {
            url.search = search;
            url.searchParams.delete('data');
        }

        const link = `${url.pathname}${url.search}`;

        return concatArrays(
            new Uint8Array(encode(method.length)),
            stringToU8a(method),
            new Uint8Array(encode(link.length)),
            stringToU8a(link),
        );
    }

    private async signRequest(
        request: PbRequest,
        path: string,
        method: HTTP_METHOD = 'GET',
    ): Promise<Uint8Array | undefined> {
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

    private async buildStoreRequest(bucketId: bigint, session: Session, piece: Piece): Promise<StoreRequest> {
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

        const signedPieceSerial = PbSignedPiece.toBinary(pbSignedPiece);
        const requestSignature = await this.signRequest(
            PbRequest.create({body: signedPieceSerial, sessionId: session}),
            BASE_PATH_PIECES,
            'PUT',
        );

        const request = PbRequest.create({
            body: signedPieceSerial,
            scheme: this.scheme.name,
            publicKey: this.scheme.publicKey,
            multiHashType: 0n,
            signature: requestSignature,
            sessionId: session,
        });

        return {
            cid,
            body: PbRequest.toBinary(request),
            method: 'PUT',
            path: BASE_PATH_PIECES,
        };
    }

    async store(bucketId: bigint, piece: Piece, options: StoreOptions = {}): Promise<PieceUri> {
        const session = await this.useSession(options.session);
        const request = await this.buildStoreRequest(bucketId, session, piece);

        const response = await this.sendRequest(request.path, undefined, {
            method: request.method,
            body: request.body,
        });
        const responseData = await response.arrayBuffer();
        // @ts-ignore
        const protoResponse = PbResponse.fromBinary(new Uint8Array(responseData));

        if (!response.ok) {
            throw Error(
                `Failed to store. Http response status: ${response.status} Response: status='${
                    protoResponse.responseCode
                }' body=${u8aToString(protoResponse.body)}`,
            );
        }

        await this.ack({
            piece,
            session,
            response,
            cid: request.cid,
            payload: protoResponse,
        });

        return new PieceUri(bucketId, request.cid);
    }

    async read(bucketId: bigint, cid: string, options: ReadOptions = {}): Promise<Piece> {
        const session = await this.useSession(options.session);
        const search = new URLSearchParams();
        search.set('bucketId', bucketId.toString());
        const requestSignature = await this.signRequest(
            PbRequest.create({sessionId: session}),
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

        const response = await this.sendRequest(`${BASE_PATH_PIECES}/${cid}`, search.toString());
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

        const pieceVerifyResult = await this.verifySignedPiece(pbSignedPiece, cid);

        if (!pieceVerifyResult) {
            throw new Error(
                `Incorrect response. The cid [${cid}] provided in the request doesn't corresponds to expected`,
            );
        }

        const piece = this.toPiece(PbPiece.fromBinary(pbSignedPiece.piece), cid);

        await this.ack({
            piece,
            session,
            response,
            payload: protoResponse,
        });

        return piece;
    }

    async search(query: Query, options: SearchOptions = {}): Promise<SearchResult> {
        const session = await this.useSession(options.session);

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

        const requestSignature = await this.signRequest(
            PbRequest.create({sessionId: session}),
            `${BASE_PATH_PIECES}?${search.toString()}`,
        );
        const pbRequest = PbRequest.create({
            scheme: this.scheme.name,
            sessionId: session,
            signature: requestSignature,
            publicKey: this.scheme.publicKey,
        });
        // @ts-ignore
        search.set('data', Buffer.from(PbRequest.toBinary(pbRequest)).toString('base64'));

        const response = await this.sendRequest(`${BASE_PATH_PIECES}`, search.toString());
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
                throw new Error(
                    `Can't parse search response body to SearchResult.\n${u8aToString(protoResponse.body)}`,
                );
            }
        });

        const pieces = pbSearchResult.searchedPieces
            .filter((p) => !!p.signedPiece)
            .map(({signedPiece, cid}) => this.toPiece(PbPiece.fromBinary(signedPiece!.piece), cid));

        await Promise.all(
            pieces.map((piece) =>
                this.ack({
                    piece,
                    session,
                    response,
                    payload: protoResponse,
                }),
            ),
        );

        return new SearchResult(pieces);
    }

    async storeEncrypted(
        bucketId: bigint,
        piece: Piece,
        encryptionOptions: EncryptionOptions,
        storeOptions: StoreOptions = {},
    ): Promise<PieceUri> {
        const encryptedPiece = piece.clone();

        encryptedPiece.tags.push(new Tag(DEK_PATH_TAG, encryptionOptions.dekPath));
        encryptedPiece.data = this.cipher.encrypt(piece.data, encryptionOptions.dek);

        return this.store(bucketId, encryptedPiece, storeOptions);
    }

    async readDecrypted(bucketId: bigint, cid: string, dek: Uint8Array, readOptions: ReadOptions = {}): Promise<Piece> {
        const piece = await this.read(bucketId, cid, readOptions);
        piece.data = this.cipher.decrypt(piece.data, dek);

        return piece;
    }

    async createSession(session?: Session): Promise<Uint8Array> {
        return session || randomAsU8a(DEFAULT_SESSION_ID_SIZE);
    }

    private async useSession(session?: Session) {
        if (session) {
            return session;
        }

        /**
         * Create new default session once for an instance
         */
        this.defaultSession ||= await this.createSession();

        return this.defaultSession;
    }

    private async verifySignedPiece(pbSignedPiece: PbSignedPiece, cid: string) {
        const pieceCid = await this.cidBuilder.build(pbSignedPiece.piece);
        return pieceCid === cid;
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

    private ack = async ({piece, session, response, payload, cid}: AckParams): Promise<void> => {
        if (!response.headers.has(REQIEST_ID_HEADER) || (payload.responseCode !== 0 && payload.responseCode !== 1)) {
            return;
        }

        const requestId = response.headers.get(REQIEST_ID_HEADER)!!;
        const finalCid = piece.cid || cid;

        if (!finalCid) {
            return;
        }

        const ack = PbAck.create({
            requestId,
            sessionId: session,
            cid: finalCid,
            chunks: [finalCid, ...piece.links.map((link) => link.cid)],
            timestamp: BigInt(Date.now()),
            publicKey: this.scheme.publicKey,
            gas: BigInt(payload.gas),
            nonce: randomAsU8a(32),
        });

        const ackSignature = await this.signAck(ack);

        if (ackSignature) {
            ack.signature = ackSignature;
        }

        const request = PbRequest.create({
            body: PbAck.toBinary(ack),
            publicKey: this.scheme.publicKey,
            scheme: this.scheme.name,
            multiHashType: 0n,
        });

        const requestSignature = await this.signRequest(request, '/api/rest/ack', 'POST');

        if (requestSignature) {
            request.signature = requestSignature;
        }

        const ackResponse = await this.sendRequest('/api/rest/ack', undefined, {
            method: 'POST',
            body: PbRequest.toBinary(request).buffer,
        });

        const pbAckResponse = PbResponse.fromBinary(new Uint8Array(await ackResponse.arrayBuffer()));

        if (!ackResponse.ok) {
            throw Error(
                `Failed to send ack id='${requestId}. Http response status: ${ackResponse.status} Response: status='${
                    pbAckResponse.responseCode
                }' body=${u8aToString(pbAckResponse.body)}`,
            );
        }
    };

    private async signAck(ack: PbAck) {
        const cid = await this.cidBuilder.build(
            concatArrays(
                stringToU8a(ack.requestId),
                bnToU8a(ack.timestamp),
                bnToU8a(ack.gas),
                ack.nonce,
                ack.sessionId,
            ),
        );

        return this.scheme.sign(stringToU8a(`<Bytes>${cid}</Bytes>`));
    }

    private sendRequest(pathname: string, query?: string, init?: RequestInit): Promise<Response> {
        const url = new URL(this.cdnNodeUrl);
        url.pathname = pathname;
        if (query) {
            url.search = new URLSearchParams(query).toString();
        }
        const method = init?.method?.toUpperCase() || 'GET';
        const attempts = method === 'GET' ? this.readAttempts : this.writeAttempts;
        const options = init != null ? {...init, attempts} : {attempts};
        const response = attempts === 1 ? fetch(url.href, init) : repeatableFetch(url.href, options);

        return response.catch((error) => {
            throw new Error(`Can't send request url='${url}', method='${method}', error='${error}'`);
        });
    }
}
