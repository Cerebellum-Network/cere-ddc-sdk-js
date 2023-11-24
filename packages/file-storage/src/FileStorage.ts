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
} from '@cere-ddc-sdk/ddc';

import { File, FileResponse } from './File';

export type FileStorageConfig = Omit<ConfigPreset, 'blockchain'> & {
  blockchain: Blockchain | ConfigPreset['blockchain'];
};

export type FileReadOptions = PieceReadOptions;
export type FileStoreOptions = PieceStoreOptions;

export class FileStorage {
  private router: Router;

  constructor(router: Router);
  constructor(config: RouterConfig);
  constructor(configOrRouter: RouterConfig | Router) {
    this.router = configOrRouter instanceof Router ? configOrRouter : new Router(configOrRouter);
  }

  static async create(uriOrSigner: Signer | string, config: FileStorageConfig = DEFAULT_PRESET) {
    const signer = typeof uriOrSigner === 'string' ? new UriSigner(uriOrSigner) : uriOrSigner;
    const blockchain =
      config.blockchain instanceof Blockchain
        ? config.blockchain
        : await Blockchain.connect({ account: signer, wsEndpoint: config.blockchain });

    return new FileStorage(new Router({ ...config, blockchain, signer }));
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
    const isLarge = file.size > MAX_PIECE_SIZE;
    const node = await this.router.getNode(RouterOperation.STORE_PIECE, BigInt(bucketId));
    const cid = isLarge
      ? await this.storeLarge(node, bucketId, file, options)
      : await this.storeSmall(node, bucketId, file, options);

    return cid;
  }

  async read(bucketId: BucketId, cidOrName: string, options?: FileReadOptions) {
    const node = await this.router.getNode(RouterOperation.READ_PIECE, BigInt(bucketId));
    const piece = await node.readPiece(bucketId, cidOrName, options);

    return new FileResponse(piece.cid, piece.body, options);
  }
}
