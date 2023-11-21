import {
  DagNode,
  DagNodeResponse,
  Router,
  RouterOperation,
  Signer,
  UriSigner,
  DagNodeStoreOptions,
  ConfigPreset,
  DagNodeGetOptions,
  DEFAULT_PRESET,
} from '@cere-ddc-sdk/ddc';
import { FileStorage, File, FileStoreOptions, FileResponse, FileReadOptions } from '@cere-ddc-sdk/file-storage';
import { Blockchain, BucketId, ClusterId } from '@cere-ddc-sdk/blockchain';

import { DagNodeUri, DdcEntity, DdcUri, FileUri } from './DdcUri';

export type DdcClientConfig = Omit<ConfigPreset, 'blockchain'> & {
  blockchain: Blockchain | ConfigPreset['blockchain'];
};

export class DdcClient {
  protected constructor(
    private readonly blockchain: Blockchain,
    private readonly router: Router,
    private readonly fileStorage: FileStorage,
  ) {}

  static async create(uriOrSigner: Signer | string, config: DdcClientConfig = DEFAULT_PRESET) {
    const signer = typeof uriOrSigner === 'string' ? new UriSigner(uriOrSigner) : uriOrSigner;
    const blockchain =
      config.blockchain instanceof Blockchain
        ? config.blockchain
        : await Blockchain.connect({ account: signer, wsEndpoint: config.blockchain });

    const router = config.nodes ? new Router({ signer, nodes: config.nodes }) : new Router({ signer, blockchain });
    const fileStorage = new FileStorage(router);

    return new DdcClient(blockchain, router, fileStorage);
  }

  async disconnect() {
    await this.blockchain.disconnect();
  }

  async createBucket(clusterId: ClusterId) {
    const result = await this.blockchain.send(this.blockchain.ddcCustomers.createBucket(clusterId));
    const [bucketId] = this.blockchain.ddcCustomers.extractCreatedBucketIds(result.events);

    return bucketId;
  }

  getBucket(bucketId: BucketId) {
    return this.blockchain.ddcCustomers.getBucket(bucketId);
  }

  getBucketList() {
    return this.blockchain.ddcCustomers.listBuckets();
  }

  /**
   * @deprecated Use `getBucket` instead
   */
  bucketGet(bucketId: BucketId) {
    return this.getBucket(bucketId);
  }

  /**
   * @deprecated Use `getBucketList` instead
   */
  bucketList() {
    return this.getBucketList();
  }

  async store(bucketId: BucketId, entity: File, options?: FileStoreOptions): Promise<FileUri>;
  async store(bucketId: BucketId, entity: DagNode, options?: DagNodeStoreOptions): Promise<DagNodeUri>;
  async store(bucketId: BucketId, entity: File | DagNode, options?: FileStoreOptions | DagNodeStoreOptions) {
    const entityType: DdcEntity = entity instanceof File ? 'file' : 'dag-node';

    const cid =
      entity instanceof File
        ? await this.fileStorage.store(bucketId, entity, options)
        : await this.storeDagNode(bucketId, entity, options);

    return new DdcUri(bucketId, cid, entityType, options);
  }

  private async storeDagNode(bucketId: BucketId, node: DagNode, options?: DagNodeStoreOptions) {
    const ddcNode = await this.router.getNode(RouterOperation.STORE_DAG_NODE, BigInt(bucketId));

    return ddcNode.storeDagNode(bucketId, node, options);
  }

  async read(uri: FileUri, options?: FileReadOptions): Promise<FileResponse>;
  async read(uri: DagNodeUri, options?: DagNodeGetOptions): Promise<DagNodeResponse>;
  async read(uri: DdcUri, options?: FileReadOptions | DagNodeGetOptions) {
    if (uri.entity === 'file') {
      return this.fileStorage.read(uri.bucketId, uri.cidOrName, options as FileReadOptions);
    }

    const ddcNode = await this.router.getNode(RouterOperation.READ_DAG_NODE, uri.bucketId);

    return ddcNode.getDagNode(uri.bucketId, uri.cidOrName, options as DagNodeGetOptions);
  }
}
