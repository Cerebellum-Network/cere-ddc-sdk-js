import {
  DagNode,
  DagNodeResponse,
  DagNodeStoreOptions,
  DagNodeGetOptions,
  Logger,
  LoggerOptions,
  createLogger,
  bindErrorLogger,
  NodeInterface,
  createResolverNode,
  AuthTokenParams,
  AuthToken,
  OpperationRetryOptions,
  CnsRecordGetOptions,
} from '@cere-ddc-sdk/ddc';
import { FileStorage, File, FileStoreOptions, FileResponse, FileReadOptions } from '@cere-ddc-sdk/file-storage';
import {
  UriSigner,
  resolveClient,
  type Signer,
  type CereClient,
  type ChainConfig,
  type AccountId,
  type BucketId,
  type BucketParams,
  type ClusterId,
  type Sendable,
} from '@cere-ddc-sdk/blockchain';

import { DagNodeUri, DdcUri, FileUri } from './DdcUri';

export type DdcClientConfig = LoggerOptions & {
  /**
   * The blockchain to connect to: a well-known network name, a websocket RPC URL, or an
   * already-connected `CereClient`.
   */
  blockchain: ChainConfig;

  /**
   * The ID of the DDC cluster this client operates against.
   */
  clusterId: ClusterId;

  /**
   * The endpoint used for all write operations (and reads, when `cdnUrl` isn't set).
   */
  storageUrl: string;

  /**
   * The endpoint used for read operations. Falls back to `storageUrl` when omitted.
   */
  cdnUrl?: string;

  retries?: number | OpperationRetryOptions;
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
  private readonly ddcNode: NodeInterface;
  private readonly client: CereClient;
  private readonly ownsClient: boolean;
  private readonly fileStorage: FileStorage;
  private readonly signer: Signer;
  private readonly logger: Logger;
  private readonly clusterId: ClusterId;

  constructor(uriOrSigner: Signer | string, config: DdcClientConfig) {
    if (!config?.clusterId) {
      throw new Error('DdcClient config is missing required "clusterId"');
    }

    if (!config?.storageUrl) {
      throw new Error('DdcClient config is missing required "storageUrl"');
    }

    const logger = createLogger('DdcClient', config);
    const { client, ownsClient } = resolveClient(config.blockchain);

    const signer = typeof uriOrSigner === 'string' ? new UriSigner(uriOrSigner) : uriOrSigner;

    this.client = client;
    this.ownsClient = ownsClient;
    this.signer = signer;
    this.logger = logger;
    this.clusterId = config.clusterId;
    this.ddcNode = createResolverNode({
      signer,
      storageUrl: config.storageUrl,
      cdnUrl: config.cdnUrl,
      retries: config.retries,
      logger,
    });
    this.fileStorage = new FileStorage({
      signer,
      storageUrl: config.storageUrl,
      cdnUrl: config.cdnUrl,
      retries: config.retries,
      logger,
    });

    logger.debug(config, 'DdcClient created');

    if (config.logErrors !== false) {
      bindErrorLogger(this, this.logger, [
        'getBalance',
        'depositBalance',
        'getDeposit',
        'createBucket',
        'getBucket',
        'getBucketList',
        'store',
        'read',
        'resolveName',
      ]);
    }
  }

  /**
   * Creates a new instance of the DdcClient.
   *
   * @param uriOrSigner - A Signer instance or a [substrate URI](https://polkadot.js.org/docs/keyring/start/suri).
   * @param config - Configuration options for the DdcClient. `clusterId` and `storageUrl` are required.
   *
   * @returns A promise that resolves to a new instance of the DdcClient.
   *
   * @example
   *
   * ```typescript
   * const ddcClient = await DdcClient.create('//Alice', {
   *   blockchain: 'wss://devnet.cere.network',
   *   clusterId: '0x...',
   *   storageUrl: 'https://storage.example',
   *   retries: 3,
   * });
   * ```
   */
  static async create(uriOrSigner: Signer | string, config: DdcClientConfig) {
    const client = new DdcClient(uriOrSigner, config);

    return client.connect();
  }

  async connect() {
    // The papi client connects lazily on first use; nothing to await here.
    return this;
  }

  async disconnect() {
    if (this.ownsClient) {
      this.client.disconnect();
    }

    return this;
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
    this.logger.info('Getting the account balance %s', this.signer.address);
    const balance = await this.client.chain.getAccountFreeBalance(this.signer.address);
    this.logger.info('The account (%s) balance is %s', this.signer.address, balance);

    return balance;
  }

  /**
   * Deposits a specified amount of tokens to the account for the configured cluster. The account must have enough tokens to cover the deposit.
   *
   * @param amount - The amount of tokens to deposit.
   * @param options - Additional options for the deposit.
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
      options.allowExtra === false
        ? undefined
        : await this.client.customers.getStackingInfo(this.clusterId, this.signer.address);

    if (currentDeposit === undefined) {
      this.logger.info('Depositing balance %s to %s for cluster %s', amount, this.signer.address, this.clusterId);
      tx = await this.client.customers.deposit(this.clusterId, amount);
    } else {
      this.logger.info('Depositing extra balance %s to %s for cluster %s', amount, this.signer.address, this.clusterId);
      tx = await this.client.customers.depositExtra(this.clusterId, amount);
    }

    return this.client.tx.send(tx, { signer: this.signer });
  }

  /**
   * Deposits a specified amount of tokens to the target address for the configured cluster.
   * This allows depositing funds on behalf of another address.
   *
   * @param targetAddress - The target address to deposit funds for.
   * @param amount - The amount of tokens to deposit.
   *
   * @returns A promise that resolves to the transaction hash of the deposit.
   *
   * @example
   *
   * ```typescript
   * const targetAddress = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
   * const amount = 100n;
   * const txHash = await ddcClient.depositBalanceFor(targetAddress, amount);
   *
   * console.log(txHash);
   * ```
   * */
  async depositBalanceFor(targetAddress: AccountId, amount: bigint) {
    this.logger.info('Depositing balance %s for %s in cluster %s', amount, targetAddress, this.clusterId);
    const tx = await this.client.customers.depositFor(targetAddress, this.clusterId, amount);
    return this.client.tx.send(tx, { signer: this.signer });
  }

  /**
   * Retrieves the current active deposit of the account for the configured cluster.
   *
   * @param accountId - Optional account ID. If not provided, uses the signer's address.
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
  async getDeposit(accountId?: AccountId) {
    const targetAccountId = accountId || this.signer.address;
    this.logger.info('Getting the account deposit %s for cluster %s', targetAccountId, this.clusterId);
    const info = await this.client.customers.getStackingInfo(this.clusterId, targetAccountId);
    const deposit = BigInt(info?.active || 0n);
    this.logger.info('The account (%s) deposit for cluster %s is %s', targetAccountId, this.clusterId, deposit);

    return deposit;
  }

  /**
   * Unlocks deposit funds from the account for the configured cluster.
   *
   * @param amount - The amount to unlock.
   *
   * @returns A promise that resolves to the transaction hash.
   *
   * @example
   *
   * ```typescript
   * const amount = 100n;
   * const txHash = await ddcClient.unlockDeposit(amount);
   *
   * console.log(txHash);
   * ```
   * */
  async unlockDeposit(amount: bigint) {
    this.logger.info('Unlocking deposit %s for cluster %s', amount, this.clusterId);
    const tx = await this.client.customers.unlockDeposit(this.clusterId, amount);
    return this.client.tx.send(tx, { signer: this.signer });
  }

  /**
   * Withdraws unlocked funds from the account for the configured cluster.
   *
   * @returns A promise that resolves to the transaction hash.
   *
   * @example
   *
   * ```typescript
   * const txHash = await ddcClient.withdrawUnlockedDeposit();
   *
   * console.log(txHash);
   * ```
   * */
  async withdrawUnlockedDeposit() {
    this.logger.info('Withdrawing unlocked deposit for cluster %s', this.clusterId);
    const tx = await this.client.customers.withdrawUnlockedDeposit(this.clusterId);
    return this.client.tx.send(tx, { signer: this.signer });
  }

  /**
   * Creates a new bucket on the configured cluster.
   *
   * @param params - Optional parameters for the new bucket. Defaults to an empty object.
   *                 Currently, the only parameter is `isPublic`, which defaults to `false`.
   *
   * @returns A promise that resolves to the ID of the newly created bucket.
   *
   * @example
   *
   * ```typescript
   * const bucketId: BucketId = await ddcClient.createBucket({
   *   isPublic: true,
   * });
   * ```
   */
  async createBucket(params: Partial<BucketParams> = {}) {
    this.logger.info('Creating bucket on cluster %s', this.clusterId);
    const defaultParams: BucketParams = {
      isPublic: false,
    };

    const response = await this.client.tx.send(
      this.client.customers.createBucket(this.clusterId, { ...defaultParams, ...params }),
      { signer: this.signer },
    );

    const [bucketId] = this.client.customers.extractCreatedBucketIds(response.events);
    this.logger.info('Bucket %s created in cluster %s in TX: %s', bucketId, this.clusterId, response.txHash);

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
    const bucket = await this.client.customers.getBucket(bucketId);
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
    const list = await this.client.customers.listBuckets();
    this.logger.info('Got bucket list of lenght %s', list.length);

    return list;
  }

  /**
   * Mark existing buckets with specified bucket ids as removed.
   *
   * @param bucketIds - The IDs of the buckets to remove.
   * @returns A promise that resolves to the IDs of the removed buckets.
   *
   * @example
   *
   * ```typescript
   * const removedBucketIds = await ddcClient.removeBucket(1, 2, 3);
   * ```
   */
  async removeBuckets(...bucketIds: BucketId[]) {
    this.logger.info('Removing buckets %s', bucketIds);

    const response = await this.client.tx.send(this.client.customers.removeBuckets(...bucketIds), {
      signer: this.signer,
    });

    const removedBucketIds = this.client.customers.extractRemovedBucketIds(response.events);
    this.logger.info('Buckets %s removed in TX: %s', removedBucketIds, response.txHash);

    return removedBucketIds;
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
