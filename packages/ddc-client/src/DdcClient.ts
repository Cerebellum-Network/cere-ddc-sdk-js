import {DdcUriParser, Scheme, SchemeName} from "@cere-ddc-sdk/core";
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
import {PieceArray} from "./model/PieceArray.js";

//ToDo generate from random for security
const emptyNonce = new Uint8Array(nacl.box.nonceLength);

const encryptorTag = "encryptor";
const ddcUriParser = new DdcUriParser();

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

    async createBucket(balance: bigint, bucketParams: string, clusterId: bigint): Promise<BucketCreatedEvent> {
        return this.smartContract.bucketCreate(balance, bucketParams, clusterId)
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

    async store(bucketId: bigint, pieceArray: PieceArray, options: StoreOptions = {}): Promise<PieceUri> {
        if (options.encrypt) {
            return this.storeEncrypted(bucketId, pieceArray, options);
        } else {
            return this.storeUnencrypted(bucketId, pieceArray);
        }
    }

    private async storeEncrypted(bucketId: bigint, pieceArray: PieceArray, options: StoreOptions) {
        let dek = DdcClient.buildHierarchicalDekHex(this.masterDek, options.dekPath);
        //ToDo can be random (Nacl ScaleBox). We need to decide if we need store publickey of user who created edek or shared
        let edek = nacl.box(dek, emptyNonce, this.boxKeypair.publicKey, this.boxKeypair.secretKey);

        //ToDo need better structure to store keys
        await this.caStorage.store(bucketId, new Piece(edek, [new Tag(encryptorTag, u8aToHex(this.boxKeypair.publicKey)), new Tag("Key", `${bucketId}/${options.dekPath || ""}/${u8aToHex(this.boxKeypair.publicKey)}`)]))

        const encryptionOptions = {dekPath: options.dekPath || "", dek: dek};
        if (pieceArray.isMultipart(this.options.fileOptions?.pieceSizeInBytes!)) {
            return await this.fileStorage.uploadEncrypted(bucketId, pieceArray.data, pieceArray.tags, encryptionOptions);
        } else {
            const piece = new Piece(pieceArray.data as Uint8Array, pieceArray.tags);
            return await this.caStorage.storeEncrypted(bucketId, piece, encryptionOptions);
        }
    }

    private async storeUnencrypted(bucketId: bigint, pieceArray: PieceArray) {
        if (pieceArray.isMultipart(this.options.fileOptions?.pieceSizeInBytes!)) {
            return await this.fileStorage.upload(bucketId, pieceArray.data, pieceArray.tags);
        } else {
            const piece = new Piece(pieceArray.data as Uint8Array, pieceArray.tags);
            return await this.caStorage.store(bucketId, piece);

        }
    }

    async read(url: string | URL, options: ReadOptions): Promise<PieceArray>
    async read(pieceUri: PieceUri, options?: ReadOptions): Promise<PieceArray>
    async read(pieceUriOrUrl: PieceUri | URL | string, options: ReadOptions = {}): Promise<PieceArray> {
        if (pieceUriOrUrl instanceof URL || typeof pieceUriOrUrl === "string") {
            const ddcUri = ddcUriParser.parse(pieceUriOrUrl);

            const pieceUri = new PieceUri(BigInt(ddcUri.bucket), ddcUri.path as string);
            const piece = await this.caStorage.read(pieceUri.bucketId, pieceUri.cid);
            if (ddcUri.protocol === "ipiece") {
                if (options.decrypt) {
                    const dek = await this.findDek(pieceUri, piece, options);
                    piece.data = this.caStorage.cipher!.decrypt(piece.data, dek);
                }

                return new PieceArray(piece.data, piece.tags, piece.cid);
            } else if (ddcUri.protocol === "ifile") {
                return this.readByPieceUri(pieceUri, piece, options);
            }

            throw new Error(`Unsupported URL for read: ${pieceUriOrUrl}`)
        }

        const headPiece = await this.caStorage.read(pieceUriOrUrl.bucketId, pieceUriOrUrl.cid);
        return this.readByPieceUri(pieceUriOrUrl, headPiece, options);
    }

    private async readByPieceUri(pieceUri: PieceUri, headPiece: Piece, options: ReadOptions): Promise<PieceArray> {
        const isEncrypted = headPiece.tags.filter(t => t.key == DEK_PATH_TAG).length > 0;

        //TODO 4. put into DEK cache
        const dek = await this.findDek(pieceUri, headPiece, options);

        if (headPiece.links.length > 0) {
            const data = isEncrypted && options.decrypt
                ? this.fileStorage.readDecryptedLinks(pieceUri.bucketId, headPiece.links, dek)
                : this.fileStorage.readLinks(pieceUri.bucketId, headPiece.links)

            return new PieceArray(data, headPiece.tags, pieceUri.cid)
        } else {
            const record = new PieceArray(headPiece.data, headPiece.tags, pieceUri.cid)
            if (isEncrypted && options.decrypt) {
                record.data = this.caStorage.cipher!.decrypt(headPiece.data, dek)
            }

            return record
        }
    }

    async search(query: Query): Promise<Array<PieceArray>> {
        const pieces = await this.caStorage.search(query).then(s => s.pieces);
        return pieces.map(p => new PieceArray(p.data, p.tags, p.cid))
    }

    async shareData(bucketId: bigint, dekPath: string, partnerBoxPublicKey: string): Promise<PieceUri> {
        const dek = DdcClient.buildHierarchicalDekHex(this.masterDek, dekPath);
        const partnerEdek = nacl.box(dek, emptyNonce, hexToU8a(partnerBoxPublicKey), this.boxKeypair.secretKey);

        return await this.caStorage.store(bucketId, new Piece(partnerEdek, [new Tag(encryptorTag, u8aToHex(this.boxKeypair.publicKey)), new Tag("Key", `${bucketId}/${dekPath}/${partnerBoxPublicKey}`)]));
    }

    private async findDek(pieceUri: PieceUri, piece: Piece, options: ReadOptions): Promise<Uint8Array> {
        if (options.decrypt) {
            const dekPath = piece.tags.find(t => t.key == DEK_PATH_TAG)?.value;
            if (dekPath == null) {
                throw new Error(`Piece=${pieceUri} doesn't have dekPath`);
            } else if (!dekPath.startsWith(options.dekPath! + "/") && dekPath !== options.dekPath!) {
                throw new Error(`Provided dekPath='${options.dekPath}' doesn't correct for piece with dekPath='${dekPath}'`);
            }

            const clientDek = await this.downloadDek(pieceUri.bucketId, options.dekPath!);

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

    private static parseUrl(url: URL) {

    }
}
