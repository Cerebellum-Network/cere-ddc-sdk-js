import {DdcUri, Scheme, SchemeName, IFILE, IPIECE} from "@cere-ddc-sdk/core";
import {
    ContentAddressableStorage,
    DEK_PATH_TAG,
    Piece,
    PieceUri,
    Query,
    Tag
} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorage} from "@cere-ddc-sdk/file-storage";
import {BucketCreatedEvent, BucketStatus, BucketStatusList, SmartContract} from "@cere-ddc-sdk/smart-contract";
import {blake2AsU8a, naclBoxKeypairFromSecret, naclKeypairFromString} from "@polkadot/util-crypto";
import {KeyValueStorage} from "@cere-ddc-sdk/key-value-storage";
import {DdcClientInterface} from "./DdcClient.interface.js";
import {ClientOptions, initDefaultOptions} from "./options/ClientOptions.js";
import {StoreOptions} from "./options/StoreOptions.js";
import {ReadOptions} from "./options/ReadOptions.js";
import nacl, {BoxKeyPair} from "tweetnacl";
import {hexToU8a, stringToU8a, u8aToHex} from "@polkadot/util";
import {File} from "./model/File.js";
import {BucketParams} from "@cere-ddc-sdk/smart-contract";

//ToDo generate from random for security
const emptyNonce = new Uint8Array(nacl.box.nonceLength);

const encryptorTag = "encryptor";

export class DdcClient implements DdcClientInterface {
    readonly smartContract: SmartContract
    readonly options: ClientOptions;

    readonly caStorage: ContentAddressableStorage;
    readonly kvStorage: KeyValueStorage;
    readonly fileStorage: FileStorage;

    readonly masterDek: Uint8Array;
    readonly boxKeypair: BoxKeyPair

    protected constructor(
        caStorage: ContentAddressableStorage,
        smartContract: SmartContract,
        options: ClientOptions,
        encryptionSecretPhrase: string,
    ) {
        this.smartContract = smartContract;
        this.options = options;

        this.caStorage = caStorage;
        this.kvStorage = new KeyValueStorage(caStorage);
        this.fileStorage = new FileStorage(caStorage, options.fileOptions);

        this.masterDek = blake2AsU8a(encryptionSecretPhrase);
        this.boxKeypair = naclBoxKeypairFromSecret(naclKeypairFromString(encryptionSecretPhrase).secretKey);
    }

    static async buildAndConnect(options: ClientOptions, secretPhrase: string, encryptionSecretPhrase: string): Promise<DdcClient>
    static async buildAndConnect(options: ClientOptions, secretPhrase: string): Promise<DdcClient>
    static async buildAndConnect(options: ClientOptions, secretPhrase: string, encryptionSecretPhrase?: string): Promise<DdcClient> {
        encryptionSecretPhrase = encryptionSecretPhrase != null ? encryptionSecretPhrase : secretPhrase;
        options = initDefaultOptions(options);

        const scheme = (typeof options.scheme === "string") ? await Scheme.createScheme(options.scheme as SchemeName, secretPhrase) : options.scheme!
        const smartContract = await SmartContract.buildAndConnect(secretPhrase, options.smartContract);
        const caStorage = await ContentAddressableStorage.build({
            clusterAddress: options.clusterAddress,
            smartContract: options.smartContract,
            scheme: scheme,
            cipher: options.cipher,
            cidBuilder: options.cidBuilder
        }, secretPhrase);

        return new DdcClient(caStorage, smartContract, options, encryptionSecretPhrase);
    }

    async disconnect() {
        return await this.smartContract.disconnect();
    }

    async createBucket(balance: bigint, clusterId: bigint, bucketParams?: BucketParams): Promise<BucketCreatedEvent> {
        return this.smartContract.bucketCreate(balance, clusterId, bucketParams)
    }

    /*    async grantBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent> {
            return this.smartContract.bucketGrantPermission(bucketId, grantee, permission)
        }

        async revokeBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent> {
            return this.smartContract.bucketRevokePermission(bucketId, grantee, permission)
        }*/

