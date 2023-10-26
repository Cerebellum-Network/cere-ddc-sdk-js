import {randomBytes} from 'crypto';
import {u8aConcat} from '@polkadot/util';
import {ReadableStream} from 'stream/web';
import {StorageNode} from '@cere-ddc-sdk/storage';

const streamToU8a = async (stream: ReadableStream<Uint8Array>) => {
    let content = new Uint8Array([]);
    for await (const chunk of stream) {
        content = u8aConcat(content, chunk);
    }

    return content;
};

describe('Storage', () => {
    const bucketId = 0;
    const storageNode = new StorageNode('localhost:9091');

    const storeRawPiece = async (chunks: Uint8Array[], mutipartOffset?: bigint) => {
        return storageNode.fileApi.storeRawPiece(
            {
                bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                isMultipart: mutipartOffset !== undefined,
                offset: mutipartOffset,
            },
            chunks,
        );
    };

    describe('Dag Api', () => {
        let nodeCid: string;
        const nodeData = randomBytes(10);

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

            expect(node?.data).toEqual(nodeData);
        });
    });

    describe.skip('Cns Api', () => {
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
        describe('Raw piece', () => {
            const chunkData = new Uint8Array(randomBytes(1024));
            let rawPieceCid: Uint8Array;

            test('Store raw piece', async () => {
                rawPieceCid = await storeRawPiece([chunkData]);

                expect(rawPieceCid).toEqual(expect.any(Uint8Array));
                expect(rawPieceCid.length).toBeGreaterThan(0);
            });

            test('Read full raw piece', async () => {
                expect(rawPieceCid).toBeDefined();

                const contentStream = storageNode.fileApi.read({
                    cid: rawPieceCid,
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                });

                const content = await streamToU8a(contentStream);

                expect(content).toEqual(chunkData);
            });
        });

        describe('Multipart piece', () => {
            let multipartPieceCid: Uint8Array;
            let rawPieceCids: Uint8Array[];
            const partSize = 64 * 1024 * 1024; // 64 MB
            const rawPieceContents = [
                [new Uint8Array(randomBytes(partSize))],
                [new Uint8Array(randomBytes(partSize))],
                [new Uint8Array(randomBytes(partSize))],
            ];

            const fullContent = rawPieceContents
                .flat()
                .reduce((full, chunk) => u8aConcat(full, chunk), new Uint8Array([]));

            beforeAll(async () => {
                rawPieceCids = await Promise.all(
                    rawPieceContents.map((chunks, index) => storeRawPiece(chunks, BigInt(index * partSize))),
                );
            });

            test('Store multipart piece', async () => {
                multipartPieceCid = await storageNode.fileApi.storeMultipartPiece({
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                    partHashes: rawPieceCids,
                    partSize: BigInt(partSize),
                    totalSize: BigInt(partSize * rawPieceContents.length),
                });

                expect(multipartPieceCid).toEqual(expect.any(Uint8Array));
                expect(multipartPieceCid.length).toBeGreaterThan(0);
            });

            test('Read full multipart piece', async () => {
                expect(multipartPieceCid).toBeDefined();

                const contentStream = storageNode.fileApi.read({
                    cid: multipartPieceCid,
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                });

                const content = await streamToU8a(contentStream);

                expect(content).toEqual(fullContent);
            });
        });
    });
});
