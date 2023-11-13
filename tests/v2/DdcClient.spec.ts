import {DagNode, DagNodeUri, DdcClient, File, FileUri, KB, MB, Tag} from '@cere-ddc-sdk/ddc-client';

import {ROOT_USER_SEED, createDataStream, getContractOptions} from '../helpers';

describe('DDC Client', () => {
    const bucketId = 0n;
    let client: DdcClient;

    beforeAll(async () => {
        client = await DdcClient.create(ROOT_USER_SEED, {
            smartContract: getContractOptions(),
            nodes: [
                {rpcHost: 'localhost:9091'},
                {rpcHost: 'localhost:9092'},
                {rpcHost: 'localhost:9093'},
                {rpcHost: 'localhost:9094'},
            ],
        });
    });

    afterAll(async () => {
        await client.disconnect();
    });

    describe('Files', () => {
        let uri: FileUri;
        let tinyUri: FileUri;
        const fileSize = 2 * MB;
        const fileStream = createDataStream(fileSize, 64 * KB);
        const tinyFileName = 'test/tiny-file';
        const tinyFileText = 'Tiny file';
        const tinyFileData = new TextEncoder().encode('Tiny file');

        test('Store medium file', async () => {
            const file = new File(fileStream, {
                size: fileSize,
            });

            uri = await client.store(bucketId, file);

            expect(uri).toEqual({
                bucketId,
                entity: 'file',
                cidOrName: expect.any(String),
                cid: expect.any(String),
            });
        });

        test('Read medium file', async () => {
            const file = await client.read(uri);
            const buffer = await file.arrayBuffer();

            expect(buffer.byteLength).toEqual(fileSize);
        });

        test('Read a range of medium file', async () => {
            const file = await client.read(uri, {
                range: {
                    start: 0,
                    end: 32 * KB - 1,
                },
            });

            const buffer = await file.arrayBuffer();

            expect(buffer.byteLength).toEqual(32 * KB);
        });

        test('Store tiny file', async () => {
            const file = new File(tinyFileData);

            tinyUri = await client.store(bucketId, file);

            expect(tinyUri).toEqual({
                bucketId,
                entity: 'file',
                cidOrName: expect.any(String),
                cid: expect.any(String),
            });
        });

        test('Read tiny file', async () => {
            const file = await client.read(tinyUri);
            const text = await file.text();

            expect(text).toEqual(tinyFileText);
        });

        test('Store named tiny file', async () => {
            const file = new File(tinyFileData);
            const uri = await client.store(bucketId, file, {
                name: tinyFileName,
            });

            expect(uri).toEqual({
                bucketId,
                entity: 'file',
                name: tinyFileName,
                cidOrName: expect.any(String),
                cid: expect.any(String),
            });
        });

        test('Read tiny file by name', async () => {
            const namedUri = new FileUri(bucketId, tinyFileName);
            const file = await client.read(namedUri);
            const text = await file.text();

            expect(namedUri.name).toEqual(tinyFileName);
            expect(text).toEqual(tinyFileText);
        });
    });

    describe('DAG Node', () => {
        let uri: DagNodeUri;
        const nodeName = 'ddc-client/test-dag-node';
        const nodeData = 'Hello Dag node test';

        test('Store DAG node', async () => {
            const dagNode = new DagNode(nodeData, [], [new Tag('key', 'value')]);

            uri = await client.store(bucketId, dagNode);

            expect(uri).toEqual({
                bucketId,
                entity: 'dag-node',
                cidOrName: expect.any(String),
                cid: expect.any(String),
            });
        });

        test('Read DAG node', async () => {
            const dagNode = await client.read(uri);

            expect(dagNode.data.toString()).toEqual(nodeData);
            expect(dagNode.tags).toEqual([new Tag('key', 'value')]);
        });

        test('Store named DAG node', async () => {
            const dagNode = new DagNode(nodeData, [], [new Tag('key', 'value')]);
            const uri = await client.store(bucketId, dagNode, {
                name: nodeName,
            });

            expect(uri).toEqual({
                bucketId,
                entity: 'dag-node',
                cidOrName: expect.any(String),
                name: nodeName,
                cid: expect.any(String),
            });
        });

        test('Read DAG node by name', async () => {
            const namedUri = new DagNodeUri(bucketId, nodeName);
            const dagNode = await client.read(namedUri);

            expect(namedUri.name).toEqual(nodeName);
            expect(dagNode.data.toString()).toEqual(nodeData);
        });
    });

    /**
     * Moke tests of blockchain operation methods exposed on the client instance
     *
     * TODO: Revise these methods during migration to palettes
     */
    describe('Blockhain operations', () => {
        let createdBucketId: bigint;

        test('Account deposit', async () => {
            await client.accountDeposit(10n);
        });

        test('Create bucket', async () => {
            const bucket = await client.createBucket(10n, 1n, 0);

            createdBucketId = bucket.bucketId;

            expect(createdBucketId).toEqual(expect.any(BigInt));
        });

        test('Bucket allocate into cluster', async () => {
            await client.bucketAllocIntoCluster(createdBucketId, 1n);
        });

        test('Get bucket', async () => {
            const bucket = await client.bucketGet(createdBucketId);

            expect(bucket.bucketId).toEqual(createdBucketId);
        });

        test('Get bucket list', async () => {
            const [buckets, totalCount] = await client.bucketList(0n, 10n);

            expect(totalCount).toBeGreaterThan(0);
            expect(buckets.length).toEqual(Number(totalCount));
        });
    });
});
