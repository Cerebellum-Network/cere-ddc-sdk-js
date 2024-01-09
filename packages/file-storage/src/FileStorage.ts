import { Blockchain, BucketId } from '@cere-ddc-sdk/blockchain';
import {
  PieceReadOptions,
  MAX_PIECE_SIZE,
  Piece,
  MultipartPiece,
  splitStream,
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
  private ddcNode: NodeInterface;
  private logger: Logger;

  constructor(config: RouterConfig);
  constructor(router: Router, config: Config);
  constructor(configOrRouter: RouterConfig | Router, config?: Config) {
    if (configOrRouter instanceof Router) {
      this.logger = createLogger('FileStorage', config);
      this.ddcNode = new BalancedNode(configOrRouter);

      this.logger.debug(config, 'FileStorage created');
    } else {
      this.logger = createLogger('FileStorage', configOrRouter);
      this.ddcNode = new BalancedNode(new Router({ ...configOrRouter, logger: this.logger }));

      this.logger.debug(configOrRouter, 'FileStorage created');
    }

    bindErrorLogger(this, this.logger, ['store', 'read']);
  }

  static async create(uriOrSigner: Signer | string, config: FileStorageConfig = DEFAULT_PRESET) {
    const signer = typeof uriOrSigner === 'string' ? new UriSigner(uriOrSigner) : uriOrSigner;
    const blockchain =
      typeof config.blockchain === 'string'
        ? await Blockchain.connect({ wsEndpoint: config.blockchain })
        : config.blockchain;

    return new FileStorage(new Router({ ...config, blockchain, signer }), config);
  }

  private async storeLarge(bucketId: BucketId, file: File, options?: FileStoreOptions) {
    const parts = await splitStream(file.body, MAX_PIECE_SIZE, (content, multipartOffset) => {
      const piece = new Piece(content, {
        multipartOffset,
        size: Math.min(file.size - multipartOffset, MAX_PIECE_SIZE),
      });

      return this.ddcNode.storePiece(bucketId, piece);
    });

    return this.ddcNode.storePiece(
      bucketId,
      new MultipartPiece(parts, { totalSize: file.size, partSize: MAX_PIECE_SIZE }),
      options,
    );
  }

  private async storeSmall(bucketId: BucketId, file: File, options?: FileStoreOptions) {
    return this.ddcNode.storePiece(bucketId, new Piece(file.body, { size: file.size }), options);
  }

  async store(bucketId: BucketId, file: File, options?: FileStoreOptions) {
    this.logger.info(options, 'Storing file into bucket %s', bucketId);
    this.logger.debug({ file }, 'File');

    const isLarge = file.size > MAX_PIECE_SIZE;
    const cid = isLarge
      ? await this.storeLarge(bucketId, file, options)
      : await this.storeSmall(bucketId, file, options);

    this.logger.info({ cid }, 'File stored');

    return cid;
  }

  async read(bucketId: BucketId, cidOrName: string, options?: FileReadOptions) {
    this.logger.info(options, 'Reading file from bucket %s by "%s"', bucketId, cidOrName);
    const piece = await this.ddcNode.readPiece(bucketId, cidOrName, options);
    this.logger.info({ cid: piece.cid }, 'File read');

    return new FileResponse(piece.cid, piece.body, options);
  }
}
