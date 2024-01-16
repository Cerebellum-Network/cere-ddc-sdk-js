import { AuthToken, AuthTokenOperation, DdcClient, File, FileUri, MB, UriSigner } from '@cere-ddc-sdk/ddc-client';
import { KB, ROOT_USER_SEED, createDataStream, getBlockchainState, getClientConfig } from '../helpers';

const createFile = (size: number) => new File(createDataStream(size), { size });

describe('Auth', () => {
  const {
    bucketIds: [publicBucketId, privateBucketId],
  } = getBlockchainState();

  const ownerSigner = new UriSigner(ROOT_USER_SEED);
  const readerSigner = new UriSigner('//Bob');

  let ownerClient: DdcClient;
  let readerClient: DdcClient;
  let normalFile: File;
  let largeFile: File;

  beforeAll(async () => {
    const configs = getClientConfig();

    ownerClient = await DdcClient.create(ownerSigner, configs);
    readerClient = await DdcClient.create(readerSigner, configs);
  });

  afterAll(async () => {
    await ownerClient.disconnect();
    await readerClient.disconnect();
  });

  beforeEach(async () => {
    normalFile = createFile(KB);
    largeFile = createFile(150 * MB);
  });

  describe('Auth token', () => {
    const rootToken = new AuthToken({
      bucketId: privateBucketId,
      operations: [AuthTokenOperation.PUT, AuthTokenOperation.GET],
    });

    let delegatedToken: string;

    beforeAll(async () => {
      await rootToken.sign(ownerSigner);
    });

    test('Delegate token', async () => {
      const token = new AuthToken({
        subject: readerSigner.address,
        operations: [AuthTokenOperation.GET],
      });

      await token.sign(ownerSigner);

      delegatedToken = token.toString();

      expect(delegatedToken).toEqual(expect.any(String));
      expect(token.canDelegate).toEqual(false);
      expect(token.operations).toEqual([AuthTokenOperation.GET]);
    });

    test('Accept token delegation', async () => {
      expect(delegatedToken).toBeDefined();

      const token = AuthToken.from(delegatedToken);
      await token.sign(readerSigner);

      expect(token.canDelegate).toEqual(false);
      expect(token.operations).toEqual([AuthTokenOperation.GET]);
    });
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

    test('Reader can not read from private bucket', async () => {
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

  describe('Bucket access delegation', () => {
    let privateFileUri: FileUri;
    let writeToken: AuthToken;
    let readToken: AuthToken;

    beforeAll(async () => {
      privateFileUri = await ownerClient.store(privateBucketId, createFile(KB));
    });

    test('Owner grants access', async () => {
      writeToken = await ownerClient.grantAccess(readerSigner.address, {
        bucketId: privateBucketId,
        operations: [AuthTokenOperation.PUT],
      });

      readToken = await ownerClient.grantAccess(readerSigner.address, {
        bucketId: privateBucketId,
        operations: [AuthTokenOperation.GET],
      });

      expect(writeToken).toBeDefined();
      expect(readToken).toBeDefined();
    });

    test('Reader can store', async () => {
      expect(writeToken).toBeDefined();

      const fileUri = await readerClient.store(privateBucketId, normalFile, { accessToken: writeToken });

      expect(fileUri.cid).toBeDefined();
    });

    test('Reader can store large file', async () => {
      expect(writeToken).toBeDefined();

      const fileUri = await readerClient.store(privateBucketId, largeFile, { accessToken: writeToken });

      expect(fileUri.cid).toBeDefined();
    });

    test('Reader can read', async () => {
      expect(readToken).toBeDefined();

      const file = await readerClient.read(privateFileUri, { accessToken: readToken });

      expect(file.cid).toEqual(privateFileUri.cid);
    });

    test('Reader can not read with write-only token', async () => {
      expect(writeToken).toBeDefined();

      await expect(readerClient.read(privateFileUri, { accessToken: writeToken })).rejects.toThrow();
    });

    test('Reader can not store with read-only token', async () => {
      expect(readToken).toBeDefined();

      await expect(readerClient.store(privateBucketId, normalFile, { accessToken: readToken })).rejects.toThrow();
    });
  });
});
