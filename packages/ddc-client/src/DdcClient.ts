import {CidBuilder, CipherInterface, NaclCipher, Scheme, SchemeInterface, SchemeType} from "@cere-ddc-sdk/core";
import {
    ContentAddressableStorage,
    DEK_PATH_TAG,
    Piece,
    PieceUri,
    Query,
    Tag
} from "@cere-ddc-sdk/content-addressable-storage";
import {FileStorage, FileStorageConfig} from "@cere-ddc-sdk/file-storage";
import {
    BucketCreatedEvent,
    BucketPermissionGrantedEvent,
    BucketPermissionRevokedEvent,
    Permission,
    SmartContract,
} from "@cere-ddc-sdk/smart-contract";
import {blake2AsU8a, naclBoxKeypairFromSecret, naclKeypairFromString} from "@polkadot/util-crypto";
import {KeyValueStorage} from "@cere-ddc-sdk/key-value-storage";
import {DdcClientInterface} from "./DdcClient.interface";
import {ClientOptions, initDefaultOptions} from "./options/ClientOptions";
import {StoreOptions} from "./options/StoreOptions";
import {ReadOptions} from "./options/ReadOptions";
import {BoxKeyPair} from "tweetnacl";
import {hexToU8a, stringToU8a, u8aToHex} from "@polkadot/util";
import {PieceArray} from "./model/PieceArray";

const nacl = require("tweetnacl");
//ToDo generate from random for security
const emptyNonce = new Uint8Array(nacl.box.nonceLength);

const encryptorTag = "encryptor";

export class DdcClient implements DdcClientInterface {
    readonly smartContract: SmartContract
    readonly scheme: SchemeInterface;
    readonly cipher: CipherInterface;
    readonly options: ClientOptions;
    readonly cidBuilder: CidBuilder;

    readonly caStorage: ContentAddressableStorage;
    readonly kvStorage: KeyValueStorage;
    readonly fileStorage: FileStorage;

    readonly masterDek: Uint8Array;
    readonly boxKeypair: BoxKeyPair

    private constructor(
        secretPhrase: string,
        smartContract: SmartContract,
        scheme: SchemeInterface,
        cdn: string,
        options: ClientOptions,
    ) {
        this.smartContract = smartContract;
        this.scheme = scheme;
        this.cipher = options.cipher || new NaclCipher();
        this.options = options;
        this.cidBuilder = options.cidBuilder || new CidBuilder();

        //ToDO cdn discovery
        this.caStorage = new ContentAddressableStorage(scheme, cdn, this.cipher, this.cidBuilder);
        this.kvStorage = new KeyValueStorage(scheme, cdn);
        this.fileStorage = new FileStorage(scheme, cdn, new FileStorageConfig(options.pieceConcurrency, options.chunkSizeInBytes), this.cipher, this.cidBuilder);

        this.masterDek = blake2AsU8a(secretPhrase);
        this.boxKeypair = naclBoxKeypairFromSecret(naclKeypairFromString(secretPhrase).secretKey);
    }


    static async buildAndConnect(secretPhrase: string, options: ClientOptions): Promise<DdcClient> {
        options = initDefaultOptions(options)
        const smartContract = await SmartContract.buildAndConnect(secretPhrase, options.smartContract)
        const scheme = (typeof options.scheme === "string") ? await Scheme.createScheme(options.scheme as SchemeType, secretPhrase) : options.scheme!
        const cdn = await DdcClient.getCdnAddress(options, smartContract);

        return new DdcClient(secretPhrase, smartContract, scheme, cdn, options)
    }

    //TODO implement balancer
    private static async getCdnAddress(options: ClientOptions, smartContract: SmartContract): Promise<string> {
        if (typeof options.clusterAddress === "string") {
            return options.clusterAddress;
        } else {
            const cluster = await smartContract.clusterGet(options.clusterAddress as number);
            const vNodes = new Set<bigint>(cluster.cluster.vnodes);
            for (const vNode of vNodes) {
                const node = await smartContract.nodeGet(Number(vNode));
                const parameters = JSON.parse(node.params);

                if (parameters.type === "cdn") {
                    return parameters.url;
                }
            }
        }

        throw new Error(`unable to find cdn nodes in cluster='${options.clusterAddress}'`)
    }

