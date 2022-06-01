import {CidBuilder, CipherInterface, DefaultCipher, Scheme, SchemeInterface} from "@cere-ddc-sdk/core";
import {ContentAddressableStorage, Piece, PieceUri, Query} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorage, FileStorageConfig} from "@cere-ddc-sdk/file-storage";
import {
    BucketCreatedEvent,
    BucketPermissionGrantedEvent,
    BucketPermissionRevokedEvent,
    Permission,
    SmartContract,
} from "@cere-ddc-sdk/smart-contract";
import {blake2AsHex, naclBoxKeypairFromSecret, naclKeypairFromString} from "@polkadot/util-crypto";
import {KeyValueStorage} from "@cere-ddc-sdk/key-value-storage/src";
import {DdcClientInterface} from "./DdcClient.interface";
import {ClientOptions} from "./options/ClientOptions";
import {StoreOptions} from "./options/StoreOptions";
import {SearchOptions} from "./options/SearchOptions";
import {ReadOptions} from "./options/ReadOptions";
import {BoxKeyPair} from "tweetnacl";
import {u8aToHex} from "@polkadot/util";
import {SchemeType} from "packages/core/src/crypto/signature/Scheme";
import {Object} from "./model/Object";

const nacl = require("tweetnacl");
const emptyNonce = new Uint8Array(nacl.box.nonceLength)

export class DdcClient implements DdcClientInterface {
    mnemonic: string;
    smartContract: SmartContract
    scheme: SchemeInterface;
    cipher: CipherInterface;
    options: ClientOptions;
    cidBuilder: CidBuilder;

    caStorage: ContentAddressableStorage;
    kvStorage: KeyValueStorage;
    fileStorage: FileStorage;

    masterDek: string;
    boxKeypair: BoxKeyPair

    private constructor(
        mnemonic: string,
        smartContract: SmartContract,
        scheme: SchemeInterface,
        cipher: CipherInterface,
        options: ClientOptions = {},
    ) {
        this.mnemonic = mnemonic;
        this.smartContract = smartContract;
        this.scheme = scheme;
        this.cipher = cipher;
        this.options = options;
        this.cidBuilder = options.cidBuilder || new CidBuilder();

        //ToDO gateway discovery
        this.caStorage = new ContentAddressableStorage(scheme, "", cipher, this.cidBuilder)
        this.kvStorage = new KeyValueStorage(scheme, "")
        this.fileStorage = new FileStorage(scheme, "", new FileStorageConfig(options.pieceConcurrency, options.chunkSizeInBytes), options.cipher, this.cidBuilder)

        this.masterDek = blake2AsHex(mnemonic)
        this.boxKeypair = naclBoxKeypairFromSecret(naclKeypairFromString(mnemonic).secretKey)
    }

    static async buildAndConnect(mnemonic: string, options: ClientOptions = {}): Promise<DdcClient> {
        const smartContract = await SmartContract.buildAndConnect(mnemonic, options.smartContract)
        const scheme = (typeof options.scheme === "string") ? await Scheme.createScheme(options.scheme as SchemeType, mnemonic) : options.scheme!
        const cipher = options.cipher || new DefaultCipher(mnemonic)

        return new DdcClient(mnemonic, smartContract, scheme, cipher, options)
    }

    async createBucket(balance: bigint, bucketParams: string, clusterId: bigint): Promise<BucketCreatedEvent> {
        return this.smartContract.bucketCreate(balance, bucketParams, clusterId)
    }

    async grantBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent> {
        return this.smartContract.bucketGrantPermission(bucketId, grantee, permission)
    }

    async revokeBucketPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent> {
        return this.smartContract.bucketRevokePermission(bucketId, grantee, permission)
    }

    async store(bucketId: bigint, record: Object, options: StoreOptions = {}): Promise<PieceUri> {
        if (options.encrypt) {
            return this.storeEncrypted(bucketId, record, options)
        } else {
            return this.storeUnencrypted(bucketId, record)
        }
    }

