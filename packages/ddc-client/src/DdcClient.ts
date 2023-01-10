import {DdcUri, GetFirstArgument, IFILE, IPIECE, isSchemeName, RequiredSelected, Scheme} from '@cere-ddc-sdk/core';
import {
    ContentAddressableStorage,
    DEK_PATH_TAG,
    Piece,
    PieceUri,
    Query,
    Tag,
} from '@cere-ddc-sdk/content-addressable-storage';
import {FileStorage} from '@cere-ddc-sdk/file-storage';
import {
    BucketCreatedEvent,
    BucketParams,
    BucketStatus,
    BucketStatusList,
    SmartContract,
} from '@cere-ddc-sdk/smart-contract';
import {KeyValueStorage} from '@cere-ddc-sdk/key-value-storage';
import {blake2AsU8a, naclBoxPairFromSecret} from '@polkadot/util-crypto';
import nacl, {BoxKeyPair} from 'tweetnacl';
import {hexToU8a, stringToU8a, u8aToHex} from '@polkadot/util';

import {DdcClientInterface} from './DdcClient.interface';
import {ClientOptionsInterface} from './options/ClientOptions';
import {StoreOptions} from './options/StoreOptions';
import {ReadOptions} from './options/ReadOptions';
import {File} from './model/File';
import {initDefaultClientOptions} from './lib/init-default-client-options';
import {getNaclBoxSecret} from './lib/get-nacl-box-secret';

const emptyNonce = new Uint8Array(nacl.box.nonceLength);

const ENCRYPTOR_TAG = 'encryptor';
const NONCE_TAG = 'nonce';
const MAX_BUCKET_SIZE = 5n;

type CreateSessionParams = GetFirstArgument<ContentAddressableStorage['createSession']>;
type Options = RequiredSelected<Partial<ClientOptionsInterface>, 'clusterAddress'>;

export class DdcClient implements DdcClientInterface {
    readonly kvStorage: KeyValueStorage;
    readonly fileStorage: FileStorage;

    readonly masterDek: Uint8Array;
    readonly boxKeypair: BoxKeyPair;

    protected constructor(
        public readonly caStorage: ContentAddressableStorage,
        public readonly smartContract: SmartContract,
        private readonly options: ClientOptionsInterface,
        encryptionSecretPhrase: string,
    ) {
        this.kvStorage = new KeyValueStorage(caStorage);
        this.fileStorage = new FileStorage(caStorage, options.fileOptions);

        this.masterDek = blake2AsU8a(encryptionSecretPhrase);
        this.boxKeypair = naclBoxPairFromSecret(nacl.box.keyPair.fromSecretKey(getNaclBoxSecret(encryptionSecretPhrase)).secretKey);
    }

    static async buildAndConnect(
        options: Options,
        secretPhrase: string,
        encryptionSecretPhrase?: string,
    ): Promise<DdcClient> {
        encryptionSecretPhrase = encryptionSecretPhrase != null ? encryptionSecretPhrase : secretPhrase;
        const clientCreateOptions = initDefaultClientOptions(options);

        const scheme = isSchemeName(clientCreateOptions.scheme)
            ? await Scheme.createScheme(clientCreateOptions.scheme, secretPhrase)
            : clientCreateOptions.scheme;
        const smartContract = await SmartContract.buildAndConnect(secretPhrase, options.smartContract);
        const caStorage = await ContentAddressableStorage.build(
            {
                ...clientCreateOptions,
                scheme,
            },
            secretPhrase,
        );

        return new DdcClient(caStorage, smartContract, clientCreateOptions, encryptionSecretPhrase);
    }

    async disconnect() {
        return await this.smartContract.disconnect();
    }

    async createBucket(
        balance: bigint,
        resource: bigint,
        clusterId: bigint,
        bucketParams?: BucketParams,
    ): Promise<BucketCreatedEvent> {
        if (resource > MAX_BUCKET_SIZE) {
            throw new Error(`Exceed bucket size. Should be less than ${MAX_BUCKET_SIZE}`);
        } else if (resource <= 0) {
            resource = 1n;
        }

        const event = await this.smartContract.bucketCreate(this.caStorage.scheme.publicKeyHex, clusterId, bucketParams);
        if (balance > 0) {
            await this.smartContract.accountDeposit(balance);
        }

        const clusterStatus = await this.smartContract.clusterGet(Number(clusterId));
        const bucketSize = BigInt(Math.round(Number(resource * 1000n) / clusterStatus.cluster.vnodes.length));
        await this.smartContract.bucketAllocIntoCluster(event.bucketId, bucketSize);

        return event;
    }

