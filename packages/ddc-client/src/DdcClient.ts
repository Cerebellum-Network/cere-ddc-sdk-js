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
import {blake2AsU8a, naclBoxKeypairFromSecret, naclKeypairFromString} from "@polkadot/util-crypto";
import {KeyValueStorage} from "@cere-ddc-sdk/key-value-storage/src";
import {DdcClientInterface} from "./DdcClient.interface";
import {ClientOptions, initDefaultOptions} from "./options/ClientOptions";
import {StoreOptions} from "./options/StoreOptions";
import {ReadOptions} from "./options/ReadOptions";
import {BoxKeyPair} from "tweetnacl";
import {u8aToHex} from "@polkadot/util";
import {SchemeType} from "@cere-ddc-sdk/core";
import {PieceArray} from "./model/PieceArray";

const nacl = require("tweetnacl");
const emptyNonce = new Uint8Array(nacl.box.nonceLength);
const encoder = new TextEncoder();

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
        gateway: string,
        options: ClientOptions,
    ) {
        this.smartContract = smartContract;
        this.scheme = scheme;
        this.cipher = options.cipher || new DefaultCipher(secretPhrase);
        this.options = options;
        this.cidBuilder = options.cidBuilder || new CidBuilder();

        //ToDO gateway discovery
        this.caStorage = new ContentAddressableStorage(scheme, gateway, this.cipher, this.cidBuilder);
        this.kvStorage = new KeyValueStorage(scheme, gateway);
        this.fileStorage = new FileStorage(scheme, gateway, new FileStorageConfig(options.pieceConcurrency, options.chunkSizeInBytes), this.cipher, this.cidBuilder);

        this.masterDek = blake2AsU8a(secretPhrase);
        this.boxKeypair = naclBoxKeypairFromSecret(naclKeypairFromString(secretPhrase).secretKey);
    }


    static async buildAndConnect(secretPhrase: string, options: ClientOptions): Promise<DdcClient> {
        options = initDefaultOptions(options)
        const smartContract = await SmartContract.buildAndConnect(secretPhrase, options.smartContract)
        const scheme = (typeof options.scheme === "string") ? await Scheme.createScheme(options.scheme as SchemeType, secretPhrase) : options.scheme!
        const gateway = await DdcClient.getGatewayAddress(options, smartContract);

        return new DdcClient(secretPhrase, smartContract, scheme, gateway, options)
    }

    //TODO implement balancer
    private static async getGatewayAddress(options: ClientOptions, smartContract: SmartContract): Promise<string> {
        if (typeof options.clusterAddress === "string") {
            return options.clusterAddress;
        } else {
            const cluster = await smartContract.clusterGet(options.clusterAddress as number);
            const vNodes = new Set<bigint>(cluster.cluster.vnodes);
            for (const vNode of vNodes) {
                const node = await smartContract.nodeGet(Number(vNode));
                const parameters = JSON.parse(node.params);

                if (parameters.type === "gateway") {
                    return parameters.url;
                }
            }
        }

        throw new Error(`unable to find gateway nodes in cluster='${options.clusterAddress}'`)
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
        let dek = DdcClient.buildHierarchicalDekHex(this.masterDek, options.dekPath)
        let edek = nacl.box(dek, emptyNonce, this.boxKeypair.publicKey, this.boxKeypair.secretKey)
        await this.kvStorage.store(bucketId, `${bucketId}/${options.dekPath}/${u8aToHex(this.boxKeypair.publicKey)}`, new Piece(edek))

        const encryptionOptions = {dekPath: options.dekPath || "", dek: dek};
        if (pieceArray.isPiece(this.options.chunkSizeInBytes!)) {
            const piece = new Piece(pieceArray.data as Uint8Array, pieceArray.tags);
            return await this.caStorage.storeEncrypted(bucketId, piece, encryptionOptions);
        } else {
            return await this.fileStorage.uploadEncrypted(bucketId, pieceArray.data, pieceArray.tags, encryptionOptions)
        }
    }

    private async storeUnencrypted(bucketId: bigint, pieceArray: PieceArray) {
        if (pieceArray.isPiece(this.options.chunkSizeInBytes!)) {
            const piece = new Piece(pieceArray.data as Uint8Array, pieceArray.tags);
            return await this.caStorage.store(bucketId, piece)
        } else {
            return await this.fileStorage.upload(bucketId, pieceArray.data)
        }
    }

    async read(pieceUri: PieceUri, options: ReadOptions = {}): Promise<PieceArray> {
        const headPiece = await this.caStorage.read(pieceUri.bucketId, pieceUri.cid);
        const isMultipart = headPiece.tags.filter(t => t.key == "multipart" && t.value == "true").length > 0;
        const isEncrypted = headPiece.tags.filter(t => t.key == "encrypted" && t.value == "true").length > 0;

        //TODO 4. put into DEK cache
        let objectDek = new Uint8Array();
        if (options.decrypt) {
            const dekPath = headPiece.tags.find(t => t.key == "dekPath")?.value;
            if (dekPath == null) {
                throw new Error(`Piece=${pieceUri} doesn't have dekPath`);
            } else if (!dekPath.startsWith(options.dekPath!)) {
                throw new Error(`Provided dekPath='${options.dekPath}' doesn't correct for piece with dekPath='${dekPath}'`);
            }

            const clientDek = await this.readDek(pieceUri.bucketId, options.dekPath!);

            objectDek = DdcClient.buildHierarchicalDekHex(clientDek, dekPath.replace(options.dekPath!, ""))
        }

        if (headPiece.tags.length > 0 && isMultipart) {
            const data = isEncrypted
                ? this.fileStorage.readDecryptedLinks(pieceUri.bucketId, headPiece.links, objectDek)
                : this.fileStorage.readLinks(pieceUri.bucketId, headPiece.links)

            return new PieceArray(data, headPiece.tags, pieceUri.cid)
        } else {
            const record = new PieceArray(headPiece.data, headPiece.tags, pieceUri.cid)
            if (isEncrypted) {
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

    private static buildHierarchicalDekHex(dek: Uint8Array, dekPath?: string): Uint8Array {
        if (!dekPath) {
            return dek
        }

        const pathParts = dekPath.split("/")

        for (const part in pathParts) {
            const postfix = encoder.encode(part);

            const data = new Uint8Array(dek.length + postfix.length);
            data.set(dek);
            data.set(postfix, dek.length);

            dek = blake2AsU8a(data)
        }

        return dek
    }
}