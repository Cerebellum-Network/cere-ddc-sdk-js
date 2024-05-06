import * as path from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';
import { FileStorage, File } from '@cere-ddc-sdk/file-storage';

import { createDataStream, getBlockchainState, getClientConfig, MB, ROOT_USER_SEED } from '../helpers';

describe('File storage', () => {
  const {
    bucketIds: [bucketId],
  } = getBlockchainState();

  let fileStorage: FileStorage;

  beforeAll(async () => {
    fileStorage = await FileStorage.create(ROOT_USER_SEED, getClientConfig());
  });

  afterAll(async () => {
    await fileStorage.disconnect();
  });

  describe('Small file', () => {
    let fileCid: string;
    const fileSize = 2 * MB;
    const fileStream = createDataStream(fileSize);

    test('Store a file', async () => {
      const file = new File(fileStream, {
        size: fileSize,
      });

      fileCid = await fileStorage.store(bucketId, file);

      expect(fileCid).toEqual(expect.any(String));
    });

    test('Read the file', async () => {
      const file = await fileStorage.read(bucketId, fileCid);
      const buffer = await file.arrayBuffer();

      expect(buffer.byteLength).toEqual(fileSize);
    });
  });

  describe('Large file', () => {
    let fileCid: string;
    const fileSize = 500 * MB;
    const fileStream = createDataStream(fileSize, {
      chunkSize: 1 * MB, // Use 1 MB chank size to make the test faster
    });

    test('Store a file', async () => {
      const file = new File(fileStream, {
        size: fileSize,
      });

      fileCid = await fileStorage.store(bucketId, file);

      expect(fileCid).toEqual(expect.any(String));
    });

    test('Read the file', async () => {
      const file = await fileStorage.read(bucketId, fileCid);
      const buffer = await file.arrayBuffer();

      expect(buffer.byteLength).toEqual(fileSize);
    });

    test('Read a range of the file', async () => {
      const file = await fileStorage.read(bucketId, fileCid, {
        range: {
          start: 0,
          end: 64 * MB - 1,
        },
      });

      const buffer = await file.arrayBuffer();

      expect(buffer.byteLength).toEqual(64 * MB);
    });
  });

  describe('Real file', () => {
    let fileCid: string;

    const fileHash = '420e4db24f5874bc5e585b73e50cbf9f';
    const fileName = '2.2mb.jpg';
    const filePath = path.resolve(__dirname, '../fixtures/files', fileName);
    const fileStats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);

    test('Store a file', async () => {
      const file = new File(fileStream, {
        size: fileStats.size,
      });

      fileCid = await fileStorage.store(bucketId, file, {
        name: fileName,
      });

      expect(fileCid).toEqual(expect.any(String));
    });

    test('Read the file', async () => {
      expect(fileCid).toBeDefined();

      const file = await fileStorage.read(bucketId, fileCid);
      const hash = createHash('md5');
      await pipeline(Readable.fromWeb(file.body), hash);

      expect(hash.digest('hex')).toEqual(fileHash);
    });

    test('Read the file by name', async () => {
      expect(fileCid).toBeDefined();

      const file = await fileStorage.read(bucketId, fileName);
      const hash = createHash('md5');
      await pipeline(Readable.fromWeb(file.body), hash);

      expect(hash.digest('hex')).toEqual(fileHash);
    });

    test('Read a non-existing file by name', async () => {
      expect(fileStorage.read(bucketId, 'random/file/name')).rejects.toThrow();
    });
  });
});