    async diconnect() {
        return await this.smartContract.disconnect();
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

    async store(bucketId: bigint, pieceArray: PieceArray, options: StoreOptions = {}): Promise<PieceUri> {
        if (options.encrypt) {
            return this.storeEncrypted(bucketId, pieceArray, options)
        } else {
            return this.storeUnencrypted(bucketId, pieceArray)
        }
    }

    private async storeEncrypted(bucketId: bigint, pieceArray: PieceArray, options: StoreOptions) {
        let dek = DdcClient.buildHierarchicalDekHex(this.masterDek, options.dekPath);
        //ToDo can be random (Nacl ScaleBox). We need to decide if we need store publickey of user who created edek or shared
        let edek = nacl.box(dek, emptyNonce, this.boxKeypair.publicKey, this.boxKeypair.secretKey);

        //ToDo need better structure to store keys
        await this.caStorage.store(bucketId, new Piece(edek, [new Tag(encryptorTag, u8aToHex(this.boxKeypair.publicKey)), new Tag("Key", `${bucketId}/${options.dekPath || ""}/${u8aToHex(this.boxKeypair.publicKey)}`)]))

        const encryptionOptions = {dekPath: options.dekPath || "", dek: dek};
        if (pieceArray.isMultipart(this.options.chunkSizeInBytes!)) {
            return await this.fileStorage.uploadEncrypted(bucketId, pieceArray.data, pieceArray.tags, encryptionOptions);
        } else {
            const piece = new Piece(pieceArray.data as Uint8Array, pieceArray.tags);
            return await this.caStorage.storeEncrypted(bucketId, piece, encryptionOptions);
        }
    }

    private async storeUnencrypted(bucketId: bigint, pieceArray: PieceArray) {
        if (pieceArray.isMultipart(this.options.chunkSizeInBytes!)) {
            return await this.fileStorage.upload(bucketId, pieceArray.data, pieceArray.tags);
        } else {
            const piece = new Piece(pieceArray.data as Uint8Array, pieceArray.tags);
            return await this.caStorage.store(bucketId, piece);

        }
    }

    async read(pieceUri: PieceUri, options: ReadOptions = {}): Promise<PieceArray> {
        const headPiece = await this.caStorage.read(pieceUri.bucketId, pieceUri.cid);
        const isEncrypted = headPiece.tags.filter(t => t.key == DEK_PATH_TAG).length > 0;

        //TODO 4. put into DEK cache
        let objectDek = new Uint8Array();
        if (options.decrypt) {
            const dekPath = headPiece.tags.find(t => t.key == DEK_PATH_TAG)?.value;
            if (dekPath == null) {
                throw new Error(`Piece=${pieceUri} doesn't have dekPath`);
            } else if (!dekPath.startsWith(options.dekPath! + "/") && dekPath !== options.dekPath!) {
                throw new Error(`Provided dekPath='${options.dekPath}' doesn't correct for piece with dekPath='${dekPath}'`);
            }

            const clientDek = await this.readDek(pieceUri.bucketId, options.dekPath!);

            objectDek = DdcClient.buildHierarchicalDekHex(clientDek, dekPath.replace(options.dekPath!, "").replace(/^\//, ""))
        }

        if (headPiece.links.length > 0) {
            const data = isEncrypted && options.decrypt
                ? this.fileStorage.readDecryptedLinks(pieceUri.bucketId, headPiece.links, objectDek)
                : this.fileStorage.readLinks(pieceUri.bucketId, headPiece.links)

            return new PieceArray(data, headPiece.tags, pieceUri.cid)
        } else {
            const record = new PieceArray(headPiece.data, headPiece.tags, pieceUri.cid)
            if (isEncrypted && options.decrypt) {
                record.data = this.cipher!.decrypt(headPiece.data, objectDek)
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

    private async readDek(bucketId: bigint, dekPath: string): Promise<Uint8Array> {
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

        return nacl.box.open(piece.data, emptyNonce, hexToU8a(encryptor), this.boxKeypair.secretKey);
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
