import { Blockchain, BucketId } from '@cere-ddc-sdk/blockchain';
import {
  PieceReadOptions,
  MAX_PIECE_SIZE,
  Piece,
  MultipartPiece,
  splitStream,
  Router,
  RouterOperation,
  StorageNode,
  PieceStoreOptions,
  Signer,
  UriSigner,
  RouterConfig,
  ConfigPreset,
  DEFAULT_PRESET,
  Logger,
  createLogger,
  LoggerOptions,
} from '@cere-ddc-sdk/ddc';

import { File, FileResponse } from './File';

type Config = LoggerOptions;

export type FileStorageConfig = Config &
  Omit<ConfigPreset, 'blockchain'> & {
    blockchain: Blockchain | ConfigPreset['blockchain'];
  };

export type FileReadOptions = PieceReadOptions;
export type FileStoreOptions = PieceStoreOptions;

export class FileStorage {
  private router: Router;
  private logger: Logger;

  constructor(config: RouterConfig);
  constructor(router: Router, config: Config);
  constructor(configOrRouter: RouterConfig | Router, config?: Config) {
    if (configOrRouter instanceof Router) {
      this.router = configOrRouter;
      this.logger = createLogger({ ...config, prefix: 'FileStorage' });

      this.logger.debug('FileStorage created', config);
    } else {
      this.router = new Router(configOrRouter);
      this.logger = createLogger({ ...configOrRouter, prefix: 'FileStorage' });

      this.logger.debug('FileStorage created', configOrRouter);
    }
  }

  static async create(uriOrSigner: Signer | string, config: FileStorageConfig = DEFAULT_PRESET) {
    const signer = typeof uriOrSigner === 'string' ? new UriSigner(uriOrSigner) : uriOrSigner;
    const blockchain =
      typeof config.blockchain === 'string'
        ? await Blockchain.connect({ account: signer, wsEndpoint: config.blockchain })
        : config.blockchain;

    return new FileStorage(new Router({ ...config, blockchain, signer }), config);
  }

  private async storeLarge(node: StorageNode, bucketId: BucketId, file: File, options?: FileStoreOptions) {
    const parts = await splitStream(file.body, MAX_PIECE_SIZE, (content, multipartOffset) => {
      const piece = new Piece(content, {
        multipartOffset,
        size: Math.min(file.size - multipartOffset, MAX_PIECE_SIZE),
      });

      return node.storePiece(bucketId, piece);
    });

    return node.storePiece(
      bucketId,
      new MultipartPiece(await Promise.all(parts), { totalSize: file.size, partSize: MAX_PIECE_SIZE }),
      options,
    );
  }

  private async storeSmall(node: StorageNode, bucketId: BucketId, file: File, options?: FileStoreOptions) {
    return node.storePiece(bucketId, new Piece(file.body, { size: file.size }), options);
  }

  async store(bucketId: BucketId, file: File, options?: FileStoreOptions) {
    this.logger.info(`Storing file into bucket ${bucketId}`);
    this.logger.debug('File', file);

    const isLarge = file.size > MAX_PIECE_SIZE;
    const node = await this.router.getNode(RouterOperation.STORE_PIECE, BigInt(bucketId));
    const cid = isLarge
      ? await this.storeLarge(node, bucketId, file, options)
      : await this.storeSmall(node, bucketId, file, options);

    this.logger.info(`File stored`, { cid });

    return cid;
  }

  async read(bucketId: BucketId, cidOrName: string, options?: FileReadOptions) {
    this.logger.info(`Reading file from bucket ${bucketId} by "${cidOrName}"`);

    const node = await this.router.getNode(RouterOperation.READ_PIECE, BigInt(bucketId));
    const piece = await node.readPiece(bucketId, cidOrName, options);

    this.logger.info('File read', { cid: piece.cid });

    return new FileResponse(piece.cid, piece.body, options);
  }
}