    private async storeEncrypted(bucketId: bigint, record: Object, options: StoreOptions) {
        let dek = DdcClient.buildHierarchicalDekHex(this.masterDek, options.dekPath)
        let edek = nacl.box(dek, emptyNonce, this.boxKeypair.publicKey, this.boxKeypair.secretKey)
        await this.kvStorage.store(bucketId, `${bucketId}/${options.dekPath}/${u8aToHex(this.boxKeypair.publicKey)}`, new Piece(edek))

        const encryptionOptions = {dekPath: options.dekPath || "", dek: dek};
        if (record.isPiece(this.options.chunkSizeInBytes!)) {
            const piece = new Piece(record.data as Uint8Array, record.tags);
            return await this.caStorage.storeEncrypted(bucketId, piece, encryptionOptions);
        } else {
            return await this.fileStorage.uploadEncrypted(bucketId, record.data, encryptionOptions)
        }
    }

    private async storeUnencrypted(bucketId: bigint, record: Object) {
        if (record.isPiece(this.options.chunkSizeInBytes!)) {
            const piece = new Piece(record.data as Uint8Array, record.tags);
            return await this.caStorage.store(bucketId, piece)
        } else {
            return await this.fileStorage.upload(bucketId, record.data)
        }
    }

    async read(pieceUri: PieceUri, options: ReadOptions = {}): Promise<Object> {
        const headPiece = await this.caStorage.read(pieceUri.bucketId, pieceUri.cid);
        const isMultipart = headPiece.tags.filter(t => t.key == "multipart" && t.value == "true").length > 0;
        const isEncrypted = headPiece.tags.filter(t => t.key == "encrypted" && t.value == "true").length > 0;

        //TODO 4. Decrypt EDEK using client private key and put into DEK cache
        let objectDek = "";
        if (options.decrypt) {
            const dekPath = headPiece.tags.find(t => t.key == "dekPath")?.value;
            if (dekPath == null) {
                throw new Error(`Piece=${pieceUri} doesn't have dekPath`);
            } else if (!dekPath.startsWith(dekPath)) {
                throw new Error(`Provided dekPath='${options.dekPath}' doesn't correct for piece with dekPath='${dekPath}'`);
            }

            const clientDek = await this.readDek(pieceUri.bucketId, options.dekPath!);

            objectDek = DdcClient.buildHierarchicalDekHex(u8aToHex(clientDek), dekPath.replace(options.dekPath!, ""))
        }

        if (headPiece.tags.length > 0 && isMultipart) {
            const data = isEncrypted
                ? this.fileStorage.readDecryptedLinks(pieceUri.bucketId, headPiece.links, objectDek)
                : this.fileStorage.readLinks(pieceUri.bucketId, headPiece.links)

            return new Object(data, headPiece.tags, pieceUri.cid)
        } else {
            const record = new Object(headPiece.data, headPiece.tags, pieceUri.cid)
            if (isEncrypted) {
                record.data = this.cipher!.decrypt(headPiece.data, objectDek)
            }

            return record
        }
    }

    async search(query: Query, options: SearchOptions = {}): Promise<Array<Object>> {
        //TODO
        return Promise.resolve(Array())
    }

    async shareData(bucketId: bigint, dekPath: string, partnerBoxPublicKey: string): Promise<PieceUri> {
        const dek = await this.readDek(bucketId, dekPath);
        const partnerEdek = nacl.box(dek, emptyNonce, partnerBoxPublicKey, this.boxKeypair.secretKey)

        return await this.kvStorage.store(bucketId, `${bucketId}/${dekPath}/${partnerBoxPublicKey}`, partnerEdek)
    }

    private async readDek(bucketId: bigint, dekPath: string): Promise<Uint8Array> {
        const values = await this.kvStorage.read(bucketId, `${bucketId}/${dekPath}/${u8aToHex(this.boxKeypair.publicKey)}`)
        if (values.length == 0) {
            return Promise.reject("Client EDEK not found")
        }

        return nacl.box.open(values[0].data, emptyNonce, this.boxKeypair.publicKey, this.boxKeypair.secretKey)
    }

    private static buildHierarchicalDekHex(dekHex: string, dekPath?: string): string {
        if (!dekPath) {
            return dekHex
        }

        const pathParts = dekPath.split("/")

        for (const part in pathParts) {
            dekHex = blake2AsHex(dekHex + part)
        }

        return dekHex
    }
}
