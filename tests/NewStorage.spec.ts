import {u8aToHex} from '@polkadot/util';
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

        let chunkCid: Uint8Array;
        let fileCid: Uint8Array;

        test('Store file chunk', async () => {
            const response = await storageNode.fileApi.storeChunk(
                {
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                    isMultipart: false,
                },
                {
                    data: chunkData,
                },
            );

            chunkCid = response.cid;

            console.log('Chunk CID', u8aToHex(chunkCid));
            expect(chunkCid).toEqual(expect.any(Uint8Array));
        });

        test('Store file head', async () => {
            expect(chunkCid).toBeDefined();

            const response = await storageNode.fileApi.storeHead({
                partHashes: [chunkCid],
                partSize: BigInt(chunkData.byteLength),
                totalSize: BigInt(chunkData.byteLength),
                bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
            });

            fileCid = response.cid;

            console.log('File CID', u8aToHex(fileCid));
            expect(chunkCid).toEqual(expect.any(Uint8Array));
        });

        test('Read file', async () => {
            expect(chunkCid).toBeDefined();

            await storageNode.fileApi.readFile({
                cid: chunkCid,
                bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
            });
        });
    });
});
