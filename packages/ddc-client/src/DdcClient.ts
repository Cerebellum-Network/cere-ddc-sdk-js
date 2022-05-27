import {CidBuilder, CipherInterface, DefaultCipher, Scheme, SchemeInterface} from "@cere-ddc-sdk/core";
import {ContentAddressableStorage, Piece, PieceUri, Query, Tag} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorage} from "@cere-ddc-sdk/file-storage";
import {
    BucketCreatedEvent,
    BucketPermissionGrantedEvent,
    BucketPermissionRevokedEvent,
    SmartContract,
} from "@cere-ddc-sdk/smart-contract";
import {blake2AsHex, naclBoxKeypairFromSecret, naclKeypairFromString} from "@polkadot/util-crypto";
import {KeyValueStorage} from "@cere-ddc-sdk/key-value-storage/src";
import {DdcClientInterface} from "./DdcClient.interface";
import {ClientOptions} from "./options/ClientOptions";
import {StoreOptions} from "./options/StoreOptions";
import {SearchOptions} from "./options/SearchOptions";
import {ReadOptions} from "./options/ReadOptions";
import {Permission} from "@cere-ddc-sdk/smart-contract/dist/model/Permission";
import {BoxKeyPair} from "tweetnacl";
import {u8aToHex} from "@polkadot/util";

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
        cidBuilder: CidBuilder,

    ) {
        this.mnemonic = mnemonic;
        this.smartContract = smartContract;
        this.scheme = scheme;
        this.cipher = cipher;
        this.options = options;
        this.cidBuilder = cidBuilder;

        this.caStorage = new ContentAddressableStorage("", "")
        this.kvStorage = new KeyValueStorage("", "")
        this.fileStorage = new FileStorage("", "")

        this.masterDek = blake2AsHex(mnemonic)
        this.boxKeypair = naclBoxKeypairFromSecret(naclKeypairFromString(mnemonic).secretKey)
    }

    static async buildAndConnect(mnemonic: string, options: ClientOptions = {}): Promise<DdcClient> {
        const smartContract = await SmartContract.buildAndConnect(mnemonic, options.smartContract)
        const scheme = (options.scheme instanceof String) ? await Scheme.createScheme(options.scheme) : options.scheme
        const cipher = options.cipher || new DefaultCipher(mnemonic)
        const cidBuilder = new CidBuilder()

        return new DdcClient(mnemonic, smartContract, scheme, cipher, options, cidBuilder)
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

    // Encrypted flow:
    // 1. generate DEK Blake2b(master + dekPath)
    // 3. encrypt DEK by client public key (so using private key EDEK can be decrypted)
    // 4. upload EDEK as a separate piece using key (bucketId + dekPath + client public key)
    // 4. encrypt data in the piece by DEK
    // 5. upload encrypted piece
    // Unencrypted flow:
    // 1. upload piece
    // return piece uri (encrypted piece CID + bucketId)
    async store(bucketId: bigint, piece: Piece, options: StoreOptions = {}): Promise<PieceUri> {
        if (options.encrypt) {
            return this.storeEncrypted(bucketId, piece, options)
        } else {
            return this.storeUnencrypted(bucketId, piece)
        }
    }

    private async storeEncrypted(bucketId: bigint, piece: Piece, options: StoreOptions) {
        let dek = DdcClient.buildHierarchicalDekHex(this.masterDek, options.dekPath)
        let edek = nacl.box(dek, emptyNonce, this.boxKeypair.publicKey, this.boxKeypair.secretKey)
        await this.kvStorage.store(bucketId, `${bucketId}/${options.dekPath}/${u8aToHex(this.boxKeypair.publicKey)}`, new Piece(edek))

        piece.tags.push(new Tag("encrypted", "true"))

        const dataSize = piece.dataSize()
        if (dataSize != -1 && dataSize < this.options.chunkSizeInBytes!) {
            return await this.caStorage.storeEncrypted(bucketId, piece, dek)
        } else {
            piece.tags.push(new Tag("multipart", "true"))
            return await this.fileStorage.uploadPieceEncrypted(bucketId, piece, dek)
        }
    }

    private async storeUnencrypted(bucketId: bigint, piece: Piece) {
        const dataSize = piece.dataSize()

        if (dataSize != -1 && dataSize < this.options.chunkSizeInBytes!) {
            return await this.caStorage.store(bucketId, piece)
        } else {
            piece.tags.push(new Tag("multipart", "true"))
            return await this.fileStorage.uploadPiece(bucketId, piece)
        }
    }

    // 1. Read piece by uri
    // Encrypted flow:
    // 2. Read EDEK by 'bucketId + dekPath + client public key'
    // 3. Verify that passed dekPath fits piece dekPath
    // 4. Decrypt EDEK using client private key and put into DEK cache
    // 5. Calculate final DEK using the rest of the path
    // 6. Decrypt piece using final DEK
    // Decrypted flow:
    // 2. Nothing
    // return piece
    async read(pieceUri: PieceUri, options: ReadOptions = {}): Promise<Piece> {
        const piece = await this.caStorage.read(pieceUri.bucketId, pieceUri.cid)
        const isMultipart = piece.tags.filter(t => t.key == "multipart" && t.value == "true").length > 0
        const isEncrypted = piece.tags.filter(t => t.key == "encrypted" && t.value == "true").length > 0

        //TODO implement me
        return Promise.resolve(new Piece("", Array(), Array()))
    }

    async search(query: Query, options: SearchOptions = {}): Promise<Array<Piece>> {
        return Promise.resolve(Array())
    }

    // 1. Read EDEK by 'bucketId + dekPath + client box public key', decrypt and put into DEK cache
    // 2. Decrypt EDEK using client private key and put into DEK cache
    // 3. Encrypt DEK by partner box public key (so partner using his private key decrypted EDEK)
    // 4. Upload EDEK as a separate piece
    async shareData(bucketId: bigint, dekPath: string, partnerBoxPublicKey: string): Promise<PieceUri> {
        const values = await this.kvStorage.read(bucketId, `${bucketId}/${dekPath}/${u8aToHex(this.boxKeypair.publicKey)}`)
        if (values.length == 0) {
            return Promise.reject("Client EDEK not found")
        }

        const clientEdek = values[0].data
        const dek = nacl.box.open(clientEdek, emptyNonce, this.boxKeypair.publicKey, this.boxKeypair.secretKey)
        const partnerEdek = nacl.box(dek, emptyNonce, partnerBoxPublicKey, this.boxKeypair.secretKey)

        return await this.kvStorage.store(bucketId, `${bucketId}/${dekPath}/${partnerBoxPublicKey}`, partnerEdek)
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
