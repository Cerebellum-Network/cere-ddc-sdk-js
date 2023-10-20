import {StorageNode} from '@cere-ddc-sdk/storage';

describe('New Storage', () => {
    const bucketId = 0;
    const storageNode = new StorageNode('localhost:9091');

    describe('Dag Api', () => {
        let nodeCid: string;
        const nodeData = new TextEncoder().encode('Hello');

        test('Create node', async () => {
            nodeCid = await storageNode.dagApi.store({
                bucketId,
                node: {
                    data: nodeData,
                    links: [],
                    tags: [],
                },
            });

            expect(nodeCid).toEqual(expect.any(String));
        });

        test('Read node', async () => {
            expect(nodeCid).toBeDefined();

            const node = await storageNode.dagApi.read({
                cid: nodeCid,
                bucketId,
                path: '',
            });

            const receivedData = node && new Uint8Array(node.data);
            expect(receivedData).toEqual(nodeData);
        });
    });

    describe('Cns Api', () => {
        const alias = 'test-cid-alias';
        const testCid = 'test-cid';

        test('Create alias', async () => {
            await storageNode.cnsApi.createAlias({
                bucketId,
                cid: testCid,
                name: alias,
            });
        });

        test('Get CID by alias', async () => {
            const cid = await storageNode.cnsApi.getCid({
                bucketId,
                name: alias,
            });

            expect(cid).toEqual(testCid);
        });
    });

    describe('File Api', () => {
        const chunkData = new TextEncoder().encode('Hello');
        const chunkCid = new Uint8Array([]); // TODO: Figure out how to calculate CID on client
        const fileCid = new Uint8Array([]); // TODO: Figure out how to get the file CID

        test('Store file chunk', async () => {
            await storageNode.fileApi.storeChunk(
                {
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                    cid: chunkCid,
                },
                {
                    data: chunkData,
                },
            );
        });

        test('Store file head', async () => {
            await storageNode.fileApi.storeHead({
                cid: fileCid,
                partHashes: [chunkCid],
                partSize: BigInt(chunkData.byteLength),
                totalSize: BigInt(chunkData.byteLength),
            });
        });

        test('Read file', async () => {
            await storageNode.fileApi.readFile({
                cid: fileCid,
            });
        });
    });
});