    async accountDeposit(balance: bigint) {
        await this.smartContract.accountDeposit(balance);
    }

    async bucketAllocIntoCluster(bucketId: bigint, resource: bigint) {
        const bucketStatus = await this.bucketGet(bucketId);
        const clusterStatus = await this.smartContract.clusterGet(bucketStatus.bucket.cluster_id);

        const total =
            BigInt(bucketStatus.bucket.resource_reserved * clusterStatus.cluster.vnodes.length) / 1000n + resource;
        if (total > MAX_BUCKET_SIZE) {
            throw new Error(`Exceed bucket size. Should be less than ${MAX_BUCKET_SIZE}`);
        }

        const resourceToAlloc = BigInt((Number(resource * 1000n) / clusterStatus.cluster.vnodes.length) | 0);
        await this.smartContract.bucketAllocIntoCluster(bucketId, resourceToAlloc);
    }

    async bucketGet(bucketId: bigint): Promise<BucketStatus> {
        return this.smartContract.bucketGet(bucketId);
    }

    async bucketList(offset: bigint, limit: bigint, filterOwnerId?: string): Promise<BucketStatusList> {
        return this.smartContract.bucketList(offset, limit, filterOwnerId);
    }

    async createSession(params: CreateSessionParams): Promise<Uint8Array> {
        return this.caStorage.createSession(params);
    }

    async store(bucketId: bigint, fileOrPiece: File | Piece, options: StoreOptions = {}): Promise<DdcUri> {
        if (options.encrypt) {
            return this.storeEncrypted(bucketId, fileOrPiece, options);
        } else {
            return this.storeUnencrypted(bucketId, fileOrPiece);
        }
    }

