import {StorageNode} from '@cere-ddc-sdk/ddc';
import {FileStorage, File} from '@cere-ddc-sdk/file-storage';
import {createDataStream, MB, KB} from '../../tests/helpers';

describe('Files', () => {
    const bucketId = 0n;
    const storageNode = new StorageNode({rpcHost: 'localhost:9091'});
    const fileStorage = new FileStorage(storageNode);

    describe('Small file', () => {
        const fileStream = createDataStream(2 * MB, KB);

        test('Store file', async () => {
            const file = new File(fileStream);

            await fileStorage.store(bucketId, file);
        });
    });
});
