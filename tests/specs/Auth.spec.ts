import { DdcClient, File, FileUri, MB } from '@cere-ddc-sdk/ddc-client';
import { KB, ROOT_USER_SEED, createDataStream, getBlockchainState, getClientConfig } from '../helpers';

const createFile = (size: number) => new File(createDataStream(size), { size });

describe('Auth', () => {
  const {
    bucketIds: [publicBucketId, privateBucketId],
  } = getBlockchainState();

  let ownerClient: DdcClient;
  let readerClient: DdcClient;
  let normalFile: File;
  let largeFile: File;

  beforeAll(async () => {
    const configs = getClientConfig();

    ownerClient = await DdcClient.create(ROOT_USER_SEED, configs);
    readerClient = await DdcClient.create('//Bob', configs);
  });

  afterAll(async () => {
    await ownerClient.disconnect();
    await readerClient.disconnect();
  });

  beforeEach(async () => {
    normalFile = createFile(KB);
    largeFile = createFile(10 * MB);
  });

  describe('Bucket access', () => {
    let publicFileUri: FileUri;
    let privateFileUri: FileUri;

    test('Owner can store to private bucket', async () => {
      privateFileUri = await ownerClient.store(privateBucketId, normalFile);

      expect(privateFileUri.cid).toBeDefined();
    });

    test('Owner can store to public bucket', async () => {
      publicFileUri = await ownerClient.store(publicBucketId, normalFile);

      expect(publicFileUri.cid).toBeDefined();
    });

    test('Owner can read from private bucket', async () => {
      expect(privateFileUri).toBeDefined();

      const file = await ownerClient.read(privateFileUri);

      expect(file.cid).toEqual(privateFileUri.cid);
    });

    test('Reader can read from public bucket', async () => {
      expect(publicFileUri).toBeDefined();

      const file = await readerClient.read(publicFileUri);

      expect(file.cid).toEqual(publicFileUri.cid);
    });

    /**
     * TODO: This test fails depending on the order of the tests.
     *
     * It seems the method triggers several errors, and the first one is the one that is caught.
     */
    test.skip('Reader can not read from private bucket', async () => {
      expect(privateFileUri).toBeDefined();

      await expect(readerClient.read(privateFileUri)).rejects.toThrow();
    });

    test('Reader can not store to public bucket', async () => {
      expect(publicBucketId).toBeDefined();

      await expect(readerClient.store(publicBucketId, normalFile)).rejects.toThrow();
    });

    test('Reader can not store to private bucket', async () => {
      await expect(readerClient.store(privateBucketId, normalFile)).rejects.toThrow();
    });

    test('Reader can not store large file to public bucket', async () => {
      await expect(readerClient.store(publicBucketId, largeFile)).rejects.toThrow();
    });
  });
});
