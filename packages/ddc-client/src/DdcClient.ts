import {SmartContract, SmartContractOptions} from '@cere-ddc-sdk/smart-contract';
import {FileStorage, File, FileStoreOptions, FileResponse, FileReadOptions} from '@cere-ddc-sdk/file-storage';

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

import {
    DagNode,
    DagNodeResponse,
    Router,
    RouterConfig,
    RouterOperation,
    Signer,
    UriSigner,
    DagNodeStoreOptions,
} from '@cere-ddc-sdk/ddc';

import {DagNodeUri, DdcEntity, DdcUri, FileUri} from './DdcUri';
import {TESTNET} from './presets';

const MAX_BUCKET_SIZE = 5n;

export type DdcClientConfig = Omit<RouterConfig, 'signer'> & {
    smartContract: SmartContractOptions;
};

export type {FileStoreOptions, DagNodeStoreOptions};

export class DdcClient {
    private fileStorage: FileStorage;
    private router: Router;

    protected constructor(private signer: Signer, readonly smartContract: SmartContract, config: DdcClientConfig) {
        this.router = new Router({signer, nodes: config.nodes});
        this.fileStorage = new FileStorage(this.router);
    }

    static async create(uriOrSigner: Signer | string, config: DdcClientConfig = TESTNET) {
        const signer = typeof uriOrSigner === 'string' ? new UriSigner(uriOrSigner) : uriOrSigner;
        const contract = await SmartContract.buildAndConnect(signer, config.smartContract);

        return new DdcClient(signer, contract, config);
    }

    async disconnect() {
        await this.smartContract.disconnect();
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

        const bucketId = await this.smartContract.bucketCreate(this.signer.address, clusterId, bucketParams);

        if (balance > 0) {
            await this.smartContract.accountDeposit(balance);
        }

        const {cluster} = await this.smartContract.clusterGet(Number(clusterId));
        const bucketSize = BigInt(Math.round(Number(resource * 1000n) / cluster.nodesKeys.length));
        await this.smartContract.bucketAllocIntoCluster(bucketId, bucketSize);

        return {bucketId};
    }

    async accountDeposit(balance: Balance) {
        await this.smartContract.accountDeposit(balance);
    }

    async bucketAllocIntoCluster(bucketId: BucketId, resource: Resource) {
        const {bucket} = await this.bucketGet(bucketId);
        const {cluster} = await this.smartContract.clusterGet(bucket.clusterId);
        const total = (bucket.resourceReserved * BigInt(cluster.nodesKeys.length)) / 1000n + resource;

        if (total > MAX_BUCKET_SIZE) {
            throw new Error(`Exceed bucket size. Should be less than ${MAX_BUCKET_SIZE}`);
        }

        const resourceToAlloc = BigInt((Number(resource * 1000n) / cluster.nodesKeys.length) | 0);
        await this.smartContract.bucketAllocIntoCluster(bucketId, resourceToAlloc);
    }

    async bucketGet(bucketId: BucketId): Promise<BucketStatus> {
        return this.smartContract.bucketGet(bucketId);
    }

    async bucketList(offset: Offset, limit: Offset, filterOwnerId?: AccountId): Promise<[BucketStatus[], Offset]> {
        return this.smartContract.bucketList(offset, limit, filterOwnerId);
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
        const ddcNode = await this.router.getNode(RouterOperation.STORE_DAG_NODE);

        return ddcNode.storeDagNode(bucketId, node, options);
    }

    async read(uri: FileUri, options?: FileReadOptions): Promise<FileResponse>;
    async read(uri: DagNodeUri): Promise<DagNodeResponse>;
    async read(uri: DdcUri, options?: FileReadOptions) {
        const numBucketId = Number(uri.bucketId); // TODO: Convert bucketId to number everywhere

        if (uri.entity === 'file') {
            return this.fileStorage.read(numBucketId, uri.cidOrName, options);
        }

        const ddcNode = await this.router.getNode(RouterOperation.READ_DAG_NODE);

        return ddcNode.getDagNode(numBucketId, uri.cidOrName);
    }
}
