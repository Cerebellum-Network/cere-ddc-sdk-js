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
  LoggerOptions,
  Logger,
  createLogger,
} from '@cere-ddc-sdk/ddc';
import { FileStorage, File, FileStoreOptions, FileResponse, FileReadOptions } from '@cere-ddc-sdk/file-storage';
import { Blockchain, BucketId, ClusterId } from '@cere-ddc-sdk/blockchain';

import { DagNodeUri, DdcUri, FileUri } from './DdcUri';

export type DdcClientConfig = LoggerOptions &
  Omit<ConfigPreset, 'blockchain'> & {
    blockchain: Blockchain | ConfigPreset['blockchain'];
  };

export class DdcClient {
  protected constructor(
    private readonly blockchain: Blockchain,
    private readonly router: Router,
    private readonly fileStorage: FileStorage,
    private readonly logger: Logger,
  ) {}

  static async create(uriOrSigner: Signer | string, config: DdcClientConfig = DEFAULT_PRESET) {
    const logger = createLogger({ ...config, prefix: 'DdcClient' });
    const signer = typeof uriOrSigner === 'string' ? new UriSigner(uriOrSigner) : uriOrSigner;
    const blockchain =
      typeof config.blockchain === 'string'
        ? await Blockchain.connect({ account: signer, wsEndpoint: config.blockchain })
        : config.blockchain;

    const router = config.nodes
      ? new Router({ signer, nodes: config.nodes, logLevel: config.logLevel })
      : new Router({ signer, blockchain, logLevel: config.logLevel });

    const fileStorage = new FileStorage(router, config);

    logger.debug(config, 'DdcClient created');

    return new DdcClient(blockchain, router, fileStorage, logger);
  }

  async disconnect() {
    await this.blockchain.disconnect();
  }

  async createBucket(clusterId: ClusterId) {
    this.logger.info('Creating bucket on cluster %s', clusterId);

    const response = await this.blockchain.send(this.blockchain.ddcCustomers.createBucket(clusterId));
    const [bucketId] = this.blockchain.ddcCustomers.extractCreatedBucketIds(response.events);

    this.logger.debug({ response }, 'Blockchain response');
    this.logger.info(`Bucket ${bucketId} created on cluster ${clusterId}`);

    return bucketId;
  }

  async getBucket(bucketId: BucketId) {
    this.logger.info('Getting bucket %s', bucketId);
    const bucket = await this.blockchain.ddcCustomers.getBucket(bucketId);
    this.logger.info('Got bucket %s', bucketId);

    return bucket;
  }

  async getBucketList() {
    this.logger.info('Getting bucket list');
    const list = await this.blockchain.ddcCustomers.listBuckets();

    this.logger.info('Got bucket list of lenght %s', list.length);
    this.logger.debug({ list }, 'Bucket list');

    return list;
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
    this.logger.debug({ entity, options }, 'Storing entity');

    if (File.isFile(entity)) {
      const cid = await this.fileStorage.store(bucketId, entity, options);

      return new FileUri(bucketId, cid, options);
    }

    if (DagNode.isDagNode(entity)) {
      const cid = await this.storeDagNode(bucketId, entity, options);

      return new DagNodeUri(bucketId, cid, options);
    }

    throw new Error('`entity` argument is neither File nor DagNode');
  }

  private async storeDagNode(bucketId: BucketId, node: DagNode, options?: DagNodeStoreOptions) {
    const ddcNode = await this.router.getNode(RouterOperation.STORE_DAG_NODE, BigInt(bucketId));

    return ddcNode.storeDagNode(bucketId, node, options);
  }

  async read(uri: FileUri, options?: FileReadOptions): Promise<FileResponse>;
  async read(uri: DagNodeUri, options?: DagNodeGetOptions): Promise<DagNodeResponse>;
  async read(uri: DdcUri, options?: FileReadOptions | DagNodeGetOptions) {
    this.logger.debug({ uri, options }, 'Reading entity');

    if (uri.entity === 'file') {
      return this.fileStorage.read(uri.bucketId, uri.cidOrName, options as FileReadOptions);
    }

    const ddcNode = await this.router.getNode(RouterOperation.READ_DAG_NODE, uri.bucketId);

    return ddcNode.getDagNode(uri.bucketId, uri.cidOrName, options as DagNodeGetOptions);
  }
}