    async bucketGet(bucketId: bigint): Promise<BucketStatus> {
        return this.smartContract.bucketGet(bucketId);
    }

    async bucketList(offset: bigint, limit: bigint, filterOwnerId?: string): Promise<BucketStatusList> {
        return this.smartContract.bucketList(offset, limit, filterOwnerId);
    }

    async store(bucketId: bigint, file: File, options?: StoreOptions): Promise<DdcUri>
    async store(bucketId: bigint, piece: Piece, options?: StoreOptions): Promise<DdcUri>
    async store(bucketId: bigint, fileOrPiece: File | Piece, options: StoreOptions = {}): Promise<DdcUri> {
        if (options.encrypt) {
            return this.storeEncrypted(bucketId, fileOrPiece, options);
        } else {
            return this.storeUnencrypted(bucketId, fileOrPiece);
        }
    }

    private async storeEncrypted(bucketId: bigint, fileOrPiece: File | Piece, options: StoreOptions): Promise<DdcUri> {
        let dek = DdcClient.buildHierarchicalDekHex(this.masterDek, options.dekPath);
        //ToDo can be random (Nacl ScaleBox). We need to decide if we need store publickey of user who created edek or shared
        let edek = nacl.box(dek, emptyNonce, this.boxKeypair.publicKey, this.boxKeypair.secretKey);

        //ToDo need better structure to store keys
        await this.caStorage.store(bucketId, new Piece(edek, [new Tag(encryptorTag, u8aToHex(this.boxKeypair.publicKey)), new Tag("Key", `${bucketId}/${options.dekPath || ""}/${u8aToHex(this.boxKeypair.publicKey)}`)]))

        const encryptionOptions = {dekPath: options.dekPath || "", dek: dek};
        if (Piece.isPiece(fileOrPiece)) {
            const pieceUri =  await this.caStorage.storeEncrypted(bucketId, fileOrPiece, encryptionOptions);
            return DdcUri.parse(pieceUri.bucketId, pieceUri.cid, IPIECE);
        } else {
            const pieceUri = await this.fileStorage.uploadEncrypted(bucketId, fileOrPiece.data, fileOrPiece.tags, encryptionOptions);
            return DdcUri.parse(pieceUri.bucketId, pieceUri.cid, IFILE);
        }
    }

    private async storeUnencrypted(bucketId: bigint, fileOrPiece: File | Piece): Promise<DdcUri> {
        if (Piece.isPiece(fileOrPiece)) {
            const pieceUri =  await this.caStorage.store(bucketId, fileOrPiece);
            return DdcUri.parse(pieceUri.bucketId, pieceUri.cid, IPIECE);
        } else {
            const pieceUri = await this.fileStorage.upload(bucketId, fileOrPiece.data, fileOrPiece.tags);
            return DdcUri.parse(pieceUri.bucketId, pieceUri.cid, IFILE);
        }
    }

    async read(ddcUri: DdcUri, options: ReadOptions = {}): Promise<File | Piece> {
        if (ddcUri.protocol) {
            const pieceUri = new PieceUri(BigInt(ddcUri.bucket), ddcUri.path as string);
            const piece = await this.caStorage.read(pieceUri.bucketId, pieceUri.cid);
            if (ddcUri.protocol === IPIECE) {
                if (options.decrypt) {
                    const dek = await this.findDek(ddcUri, piece, options);
                    piece.data = this.caStorage.cipher!.decrypt(piece.data, dek);
                }

                return piece;
            } else if (ddcUri.protocol === IFILE) {
                return this.readByPieceUri(ddcUri, piece, options);
            }

            throw new Error(`Unsupported URL for read: ${ddcUri.toString()}`)
        }

        const headPiece = await this.caStorage.read(ddcUri.bucket as bigint, ddcUri.path as string);
        return this.readByPieceUri(ddcUri, headPiece, options);
    }

