import { Blockchain, BucketId } from '@cere-ddc-sdk/blockchain';
import {
  PieceReadOptions,
  Piece,
  MultipartPiece,
  Router,
  PieceStoreOptions,
  Signer,
  UriSigner,
  RouterConfig,
  ConfigPreset,
  DEFAULT_PRESET,
  Logger,
  createLogger,
  LoggerOptions,
  bindErrorLogger,
  NodeInterface,
  BalancedNode,
  withChunkSize,
  streamConsumers,
  BalancedNodeConfig,
} from '@cere-ddc-sdk/ddc';

import { File, FileResponse } from './File';
import { DEFAULT_BUFFER_SIZE, MAX_BUFFER_SIZE, MIN_BUFFER_SIZE } from './constants';

type Config = LoggerOptions & Pick<BalancedNodeConfig, 'retries'>;

export type FileStorageConfig = Config &
  Omit<ConfigPreset, 'blockchain'> & {
    blockchain: Blockchain | ConfigPreset['blockchain'];
  };

export type FileReadOptions = PieceReadOptions;
export type FileStoreOptions = PieceStoreOptions & {
  maxBufferSize?: number;
};

type LargeFileStoreOptions = FileStoreOptions & {
  partSize: number;
};

/**
 * Represents a storage system for files.
 *
 * It provides methods to read and store files in the DDC.
 *
 * @group Files
 */
export class FileStorage {
  private ddcNode: NodeInterface;
  private logger: Logger;
  private blockchain?: Blockchain;

  constructor(config: RouterConfig & Config);
  constructor(router: Router, config: Config);
  constructor(configOrRouter: (RouterConfig & Config) | Router, config?: Config) {
    let finalConfig: Config | undefined;

    if (configOrRouter instanceof Router) {
      finalConfig = config;

      this.logger = createLogger('FileStorage', config);
      this.ddcNode = new BalancedNode({ ...config, router: configOrRouter, logger: this.logger });

      this.logger.debug(config, 'FileStorage created');
    } else {
      finalConfig = configOrRouter;

      this.logger = createLogger('FileStorage', configOrRouter);
      this.blockchain = 'blockchain' in configOrRouter ? configOrRouter.blockchain : undefined;
      this.ddcNode = new BalancedNode({
        logger: this.logger,
        retries: configOrRouter.retries,
        router: new Router({ ...configOrRouter, logger: this.logger }),
      });

      this.logger.debug(configOrRouter, 'FileStorage created');
    }

    if (finalConfig?.logErrors === false) {
      bindErrorLogger(this, this.logger, ['store', 'read']);
    }
  }

  /**
   * Creates a new instance of the `FileStorage` class asynchronously.
   *
   * @param uriOrSigner - A Signer instance or a [substrate URI](https://polkadot.js.org/docs/keyring/start/suri).
   * @param config - Configuration options for the `FileStorage`. Defaults to TESTNET.
   *
   * @returns A promise that resolves to a new `FileStorage` instance.
   *
   * * @example
   *
   * ```typescript
   * import { FileStorage, TESTNET } from '@cere-ddc-sdk/file-storage';
   *
   * const fileStorage = await FileStorage.create('//Alice', TESTNET);
   * ```
   */
  static async create(uriOrSigner: Signer | string, config: FileStorageConfig = DEFAULT_PRESET) {
    const signer = typeof uriOrSigner === 'string' ? new UriSigner(uriOrSigner) : uriOrSigner;
    const blockchain =
      typeof config.blockchain === 'string'
        ? await Blockchain.connect({ wsEndpoint: config.blockchain })
        : config.blockchain;

    return new FileStorage({ ...config, blockchain, signer });
  }

  async disconnect() {
    await this.blockchain?.disconnect();
  }

  private async storeLarge(bucketId: BucketId, file: File, { partSize, ...options }: LargeFileStoreOptions) {
    const parts: string[] = [];
    const partsStream = file.body.pipeThrough<Uint8Array>(withChunkSize(partSize));

    let offset = 0;
    for await (const part of partsStream) {
      const piece = new Piece(part, { multipartOffset: offset });
      const cid = await this.ddcNode.storePiece(bucketId, piece, {
        accessToken: options?.accessToken,
      });

      offset += part.byteLength;
      parts.push(cid);
    }

    return this.ddcNode.storePiece(bucketId, new MultipartPiece(parts, { totalSize: file.size, partSize }), options);
  }

  private async storeSmall(bucketId: BucketId, file: File, options?: FileStoreOptions) {
    const content = new Uint8Array(await streamConsumers.arrayBuffer(file.body));

    return this.ddcNode.storePiece(bucketId, new Piece(content), options);
  }

  /**
   * Stores a file in the DDC. Large files are stored as a collection of pieces.
   *
   * @param bucketId - The ID of the bucket where the file will be stored.
   * @param file - The file to store.
   * @param options - The options for storing the file.
   *
   * @returns A promise that resolves to the CID of the stored file.
   *
   * @example
   *
   * ```typescript
   * const bucketId = 1n;
   * const fileContent = ...;
   * const file: File = new File(fileContent, { size: 1000 });
   * const fileCid = await fileStorage.store(bucketId, file);
   *
   * console.log(fileCid);
   * ```
   */
  async store(bucketId: BucketId, file: File, options: FileStoreOptions = {}) {
    this.logger.info('Storing file into bucket %s', bucketId);
    this.logger.debug({ bucketId, file, options }, 'Store file');

    const partSize = options?.maxBufferSize || DEFAULT_BUFFER_SIZE;

    if (partSize > MAX_BUFFER_SIZE || partSize < MIN_BUFFER_SIZE) {
      throw new Error(`Max buffer size must be between ${MIN_BUFFER_SIZE} and ${MAX_BUFFER_SIZE} bytes`);
    }

    const cid =
      file.size > partSize
        ? await this.storeLarge(bucketId, file, { ...options, partSize })
        : await this.storeSmall(bucketId, file, options);

    this.logger.info('File stored with CID %s', cid);

    return cid;
  }

  /**
   * Reads a file from the file storage.
   *
   * @param bucketId - The ID of the bucket where the file is stored.
   * @param cidOrName - The CID or CNS name of the file to read.
   * @param options - The options for reading the file.
   *
   * @returns A promise that resolves to a `FileResponse` instance.
   *
   * @example
   *
   * ```typescript
   * const bucketId = 1n;
   * const fileCid = 'CID';
   * const file = await fileStorage.read(bucketId, fileCid);
   * const content = await file.text();
   *
   * console.log(content);
   * ```
   */
  async read(bucketId: BucketId, cidOrName: string, options?: FileReadOptions) {
    this.logger.info('Reading file from bucket %s by "%s"', bucketId, cidOrName);
    const piece = await this.ddcNode.readPiece(bucketId, cidOrName, options);
    this.logger.info('File response created with CID %s', piece.cid);

    return new FileResponse(piece.cid, piece.body, options);
  }
}
