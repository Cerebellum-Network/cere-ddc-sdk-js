import {
  DagNode,
  DagNodeResponse,
  Router,
  Signer,
  UriSigner,
  DagNodeStoreOptions,
  ConfigPreset,
  DagNodeGetOptions,
  DEFAULT_PRESET,
  Logger,
  createLogger,
  bindErrorLogger,
  NodeInterface,
  BalancedNode,
  AuthTokenParams,
  AuthToken,
  BalancedNodeConfig,
  CnsRecordGetOptions,
} from '@cere-ddc-sdk/ddc';
import { FileStorage, File, FileStoreOptions, FileResponse, FileReadOptions } from '@cere-ddc-sdk/file-storage';
import { AccountId, Blockchain, BucketId, BucketParams, ClusterId, Sendable } from '@cere-ddc-sdk/blockchain';

import { DagNodeUri, DdcUri, FileUri } from './DdcUri';

export type DdcClientConfig = Omit<BalancedNodeConfig, 'router'> &
  Omit<ConfigPreset, 'blockchain'> & {
    blockchain: Blockchain | ConfigPreset['blockchain'];
  };

type DepositBalanceOptions = {
  allowExtra?: boolean;
};

/**
 * `DdcClient` is a class that provides methods to interact with the DDC.
 *
 * It provides methods to manage buckets, grant access, and store and read files and DAG nodes.
 */
export class DdcClient {
  protected constructor(
    private readonly ddcNode: NodeInterface,
    private readonly blockchain: Blockchain,
    private readonly fileStorage: FileStorage,
    private readonly signer: Signer,
    private readonly logger: Logger,
  ) {
    bindErrorLogger(this, this.logger, ['createBucket', 'getBucket', 'getBucketList', 'store', 'read']);
  }

  /**
   * Creates a new instance of the DdcClient.
   *
   * @param uriOrSigner - A Signer instance or a [substrate URI](https://polkadot.js.org/docs/keyring/start/suri).
   * @param config - Configuration options for the DdcClient. Defaults to TESTNET.
   *
   * @returns A promise that resolves to a new instance of the DdcClient.
   *
   * @example
   *
   * ```typescript
   * const ddcClient = await DdcClient.create('//Alice', DEVNET);
   * ```
   *
   * ```typescript
   * const ddcClient = await DdcClient.create('//Alice', {
   *   blockchain: 'wss://devnet.cere.network',
   *   retries: 3,
   * });
   * ```
   */
  static async create(uriOrSigner: Signer | string, config: DdcClientConfig = DEFAULT_PRESET) {
    const logger = createLogger('DdcClient', config);
    const signer = typeof uriOrSigner === 'string' ? new UriSigner(uriOrSigner) : uriOrSigner;
    const blockchain =
      typeof config.blockchain === 'string'
        ? await Blockchain.connect({ wsEndpoint: config.blockchain })
        : config.blockchain;

    const router = config.nodes
      ? new Router({ signer, nodes: config.nodes, logger })
      : new Router({ signer, blockchain, logger });

    const ddcNode = new BalancedNode({ ...config, router, logger });
    const fileStorage = new FileStorage(router, { ...config, logger });

    logger.debug(config, 'DdcClient created');

    return new DdcClient(ddcNode, blockchain, fileStorage, signer, logger);
  }

  async disconnect() {
    await this.blockchain.disconnect();
  }

  /**
   * Retrieves the current free balance of the account.
   *
   * @returns A promise that resolves to the current balance of the account.
   *
   * @example
   * ```typescript
   * const balance = await ddcClient.getBalance();
   *
   * console.log(balance);
   * ```
   * */
  async getBalance() {
    return this.blockchain.getAccountFreeBalance(this.signer.address);
  }

  /**
   * Deposits a specified amount of tokens to the account. The account must have enough tokens to cover the deposit.
   *
   * @param amount - The amount of tokens to deposit.
   *
   * @returns A promise that resolves to the transaction hash of the deposit.
   *
   * @example
   *
   * ```typescript
   * const amount = 100n;
   * const txHash = await ddcClient.depositBalance(amount);
   *
   * console.log(txHash);
   * ```
   * */
  async depositBalance(amount: bigint, options: DepositBalanceOptions = {}) {
    let tx: Sendable;
    const currentDeposit =
      options.allowExtra === false ? null : await this.blockchain.ddcCustomers.getStackingInfo(this.signer.address);

    if (currentDeposit === null) {
      this.logger.info('Depositing balance %s to %s', amount, this.signer.address);
      tx = this.blockchain.ddcCustomers.deposit(amount);
    } else {
      this.logger.info('Depositing extra balance %s to %s', amount, this.signer.address);
      tx = this.blockchain.ddcCustomers.depositExtra(amount);
    }

    return this.blockchain.send(tx, { account: this.signer });
  }

  /**
   * Retrieves the current active deposit of the account.
   *
   * @returns A promise that resolves to the current active deposit of the account.
   *
   * @example
   *
   * ```typescript
   * const deposit = await ddcClient.getDeposit();
   *
   * console.log(deposit);
   * ```
   * */
  async getDeposit() {
    const info = await this.blockchain.ddcCustomers.getStackingInfo(this.signer.address);

    return BigInt(info?.active || 0n);
  }

