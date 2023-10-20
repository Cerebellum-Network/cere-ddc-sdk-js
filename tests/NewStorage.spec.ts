import {StorageNode} from '@cere-ddc-sdk/storage';

describe('New Storage', () => {
    const bucketId = 0;
    const storageNode = new StorageNode('localhost:9091');

    test('Store and read node', async () => {
        const sentData = new TextEncoder().encode('Hello');
        const cid = await storageNode.store({
            bucketId,
            node: {
                data: sentData,
                links: [],
                tags: [],
            },
        });

        const node = await storageNode.read({
            cid,
            bucketId,
            path: '',
        });

        const receivedData = node && new Uint8Array(node.data);

        expect(cid).toEqual(expect.any(String));
        expect(receivedData).toEqual(sentData);
    });
});
