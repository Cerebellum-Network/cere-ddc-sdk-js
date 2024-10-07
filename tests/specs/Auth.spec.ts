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
  const userSigner = new UriSigner('//Bob');

  let ownerClient: DdcClient;
  let userClient: DdcClient;
  let normalFile: File;
  let largeFile: File;

  beforeAll(async () => {
    const configs = getClientConfig();

    ownerClient = await DdcClient.create(ownerSigner, configs);
    userClient = await DdcClient.create(userSigner, configs);
  });

  afterAll(async () => {
    await ownerClient.disconnect();
    await userClient.disconnect();
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
        subject: userSigner.address,
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
      await token.sign(userSigner);

      expect(token.canDelegate).toEqual(false);
      expect(token.operations).toEqual([AuthTokenOperation.GET]);
    });
  });

  describe('Token validation', () => {
    let rootToken: AuthToken;
    let delegatedToken: AuthToken;

    beforeEach(async () => {
      rootToken = await AuthToken.fullAccess().sign(ownerSigner);
      delegatedToken = new AuthToken({
        parent: rootToken,
        subject: userSigner.address,
        operations: [AuthTokenOperation.GET],
      });
    });

    test('Valid token chain', async () => {
      await delegatedToken.sign(ownerSigner);
      const finalToken = await AuthToken.from(delegatedToken).sign(userSigner);

      expect(finalToken.validate()).resolves.not.toThrow();
    });

    test('Last token of the chain is unsigned', async () => {
      await delegatedToken.sign(ownerSigner);
      const finalToken = AuthToken.from(delegatedToken);

      expect(finalToken.validate()).rejects.toThrow('Token is not signed');
    });

    test('One token in the middle of the chain is unsigned', async () => {
      const finalToken = await AuthToken.from(delegatedToken).sign(userSigner);

      expect(finalToken.validate()).rejects.toThrow('Token is not signed');
    });

    test('Expired token', async () => {
      const finalToken = new AuthToken({
        operations: [AuthTokenOperation.GET],
        expiresAt: Date.parse('2021-01-01'),
      });

      expect(finalToken.validate()).rejects.toThrow('Token is expired');
    });

    test('Invalid signature', async () => {
      const finalToken = new AuthToken({
        operations: [AuthTokenOperation.GET],
        expiresAt: Date.parse('2021-01-01'),
      });

      await finalToken.sign(userSigner);

      /**
       * Change the signature value to an invalid one
       */
      finalToken.signature!.value = new Uint8Array([1, 2, 3]);

      expect(finalToken.validate()).rejects.toThrow('Token is expired');
    });
  });

  describe('Bucket access', () => {
    let publicFileUri: FileUri;
    let privateFileUri: FileUri;

    const readToken = new AuthToken({
      bucketId: privateBucketId,
      operations: [AuthTokenOperation.GET],
    });

    const writeToken = new AuthToken({
      bucketId: privateBucketId,
      operations: [AuthTokenOperation.PUT],
    });

    beforeAll(async () => {
      await readToken.sign(ownerSigner);
      await writeToken.sign(ownerSigner);
    });

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

    test('User can read from public bucket', async () => {
      expect(publicFileUri).toBeDefined();

      const file = await userClient.read(publicFileUri);

      expect(file.cid).toEqual(publicFileUri.cid);
    });

    test('User can not read from private bucket', async () => {
      expect(privateFileUri).toBeDefined();

      await expect(userClient.read(privateFileUri)).rejects.toThrow();
    });

    test('User can not store to public bucket', async () => {
      expect(publicBucketId).toBeDefined();

      await expect(userClient.store(publicBucketId, normalFile)).rejects.toThrow();
    });

    test('User can not store to private bucket', async () => {
      await expect(userClient.store(privateBucketId, normalFile)).rejects.toThrow();
    });

    test('User can not store large file to public bucket', async () => {
      await expect(userClient.store(publicBucketId, largeFile)).rejects.toThrow();
    });

    test('User can read from private bucket with access token', async () => {
      expect(privateFileUri).toBeDefined();

      const file = await userClient.read(privateFileUri, {
        accessToken: readToken,
      });

      expect(file.cid).toEqual(privateFileUri.cid);
    });

    test('User can store to private bucket with access token', async () => {
      const uri = await userClient.store(privateBucketId, normalFile, {
        accessToken: writeToken,
      });

      expect(uri.cid).toBeDefined();
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
      writeToken = await ownerClient.grantAccess(userSigner.address, {
        bucketId: privateBucketId,
        operations: [AuthTokenOperation.PUT],
      });

      readToken = await ownerClient.grantAccess(userSigner.address, {
        bucketId: privateBucketId,
        operations: [AuthTokenOperation.GET],
      });

      expect(writeToken).toBeDefined();
      expect(readToken).toBeDefined();
    });

    test('User can store file to private bucket', async () => {
      expect(writeToken).toBeDefined();

      const fileUri = await userClient.store(privateBucketId, normalFile, { accessToken: writeToken });

      expect(fileUri.cid).toBeDefined();
    });

    test('User can store large file to private bucket', async () => {
      expect(writeToken).toBeDefined();

      const fileUri = await userClient.store(privateBucketId, largeFile, { accessToken: writeToken });

      expect(fileUri.cid).toBeDefined();
    });

    test('User can read from private bucket', async () => {
      expect(readToken).toBeDefined();

      const file = await userClient.read(privateFileUri, { accessToken: readToken });

      expect(file.cid).toEqual(privateFileUri.cid);
    });

    test('User can not read file with write-only token', async () => {
      expect(writeToken).toBeDefined();

      await expect(userClient.read(privateFileUri, { accessToken: writeToken })).rejects.toThrow();
    });

    test('User can not store file with read-only token', async () => {
      expect(readToken).toBeDefined();

      await expect(userClient.store(privateBucketId, normalFile, { accessToken: readToken })).rejects.toThrow();
    });

    test('User can store DagNode to private bucket', async () => {
      expect(writeToken).toBeDefined();

      const dagNodeUri = await userClient.store(privateBucketId, new DagNode(new Uint8Array([1, 2, 3]), [], []), {
        accessToken: writeToken,
      });

      expect(dagNodeUri.cid).toBeDefined();
    });

    test('User can read DagNode from private bucket', async () => {
      expect(readToken).toBeDefined();

      const dagNode = await userClient.read(privateDagNodeUri, { accessToken: readToken });

      expect(dagNode.cid).toEqual(privateDagNodeUri.cid);
    });
  });
});