  /**
   * Creates a new bucket on a specified cluster.
   *
   * @param clusterId - The ID of the cluster where the bucket will be created.
   * @param params - Optional parameters for the new bucket. Defaults to an empty object.
   *                 Currently, the only parameter is `isPublic`, which defaults to `false`.
   *
   * @returns A promise that resolves to the ID of the newly created bucket.
   *
   * @example
   *
   * ```typescript
   * const clusterId: ClusterId = '0x...';
   * const bucketId: BucketId = await ddcClient.createBucket(clusterId, {
   *   isPublic: true,
   * });
   * ```
   */
  async createBucket(clusterId: ClusterId, params: Partial<BucketParams> = {}) {
    this.logger.info(params, 'Creating bucket on cluster %s', clusterId);

    const defaultParams: BucketParams = {
      isPublic: false,
    };

    const response = await this.blockchain.send(
      this.blockchain.ddcCustomers.createBucket(clusterId, { ...defaultParams, ...params }),
      { account: this.signer },
    );

    const [bucketId] = this.blockchain.ddcCustomers.extractCreatedBucketIds(response.events);

    this.logger.debug({ response }, 'Blockchain response');
    this.logger.info(`Bucket ${bucketId} created on cluster ${clusterId}`);

    return bucketId;
  }

  /**
   * Retrieves information about a specific bucket by its ID.
   *
   * @param bucketId - The ID of the bucket to retrieve.
   *
   * @returns A promise that resolves to the bucket information.
   *
   * @example
   *
   * ```typescript
   * const bucketId: BucketId = 1n;
   * const bucket = await ddcClient.getBucket(bucketId);
   *
   * console.log(bucket);
   * ```
   */
  async getBucket(bucketId: BucketId) {
    this.logger.info('Getting bucket %s', bucketId);
    const bucket = await this.blockchain.ddcCustomers.getBucket(bucketId);
    this.logger.info('Got bucket %s', bucketId);

    return bucket;
  }

  /**
   * Retrieves a list of all available buckets.
   *
   * @returns A promise that resolves to an array of buckets.
   *
   * @example
   *
   * ```typescript
   * const buckets = await ddcClient.getBucketList();
   *
   * console.log(buckets);
   * ```
   */
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

  /**
   * Grants access to a bucket to a specific account.
   *
   * @param subject - The account ID to grant access to.
   * @param params - The parameters for the access being granted.
   *
   * @returns A new AuthToken that the subject account can use to access the bucket.
   *
   * @example
   *
   * ```typescript
   * const subject: AccountId = '0x...';
   * const authToken = await ddcClient.grantAccess(subject, {
   *   bucketId: 1n,
   *   operations: [AuthTokenOperation.GET],
   * });
   *
   * console.log(authToken.toString());
   * ```
   */
  async grantAccess(subject: AccountId, params: Omit<AuthTokenParams, 'subject'>) {
    this.logger.info('Granting access to account %s', subject);
    this.logger.debug({ params }, 'Grant access params');

    return new AuthToken({ ...params, subject }).sign(this.signer);
  }

  /**
   * Stores a file or DAG node in a specific bucket.
   *
   * @param bucketId - The ID of the bucket to store the entity in.
   * @param entity - The file or DAG node to store.
   * @param options - Optional parameters for storing the entity.
   *
   * @returns A promise that resolves to a URI for the stored entity.
   *
   * @throws Will throw an error if the `entity` argument is neither a File nor a DagNode.
   *
   * @example
   *
   * ```typescript
   * const bucketId: BucketId = 1n;
   * const fileContent = ...;
   * const file: File = new File(fileContent, { size: 1000 });
   * const fileUri = await ddcClient.store(bucketId, file);
   *
   * console.log(fileUri);
   * ```
   */
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
    return this.ddcNode.storeDagNode(bucketId, node, options);
  }

  /**
   * Reads a file or DAG node from a specific URI.
   *
   * @param uri - The URI of the file or DAG node to read.
   * @param options - Optional parameters for reading the entity.
   *
   * @returns A promise that resolves to the file or DAG node response.
   *
   * @example
   *
   * ```typescript
   * const fileUri = new FileUri(bucketId, cid);
   * const fileResponse = await ddcClient.read(fileUri);
   * const textContent = await fileResponse.text();
   *
   * console.log(textContent);
   * ```
   */
  async read(uri: FileUri, options?: FileReadOptions): Promise<FileResponse>;
  async read(uri: DagNodeUri, options?: DagNodeGetOptions): Promise<DagNodeResponse>;
  async read(uri: DdcUri, options?: FileReadOptions | DagNodeGetOptions) {
    this.logger.debug({ uri, options }, 'Reading entity');

    if (uri.entity === 'file') {
      return this.fileStorage.read(uri.bucketId, uri.cidOrName, options as FileReadOptions);
    }

    if (uri.entity === 'dag-node') {
      return this.ddcNode.getDagNode(uri.bucketId, uri.cidOrName, options as DagNodeGetOptions);
    }

    throw new Error('`uri` argument is neither FileUri or DagNodeUri');
  }

  /**
   * Resolves a CNS name to a specific CID.
   *
   * @param bucketId - The ID of the bucket to resolve the CNS name in.
   * @param cnsName - The CNS name to resolve.
   *
   * @returns A promise that resolves to the CID of the CNS name.
   *
   * @example
   *
   * ```typescript
   * const bucketId: BucketId = 1n;
   * const cnsName = 'my-file';
   * const cid = await ddcClient.resolveName(bucketId, cnsName);
   *
   * console.log(cid);
   * ```
   */
  async resolveName(bucketId: BucketId, cnsName: string, options?: CnsRecordGetOptions) {
    return this.ddcNode.resolveName(bucketId, cnsName, options);
  }
}
