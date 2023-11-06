import {DagNode, DagNodeUri, DdcClient, File, FileUri, KB, MB, Tag} from '@cere-ddc-sdk/ddc-client';

import {ROOT_USER_SEED, createDataStream, getContractOptions} from '../helpers';

describe('DDC Client', () => {
    const bucketId = 0n;
    let client: DdcClient;

    beforeAll(async () => {
        client = await DdcClient.buildAndConnect(
            {
                smartContract: getContractOptions(),
                nodes: [
                    {rpcHost: 'localhost:9091'},
                    {rpcHost: 'localhost:9092'},
                    {rpcHost: 'localhost:9093'},
                    {rpcHost: 'localhost:9094'},
                ],
            },
            ROOT_USER_SEED,
        );
    });

    afterAll(async () => {
        await client.disconnect();
    });

    describe('Files', () => {
        let uri: FileUri;
        let tinyUri: FileUri;
        const fileSize = 2 * MB;
        const fileStream = createDataStream(fileSize, 64 * KB);
        const tinyFileText = 'Tiny file';
        const tinyFileData = new TextEncoder().encode('Tiny file');

        test('Store medium file', async () => {
            const file = new File(fileStream, {
                size: fileSize,
            });

            uri = await client.store(bucketId, file);

            expect(uri).toEqual({
                bucketId: 0,
                entity: 'file',
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
                bucketId: 0,
                entity: 'file',
                cid: expect.any(String),
            });
        });

        test('Read tiny file', async () => {
            const file = await client.read(tinyUri);
            const text = await file.text();

            expect(text).toEqual(tinyFileText);
        });
    });

    describe('DAG Node', () => {
        let uri: DagNodeUri;
        const nodeData = 'Hello Dag node test';

        test('Store DAG node', async () => {
            const dagNode = new DagNode(nodeData, [], [new Tag('key', 'value')]);

            uri = await client.store(bucketId, dagNode);

            expect(uri).toEqual({
                bucketId: 0,
                entity: 'dag-node',
                cid: expect.any(String),
            });
        });

        test('Read DAG node', async () => {
            const dagNode = await client.read(uri);

            expect(dagNode.data.toString()).toEqual(nodeData);
            expect(dagNode.tags).toEqual([new Tag('key', 'value')]);
        });
    });
});