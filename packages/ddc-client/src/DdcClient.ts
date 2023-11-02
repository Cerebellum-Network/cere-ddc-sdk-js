import {Scheme} from '@cere-ddc-sdk/core';
import {SmartContract, SmartContractOptions} from '@cere-ddc-sdk/smart-contract';
import {DagNode, DagNodeResponse, DagNodeStoreOptions, Router, RouterNode, RouterOperation} from '@cere-ddc-sdk/ddc';
import {FileStorage, File, FileStoreOptions, FileResponse, FileReadOptions} from '@cere-ddc-sdk/file-storage';

import {DdcEntity, DdcUri} from './DdcUri';

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

const MAX_BUCKET_SIZE = 5n;

export type DdcClientConfig = {
    nodes: RouterNode[];
    smartContract: SmartContractOptions;
};

export class DdcClient {
    protected constructor(
        readonly smartContract: SmartContract,
        private scheme: Scheme,
        private fileStorage: FileStorage,
        private router: Router,
    ) {}

    static async buildAndConnect(config: DdcClientConfig, secretPhrase: string) {
        const scheme = await Scheme.createScheme('sr25519', secretPhrase);
        const contract = await SmartContract.buildAndConnect(secretPhrase, config.smartContract);
        const router = new Router(config.nodes);
        const fs = new FileStorage({
            router,
        });

        return new DdcClient(contract, scheme, fs, router);
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

        const bucketId = await this.smartContract.bucketCreate(this.scheme.publicKeyHex, clusterId, bucketParams);

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

    async store(bucketId: BucketId, entity: File, options?: FileStoreOptions): Promise<DdcUri<'file'>>;
    async store(bucketId: BucketId, entity: DagNode, options?: DagNodeStoreOptions): Promise<DdcUri<'dag-node'>>;
    async store(bucketId: BucketId, entity: File | DagNode, options?: DagNodeStoreOptions | FileStoreOptions) {
        const numBucketId = Number(bucketId); // TODO: Convert bucketId to number everywhere
        const entityType: DdcEntity = entity instanceof File ? 'file' : 'dag-node';
        let cid: string;

        if (entity instanceof File) {
            cid = await this.fileStorage.store(numBucketId, entity, options);
        } else {
            const ddcNode = await this.router.getNode(RouterOperation.STORE_DAG_NODE);

            cid = await ddcNode.storeDagNode(numBucketId, entity, options);
        }

        return new DdcUri(numBucketId, cid, entityType);
    }

    async read(uri: DdcUri<'file'>, options?: FileReadOptions): Promise<FileResponse>;
    async read(uri: DdcUri<'dag-node'>): Promise<DagNodeResponse>;
    async read(uri: DdcUri, options?: FileReadOptions) {
        if (uri.entity === 'file') {
            return this.fileStorage.read(uri.bucketId, uri.cid, options);
        }

        const ddcNode = await this.router.getNode(RouterOperation.READ_DAG_NODE);

        return ddcNode.getDagNode(uri.bucketId, uri.cid);
    }
}
