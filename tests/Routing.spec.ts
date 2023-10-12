import {DdcClient, Piece, File} from '@cere-ddc-sdk/ddc-client';

const readFileData = async (file: File) => {
    const data = [];
    for await (const chunk of file.dataReader()) {
        data.push(...chunk);
    }

    return new Uint8Array(data);
};

describe('Routing', () => {
    const seed = '0x2cf8a6819aa7f2a2e7a62ce8cf0dca2aca48d87b2001652de779f43fecbc5a03';
    const clusterId = 0;
    const bucketId = 1n;
    const pieceData = new Uint8Array([1, 2, 3]);
    const fileData = new Uint8Array([1, 2, 3, 4, 5]);

    let client: DdcClient;

    beforeAll(async () => {
        client = await DdcClient.buildAndConnect(
            {
                clusterAddress: clusterId,
                fileOptions: {
                    parallel: 4,
                    pieceSizeInBytes: 1,
                },
            },
            seed,
        );
    });

    afterAll(async () => {
        await client.disconnect();
    });

    describe('Pieces', () => {
        test.only('Store and read single unencrypted piece', async () => {
            const piece = new Piece(pieceData);
            const uri = await client.store(bucketId, piece, {encrypt: false});
            const result = await client.read(uri, {decrypt: false});

            expect(result.data).toEqual(pieceData);
        });

        test('Store and read single encrypted piece', async () => {
            const piece = new Piece(pieceData);
            const dekPath = 'test/piece';
            const uri = await client.store(bucketId, piece, {encrypt: true, dekPath});
            const result = await client.read(uri, {decrypt: true, dekPath});

            expect(result.data).toEqual(pieceData);
        });
    });

    describe('Files', () => {
        test('Store and read unencrypted file', async () => {
            const file = new File(fileData);
            const uri = await client.store(bucketId, file, {encrypt: false});
            const result = await client.read(uri, {decrypt: false});
            const data = await readFileData(result as File);

            expect(data).toEqual(fileData);
        });

        test('Store and read encrypted file', async () => {
            const dekPath = 'test/piece';
            const file = new File(fileData);
            const uri = await client.store(bucketId, file, {encrypt: true, dekPath});
            const result = await client.read(uri, {decrypt: true, dekPath});
            const data = await readFileData(result as File);

            expect(data).toEqual(fileData);
        });
    });
});
