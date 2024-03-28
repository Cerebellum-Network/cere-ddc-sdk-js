import {
  AuthToken,
  AuthTokenOperation,
  DagNode,
  DagNodeUri,
  DdcClient,
  File,
  FileUri,
  MB,
  UriSigner,
} from '@cere-ddc-sdk/ddc-client';

import {
  KB,
  ROOT_USER_SEED,
  createDataStream,
  DataStreamOptions,
  getBlockchainState,
  getClientConfig,
} from '../helpers';

const createFile = (size: number, options?: DataStreamOptions) => new File(createDataStream(size, options), { size });

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
    largeFile = createFile(150 * MB, {
      chunkSize: 1 * MB, // Use 1 MB chunk size to make the test faster
    });
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
    let privateDagNodeUri: DagNodeUri;
    let writeToken: AuthToken;
    let readToken: AuthToken;

    beforeAll(async () => {
      privateFileUri = await ownerClient.store(privateBucketId, createFile(KB));
      privateDagNodeUri = await ownerClient.store(privateBucketId, new DagNode(new Uint8Array([1, 2, 3]), [], []));
    });

    test('Owner grants access to private bucket', async () => {
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

    test('Reader can store file to private bucket', async () => {
      expect(writeToken).toBeDefined();

      const fileUri = await readerClient.store(privateBucketId, normalFile, { accessToken: writeToken });

      expect(fileUri.cid).toBeDefined();
    });

    test('Reader can store large file to private bucket', async () => {
      expect(writeToken).toBeDefined();

      const fileUri = await readerClient.store(privateBucketId, largeFile, { accessToken: writeToken });

      expect(fileUri.cid).toBeDefined();
    });

    test('Reader can read from private bucket', async () => {
      expect(readToken).toBeDefined();

      const file = await readerClient.read(privateFileUri, { accessToken: readToken });

      expect(file.cid).toEqual(privateFileUri.cid);
    });

    test('Reader can not read file with write-only token', async () => {
      expect(writeToken).toBeDefined();

      await expect(readerClient.read(privateFileUri, { accessToken: writeToken })).rejects.toThrow();
    });

    test('Reader can not store file with read-only token', async () => {
      expect(readToken).toBeDefined();

      await expect(readerClient.store(privateBucketId, normalFile, { accessToken: readToken })).rejects.toThrow();
    });

    test('Reader can store DagNode to private bucket', async () => {
      expect(writeToken).toBeDefined();

      const dagNodeUri = await readerClient.store(privateBucketId, new DagNode(new Uint8Array([1, 2, 3]), [], []), {
        accessToken: writeToken,
      });

      expect(dagNodeUri.cid).toBeDefined();
    });

    test('Reader can read DagNode from private bucket', async () => {
      expect(readToken).toBeDefined();

      const dagNode = await readerClient.read(privateDagNodeUri, { accessToken: readToken });

      expect(dagNode.cid).toEqual(privateDagNodeUri.cid);
    });
  });
});
