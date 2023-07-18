import {blake2AsU8a, naclBoxPairFromSecret} from '@polkadot/util-crypto';
import nacl, {BoxKeyPair} from 'tweetnacl';
import {hexToU8a, stringToU8a, u8aToHex} from '@polkadot/util';
import {DdcUri, IFILE, IPIECE, isSchemeName, RequiredSelected, Scheme} from '@cere-ddc-sdk/core';
import {SmartContract} from '@cere-ddc-sdk/smart-contract';
import {FileStorage} from '@cere-ddc-sdk/file-storage';
import {KeyValueStorage} from '@cere-ddc-sdk/key-value-storage';
import {
    ContentAddressableStorage,
    DEK_PATH_TAG,
    Piece,
    PieceUri,
    Query,
    SearchOptions,
    Session,
    Tag,
} from '@cere-ddc-sdk/content-addressable-storage';
import {
    BucketParams,
    BucketStatus,
    ClusterId,
    Balance,
    Resource,
    BucketId,
    AccountId,
    Offset,
} from '@cere-ddc-sdk/smart-contract/types';

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
        this.boxKeypair = naclBoxPairFromSecret(
            nacl.box.keyPair.fromSecretKey(getNaclBoxSecret(encryptionSecretPhrase)).secretKey,
        );
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
        await Promise.all([this.caStorage.disconnect(), this.smartContract.disconnect()]);
    }

    async createBucket(
        balance: Balance,
        resource: Resource,
        clusterId: ClusterId,
        bucketParams?: BucketParams,
    ): Promise<Pick<BucketStatus, 'bucketId'>> {
        if (resource > MAX_BUCKET_SIZE) {
            throw new Error(`Exceed bucket size. Should be less than ${MAX_BUCKET_SIZE}`);
        } else if (resource <= 0) {
            resource = 1n;
        }

        const bucketId = await this.smartContract.bucketCreate(
            this.caStorage.scheme.publicKeyHex,
            clusterId,
            bucketParams,
        );

        if (balance > 0) {
            await this.smartContract.accountDeposit(balance);
        }

        const clusterStatus = await this.smartContract.clusterGet(Number(clusterId));
        const bucketSize = BigInt(Math.round(Number(resource * 1000n) / clusterStatus.cluster.nodeIds.length));
        await this.smartContract.bucketAllocIntoCluster(bucketId, bucketSize);

        return {bucketId};
    }

    async accountDeposit(balance: bigint) {
        await this.smartContract.accountDeposit(balance);
    }

    async bucketAllocIntoCluster(bucketId: BucketId, resource: Resource) {
        const {bucket} = await this.bucketGet(bucketId);
        const clusterStatus = await this.smartContract.clusterGet(bucket.clusterId);
        const total = (bucket.resourceReserved * BigInt(clusterStatus.cluster.nodeIds.length)) / 1000n + resource;

        if (total > MAX_BUCKET_SIZE) {
            throw new Error(`Exceed bucket size. Should be less than ${MAX_BUCKET_SIZE}`);
        }

        const resourceToAlloc = BigInt((Number(resource * 1000n) / clusterStatus.cluster.nodeIds.length) | 0);
        await this.smartContract.bucketAllocIntoCluster(bucketId, resourceToAlloc);
    }

    async bucketGet(bucketId: bigint): Promise<BucketStatus> {
        return this.smartContract.bucketGet(bucketId);
    }

    async bucketList(
        offset: Offset,
        limit: Offset,
        filterOwnerId?: AccountId,
    ): Promise<readonly [BucketStatus[], Offset]> {
        return this.smartContract.bucketList(offset, limit, filterOwnerId);
    }

    async createSession(session?: Session): Promise<Uint8Array> {
        return this.caStorage.createSession(session);
    }

    async store(bucketId: bigint, fileOrPiece: File | Piece, options: StoreOptions = {}): Promise<DdcUri> {
        if (options.encrypt) {
            return this.storeEncrypted(bucketId, fileOrPiece, options);
        } else {
            return this.storeUnencrypted(bucketId, fileOrPiece, options);
        }
    }

    private async storeEncrypted(
        bucketId: bigint,
        fileOrPiece: File | Piece,
        options: StoreOptions = {},
    ): Promise<DdcUri> {
        const dek = DdcClient.buildHierarchicalDekHex(this.masterDek, options.dekPath);
        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        const edek = nacl.box(dek, nonce, this.boxKeypair.publicKey, this.boxKeypair.secretKey);

        //TODO: need better structure to store keys
        const edekPiece = new Piece(edek, [
            new Tag(NONCE_TAG, nonce),
            new Tag(ENCRYPTOR_TAG, u8aToHex(this.boxKeypair.publicKey)),
            new Tag('Key', `${bucketId}/${options.dekPath || ''}/${u8aToHex(this.boxKeypair.publicKey)}`),
        ]);

        await this.caStorage.store(bucketId, edekPiece, options);

        const encryptionOptions = {dekPath: options.dekPath || '', dek: dek};

        if (Piece.isPiece(fileOrPiece)) {
            const pieceUri = await this.caStorage.storeEncrypted(bucketId, fileOrPiece, encryptionOptions, options);

            return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IPIECE);
        } else {
            const pieceUri = await this.fileStorage.uploadEncrypted(
                bucketId,
                fileOrPiece.data as any,
                fileOrPiece.tags,
                encryptionOptions,
                options,
            );

            return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IFILE);
        }
    }

    private async storeUnencrypted(
        bucketId: bigint,
        fileOrPiece: File | Piece,
        options: StoreOptions = {},
    ): Promise<DdcUri> {
        if (Piece.isPiece(fileOrPiece)) {
            const pieceUri = await this.caStorage.store(bucketId, fileOrPiece, options);
            return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IPIECE);
        } else {
            const pieceUri = await this.fileStorage.upload(
                bucketId,
                fileOrPiece.data as any,
                fileOrPiece.tags,
                options,
            );

            return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IFILE);
        }
    }

    async read(ddcUri: DdcUri, options: ReadOptions = {}): Promise<File | Piece> {
        if (ddcUri.protocol) {
            const pieceUri = new PieceUri(BigInt(ddcUri.bucket), ddcUri.path as string);
            const piece = await this.caStorage.read(pieceUri.bucketId, pieceUri.cid, options);

            if (ddcUri.protocol === IPIECE) {
                if (options.decrypt) {
                    const dek = await this.findDek(ddcUri, piece, options);
                    piece.data = this.caStorage.cipher.decrypt(piece.data, dek);
                }

                return piece;
            } else if (ddcUri.protocol === IFILE) {
                return this.readByPieceUri(ddcUri, piece, options);
            }

            throw new Error(`Unsupported URL for read: ${ddcUri.toString()}`);
        }

        const headPiece = await this.caStorage.read(BigInt(ddcUri.bucket), ddcUri.path as string, options);

        return this.readByPieceUri(ddcUri, headPiece, options);
    }

    async search(query: Query, options: SearchOptions = {}): Promise<Array<Piece>> {
        return this.caStorage.search(query, options).then((result) => result.pieces);
    }

    async shareData(
        bucketId: bigint,
        dekPath: string,
        partnerBoxPublicKey: string,
        options: StoreOptions = {},
    ): Promise<DdcUri> {
        const dek = DdcClient.buildHierarchicalDekHex(this.masterDek, dekPath);
        const partnerEdek = nacl.box(dek, emptyNonce, hexToU8a(partnerBoxPublicKey), this.boxKeypair.secretKey);
        const edekPiece = new Piece(partnerEdek, [
            new Tag(ENCRYPTOR_TAG, u8aToHex(this.boxKeypair.publicKey)),
            new Tag('Key', `${bucketId}/${dekPath}/${partnerBoxPublicKey}`),
        ]);

        const pieceUri = await this.caStorage.store(bucketId, edekPiece, options);

        return DdcUri.build(pieceUri.bucketId, pieceUri.cid, IPIECE);
    }

    private async readByPieceUri(ddcUri: DdcUri, headPiece: Piece, options: ReadOptions): Promise<File | Piece> {
        const isEncrypted = headPiece.tags.filter((t) => t.keyString == DEK_PATH_TAG).length > 0;

        // TODO 4. put into DEK cache
        const dek = await this.findDek(ddcUri, headPiece, options);

        if (headPiece.links.length > 0) {
            const data =
                isEncrypted && options.decrypt
                    ? this.fileStorage.readDecryptedLinks(ddcUri.bucket as bigint, headPiece.links, dek, options)
                    : this.fileStorage.readLinks(ddcUri.bucket as bigint, headPiece.links, options);

            return new File(data, headPiece.tags, ddcUri.path as string);
        }

        if (isEncrypted && options.decrypt) {
            headPiece.data = this.caStorage.cipher.decrypt(headPiece.data, dek);
        }

        return headPiece;
    }

    private async findDek(ddcUri: DdcUri, piece: Piece, options: ReadOptions): Promise<Uint8Array> {
        if (options.decrypt) {
            const dekPath = piece.tags.find((t) => t.keyString == DEK_PATH_TAG)?.valueString;

            if (dekPath == null) {
                throw new Error(`Piece=${ddcUri} doesn't have dekPath`);
            }

            if (!dekPath.startsWith(options.dekPath! + '/') && dekPath !== options.dekPath!) {
                throw new Error(
                    `Provided dekPath='${options.dekPath}' doesn't correct for piece with dekPath='${dekPath}'`,
                );
            }

            const clientDek = await this.downloadDek(ddcUri.bucket as bigint, options.dekPath!, options);

            return DdcClient.buildHierarchicalDekHex(
                clientDek,
                dekPath.replace(options.dekPath!, '').replace(/^\//, ''),
            );
        }

        return new Uint8Array();
    }

    private async downloadDek(bucketId: bigint, dekPath: string, options: ReadOptions = {}): Promise<Uint8Array> {
        const piece = await this.kvStorage
            .read(bucketId, `${bucketId}/${dekPath}/${u8aToHex(this.boxKeypair.publicKey)}`, {
                ...options,
                skipData: false,
            })
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