    private async readByPieceUri(ddcUri: DdcUri, headPiece: Piece, options: ReadOptions): Promise<File | Piece> {
        const isEncrypted = headPiece.tags.filter(t => t.key == DEK_PATH_TAG).length > 0;

        //TODO 4. put into DEK cache
        const dek = await this.findDek(ddcUri, headPiece, options);

        if (headPiece.links.length > 0) {
            const data = isEncrypted && options.decrypt
                ? this.fileStorage.readDecryptedLinks(ddcUri.bucket as bigint, headPiece.links, dek)
                : this.fileStorage.readLinks(ddcUri.bucket as bigint, headPiece.links)

            return new File(data, headPiece.tags, ddcUri.path as string)
        } else {
            if (isEncrypted && options.decrypt) {
                headPiece.data = this.caStorage.cipher!.decrypt(headPiece.data, dek)
            }

            return headPiece
        }
    }

    async search(query: Query): Promise<Array<Piece>> {
        return await this.caStorage.search(query).then(s => s.pieces);
    }

    async shareData(bucketId: bigint, dekPath: string, partnerBoxPublicKey: string): Promise<DdcUri> {
        const dek = DdcClient.buildHierarchicalDekHex(this.masterDek, dekPath);
        const partnerEdek = nacl.box(dek, emptyNonce, hexToU8a(partnerBoxPublicKey), this.boxKeypair.secretKey);

        const pieceUri = await this.caStorage.store(bucketId, new Piece(partnerEdek, [new Tag(encryptorTag, u8aToHex(this.boxKeypair.publicKey)), new Tag("Key", `${bucketId}/${dekPath}/${partnerBoxPublicKey}`)]));
        return DdcUri.parse(pieceUri.bucketId, pieceUri.cid, IPIECE);
    }

    private async findDek(ddcUri: DdcUri, piece: Piece, options: ReadOptions): Promise<Uint8Array> {
        if (options.decrypt) {
            const dekPath = piece.tags.find(t => t.key == DEK_PATH_TAG)?.value;
            if (dekPath == null) {
                throw new Error(`Piece=${ddcUri} doesn't have dekPath`);
            } else if (!dekPath.startsWith(options.dekPath! + "/") && dekPath !== options.dekPath!) {
                throw new Error(`Provided dekPath='${options.dekPath}' doesn't correct for piece with dekPath='${dekPath}'`);
            }

            const clientDek = await this.downloadDek(ddcUri.bucket as bigint, options.dekPath!);

            return DdcClient.buildHierarchicalDekHex(clientDek, dekPath.replace(options.dekPath!, "").replace(/^\//, ""))
        }

        return new Uint8Array();
    }

    private async downloadDek(bucketId: bigint, dekPath: string): Promise<Uint8Array> {
        const piece = await this.kvStorage.read(bucketId, `${bucketId}/${dekPath}/${u8aToHex(this.boxKeypair.publicKey)}`)
            .then(values => {
                if (values.length == 0) {
                    return Promise.reject("Client EDEK not found");
                }

                return values[0]
            });

        const encryptor = piece.tags.find(e => e.key === encryptorTag)?.value;
        if (!encryptor) {
            throw new Error("EDEK doesn't contains encryptor public key")
        }

        const result = nacl.box.open(piece.data, emptyNonce, hexToU8a(encryptor), this.boxKeypair.secretKey);
        if (result == null) {
            throw new Error("Unable to decrypt dek");
        }

        return result;
    }

    private static buildHierarchicalDekHex(dek: Uint8Array, dekPath?: string): Uint8Array {
        if (!dekPath) {
            return dek
        }

        const pathParts = dekPath.split("/")

        for (const part of pathParts) {
            const postfix = stringToU8a(part);

            const data = new Uint8Array(dek.length + postfix.length);
            data.set(dek);
            data.set(postfix, dek.length);

            dek = blake2AsU8a(data)
        }

        return dek
    }
}
