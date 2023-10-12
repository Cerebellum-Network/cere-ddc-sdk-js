import {StorageNode} from '@cere-ddc-sdk/storage';

describe('New Storage', () => {
    const storageNode = new StorageNode('localhost:9091');

    test('Store data', async () => {
        const cid = await storageNode.store({
            bucketId: 0,
            node: {
                data: new TextEncoder().encode('Hello'),
                links: [],
                tags: [],
            },
        });

        console.log('CID', cid);
        expect(cid).toBe(String);
    });
});
