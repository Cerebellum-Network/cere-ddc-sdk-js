import {Router} from '@cere-ddc-sdk/ddc';
import {FileStorage, File} from '@cere-ddc-sdk/file-storage';
import {createDataStream, MB, KB} from '../helpers';

describe('File storage', () => {
    const bucketId = 0;
    const router = new Router([
        {rpcHost: 'localhost:9091'},
        {rpcHost: 'localhost:9092'},
        {rpcHost: 'localhost:9093'},
        {rpcHost: 'localhost:9094'},
    ]);

    const fileStorage = new FileStorage({router});

    describe('Small file', () => {
        let fileCid: string;
        const fileSize = 2 * MB;
        const fileStream = createDataStream(fileSize, 64 * KB);

        test('Store a file', async () => {
            const file = new File(fileStream, {
                size: fileSize,
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
        const fileStream = createDataStream(fileSize, 12345); // Use not aligned chunk size `12345`

        test('Store a file', async () => {
            const file = new File(fileStream, {
                size: fileSize,
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
