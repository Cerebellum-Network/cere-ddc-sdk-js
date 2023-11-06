import * as path from 'path';
import * as fs from 'fs';
import {Readable} from 'stream';
import {pipeline} from 'stream/promises';
import {createHash} from 'crypto';
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

        test('Read a range of the file', async () => {
            const file = await fileStorage.read(bucketId, fileCid, {
                range: {
                    start: 0,
                    end: 64 * MB - 1,
                },
            });

            const buffer = await file.arrayBuffer();

            expect(buffer.byteLength).toEqual(64 * MB);
        });
    });

    describe('Real file', () => {
        let fileCid: string;

        const fileHash = '420e4db24f5874bc5e585b73e50cbf9f';
        const filePath = path.resolve(__dirname, '../fixtures/files/2.2mb.jpg');
        const fileStats = fs.statSync(filePath);
        const fileStream = fs.createReadStream(filePath);

        test('Store a file', async () => {
            const file = new File(fileStream, {
                size: fileStats.size,
            });

            fileCid = await fileStorage.store(bucketId, file);

            expect(fileCid).toEqual(expect.any(String));
        });

        test('Read the file', async () => {
            const file = await fileStorage.read(bucketId, fileCid);
            const hash = createHash('md5');

            await pipeline(Readable.fromWeb(file.body), hash);

            expect(hash.digest('hex')).toEqual(fileHash);
        });
    });
});
