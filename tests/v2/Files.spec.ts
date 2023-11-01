import {StorageNode} from '@cere-ddc-sdk/ddc';
import {FileStorage, File} from '@cere-ddc-sdk/file-storage';
import {createDataStream, MB, KB} from '../../tests/helpers';

describe('Files', () => {
    const bucketId = 0n;
    const storageNode = new StorageNode({rpcHost: 'localhost:9091'});
    const fileStorage = new FileStorage({storageNode});

    describe('Small file', () => {
        let fileCid: string;
        const fileSize = 2 * MB;
        const fileStream = createDataStream(fileSize, 64 * KB);

        test('Store a file', async () => {
            const file = new File(fileStream, {
                size: BigInt(fileSize),
            });

            fileCid = await fileStorage.store(bucketId, file);

            expect(fileCid).toEqual(expect.any(String));
        });

        test('Read the file', async () => {
            const file = await fileStorage.read(bucketId, fileCid);
            const buffer = await file.arrayBuffer();

            expect(buffer.byteLength).toEqual(fileSize);
        });
    });

    describe('Large file', () => {
        let fileCid: string;
        const fileSize = 150 * MB;
        const fileStream = createDataStream(fileSize, 64 * KB);

        test('Store a file', async () => {
            const file = new File(fileStream, {
                size: BigInt(fileSize),
            });

            fileCid = await fileStorage.store(bucketId, file);

            expect(fileCid).toEqual(expect.any(String));
        });

        test('Read the file', async () => {
            const file = await fileStorage.read(bucketId, fileCid);
            const buffer = await file.arrayBuffer();

            expect(buffer.byteLength).toEqual(fileSize);
        });
    });
});
