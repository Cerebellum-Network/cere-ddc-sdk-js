import {SmartContract, SmartContractOptions} from '@cere-ddc-sdk/smart-contract';
import {
    DagNode,
    DagNodeResponse,
    Router,
    RouterOperation,
    Signer,
    UriSigner,
    DagNodeStoreOptions,
    RouterNode,
} from '@cere-ddc-sdk/ddc';
import {FileStorage, File, FileStoreOptions, FileResponse, FileReadOptions} from '@cere-ddc-sdk/file-storage';
import {Blockchain, BucketId, ClusterId} from '@cere-ddc-sdk/blockchain';

import {DagNodeUri, DdcEntity, DdcUri, FileUri} from './DdcUri';
import {TESTNET} from './presets';

export type DdcClientConfig = {
    smartContract: SmartContractOptions;
    nodes?: RouterNode[];
};

export type {FileStoreOptions, DagNodeStoreOptions};

export class DdcClient {
    protected constructor(
        private readonly blockchain: Blockchain,
        private readonly router: Router,
        private readonly fileStorage: FileStorage,
    ) {}

    static async create(uriOrSigner: Signer | string, config: DdcClientConfig = TESTNET) {
        const signer = typeof uriOrSigner === 'string' ? new UriSigner(uriOrSigner) : uriOrSigner;
        const blockchain = await Blockchain.connect({
            account: signer,
            wsEndpoint: config.smartContract.rpcUrl!,
        });
        const nodes = 'nodes' in config ? config.nodes : undefined;
        const router = nodes ? new Router({signer, nodes}) : new Router({signer, blockchain});
        const fileStorage = new FileStorage(router);

        return new DdcClient(blockchain, router, fileStorage);
    }

    async disconnect() {
        await this.blockchain.disconnect();
    }

    async createBucket(clusterId: ClusterId) {
        const result = await this.blockchain.send(this.blockchain.ddcCustomers.createBucket(clusterId));
        const [bucketId] = this.blockchain.ddcCustomers.extractCreatedBucketIds(result.events);

        return {bucketId};
    }

    bucketGet(bucketId: BucketId) {
        return this.blockchain.ddcCustomers.getBucket(bucketId);
    }

    bucketList() {
        return this.blockchain.ddcCustomers.listBuckets();
    }

    async store(bucketId: BucketId, entity: File, options?: FileStoreOptions): Promise<FileUri>;
    async store(bucketId: BucketId, entity: DagNode, options?: DagNodeStoreOptions): Promise<DagNodeUri>;
    async store(bucketId: BucketId, entity: File | DagNode, options?: FileStoreOptions | DagNodeStoreOptions) {
        const numBucketId = Number(bucketId); // TODO: Convert bucketId to number everywhere
        const entityType: DdcEntity = entity instanceof File ? 'file' : 'dag-node';

        const cid =
            entity instanceof File
                ? await this.fileStorage.store(numBucketId, entity, options)
                : await this.storeDagNode(numBucketId, entity, options);

        return new DdcUri(bucketId, cid, entityType, options);
    }

    private async storeDagNode(bucketId: number, node: DagNode, options?: DagNodeStoreOptions) {
        const ddcNode = await this.router.getNode(RouterOperation.STORE_DAG_NODE, BigInt(bucketId));

        return ddcNode.storeDagNode(bucketId, node, options);
    }

    async read(uri: FileUri, options?: FileReadOptions): Promise<FileResponse>;
    async read(uri: DagNodeUri): Promise<DagNodeResponse>;
    async read(uri: DdcUri, options?: FileReadOptions) {
        const numBucketId = Number(uri.bucketId); // TODO: Convert bucketId to number everywhere

        if (uri.entity === 'file') {
            return this.fileStorage.read(numBucketId, uri.cidOrName, options);
        }

        const ddcNode = await this.router.getNode(RouterOperation.READ_DAG_NODE, BigInt(numBucketId));

        return ddcNode.getDagNode(numBucketId, uri.cidOrName);
    }
}