    private async storeEncrypted(bucketId: bigint, fileOrPiece: File | Piece, options: StoreOptions): Promise<DdcUri> {
        const dek = DdcClient.buildHierarchicalDekHex(this.masterDek, options.dekPath);
        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        const edek = nacl.box(dek, nonce, this.boxKeypair.publicKey, this.boxKeypair.secretKey);

        //ToDo need better structure to store keys
        await this.caStorage.store(
            bucketId,
            new Piece(edek, [
                new Tag(NONCE_TAG, nonce),
                new Tag(ENCRYPTOR_TAG, u8aToHex(this.boxKeypair.publicKey)),
                new Tag('Key', `${bucketId}/${options.dekPath || ''}/${u8aToHex(this.boxKeypair.publicKey)}`),
            ]),
        );

        const encryptionOptions = {dekPath: options.dekPath || '', dek: dek};
        if (Piece.isPiece(fileOrPiece)) {
            const pieceUri = await this.caStorage.storeEncrypted(bucketId, fileOrPiece, encryptionOptions);
            return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IPIECE);
        } else {
            const pieceUri = await this.fileStorage.uploadEncrypted(
                bucketId,
                fileOrPiece.data as any,
                fileOrPiece.tags,
                encryptionOptions,
            );
            return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IFILE);
        }
    }

    private async storeUnencrypted(bucketId: bigint, fileOrPiece: File | Piece): Promise<DdcUri> {
        if (Piece.isPiece(fileOrPiece)) {
            const pieceUri = await this.caStorage.store(bucketId, fileOrPiece);
            return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IPIECE);
        } else {
            const pieceUri = await this.fileStorage.upload(bucketId, fileOrPiece.data as any, fileOrPiece.tags);
            return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IFILE);
        }
    }

    async read(ddcUri: DdcUri, options: ReadOptions = {}, session?: Uint8Array): Promise<File | Piece> {
        if (ddcUri.protocol) {
            const pieceUri = new PieceUri(BigInt(ddcUri.bucket), ddcUri.path as string);
            const piece = await this.caStorage.read(pieceUri.bucketId, pieceUri.cid, session);
            if (ddcUri.protocol === IPIECE) {
                if (options.decrypt) {
                    const dek = await this.findDek(ddcUri, piece, options, session);
                    piece.data = this.caStorage.cipher.decrypt(piece.data, dek);
                }

                return piece;
            } else if (ddcUri.protocol === IFILE) {
                return this.readByPieceUri(ddcUri, piece, options, session);
            }

            throw new Error(`Unsupported URL for read: ${ddcUri.toString()}`);
        }

        const headPiece = await this.caStorage.read(BigInt(ddcUri.bucket), ddcUri.path as string, session);
        return this.readByPieceUri(ddcUri, headPiece, options, session);
    }

    private async readByPieceUri(
        ddcUri: DdcUri,
        headPiece: Piece,
        options: ReadOptions,
        session?: Uint8Array,
    ): Promise<File | Piece> {
        const isEncrypted = headPiece.tags.filter((t) => t.keyString == DEK_PATH_TAG).length > 0;

        //TODO 4. put into DEK cache
        const dek = await this.findDek(ddcUri, headPiece, options, session);

        if (headPiece.links.length > 0) {
            const data =
                isEncrypted && options.decrypt
                    ? this.fileStorage.readDecryptedLinks(ddcUri.bucket as bigint, headPiece.links, dek, session)
                    : this.fileStorage.readLinks(ddcUri.bucket as bigint, headPiece.links, session);

            return new File(data, headPiece.tags, ddcUri.path as string);
        } else {
            if (isEncrypted && options.decrypt) {
                headPiece.data = this.caStorage.cipher.decrypt(headPiece.data, dek);
            }

            return headPiece;
        }
    }

    async search(query: Query): Promise<Array<Piece>> {
        return await this.caStorage.search(query).then((s) => s.pieces);
    }

    async shareData(bucketId: bigint, dekPath: string, partnerBoxPublicKey: string): Promise<DdcUri> {
        const dek = DdcClient.buildHierarchicalDekHex(this.masterDek, dekPath);
        const partnerEdek = nacl.box(dek, emptyNonce, hexToU8a(partnerBoxPublicKey), this.boxKeypair.secretKey);

        const pieceUri = await this.caStorage.store(
            bucketId,
            new Piece(partnerEdek, [
                new Tag(ENCRYPTOR_TAG, u8aToHex(this.boxKeypair.publicKey)),
                new Tag('Key', `${bucketId}/${dekPath}/${partnerBoxPublicKey}`),
            ]),
        );
        return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IPIECE);
    }

    private async findDek(
        ddcUri: DdcUri,
        piece: Piece,
        options: ReadOptions,
        session?: Uint8Array,
    ): Promise<Uint8Array> {
        if (options.decrypt) {
            const dekPath = piece.tags.find((t) => t.keyString == DEK_PATH_TAG)?.valueString;
            if (dekPath == null) {
                throw new Error(`Piece=${ddcUri} doesn't have dekPath`);
            } else if (!dekPath.startsWith(options.dekPath! + '/') && dekPath !== options.dekPath!) {
                throw new Error(
                    `Provided dekPath='${options.dekPath}' doesn't correct for piece with dekPath='${dekPath}'`,
                );
            }

            const clientDek = await this.downloadDek(ddcUri.bucket as bigint, options.dekPath!, session);

            return DdcClient.buildHierarchicalDekHex(
                clientDek,
                dekPath.replace(options.dekPath!, '').replace(/^\//, ''),
            );
        }

        return new Uint8Array();
    }

    private async downloadDek(bucketId: bigint, dekPath: string, session?: Uint8Array): Promise<Uint8Array> {
        const piece = await this.kvStorage
            .read(bucketId, `${bucketId}/${dekPath}/${u8aToHex(this.boxKeypair.publicKey)}`, undefined, session)
            .then((values) => {
                if (values.length == 0) {
                    return Promise.reject('Client EDEK not found');
                }

                return values[0];
            });

        const encryptor = piece.tags.find((e) => e.keyString === ENCRYPTOR_TAG)?.valueString;
        if (!encryptor) {
            throw new Error("EDEK doesn't contains encryptor public key");
        }

        const nonce = piece.tags.find((t) => t.keyString === NONCE_TAG)?.value ?? emptyNonce;

        const result = nacl.box.open(piece.data, nonce, hexToU8a(encryptor), this.boxKeypair.secretKey);
        if (result == null) {
            throw new Error('Unable to decrypt dek');
        }

        return result;
    }

    private static buildHierarchicalDekHex(dek: Uint8Array, dekPath?: string): Uint8Array {
        if (!dekPath) {
            return dek;
        }

        const pathParts = dekPath.split('/');

        for (const part of pathParts) {
            const postfix = stringToU8a(part);

            const data = new Uint8Array(dek.length + postfix.length);
            data.set(dek);
            data.set(postfix, dek.length);

            dek = blake2AsU8a(data);
        }

        return dek;
    }
}
