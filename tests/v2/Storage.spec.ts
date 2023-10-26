import {randomBytes} from 'crypto';
import {StorageNode, PieceContent} from '@cere-ddc-sdk/storage';

import {createDataStream, streamToU8a} from '../../tests/helpers';

const MB = 1024 * 1024;

describe('Storage', () => {
    const bucketId = 0;
    const storageNode = new StorageNode('localhost:9091');

    const storeRawPiece = async (chunks: PieceContent, mutipartOffset?: bigint) => {
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
            let smallPieceCid: Uint8Array;
            let largePieceCid: Uint8Array;
            const smallPieceSize = MB;
            const largePieceSize = 5 * MB;
            const smallPieceData = new Uint8Array(randomBytes(smallPieceSize));
            const largePieceData = createDataStream(largePieceSize, MB);

            test('Store small piece', async () => {
                smallPieceCid = await storeRawPiece([smallPieceData]);

                expect(smallPieceCid).toEqual(expect.any(Uint8Array));
                expect(smallPieceCid.length).toBeGreaterThan(0);
            });

            test('Read small piece', async () => {
                expect(smallPieceCid).toBeDefined();

                const contentStream = storageNode.fileApi.read({
                    cid: smallPieceCid,
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                });

                const content = await streamToU8a(contentStream);

                expect(content).toEqual(smallPieceData);
            });

            test('Store large (chunked) piece', async () => {
                largePieceCid = await storeRawPiece(largePieceData);

                expect(largePieceCid).toEqual(expect.any(Uint8Array));
                expect(largePieceCid.length).toBeGreaterThan(0);
            });

            test('Read large (chunked) piece', async () => {
                expect(largePieceCid).toBeDefined();

                const contentStream = storageNode.fileApi.read({
                    cid: largePieceCid,
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                });

                const content = await streamToU8a(contentStream);

                expect(content.byteLength).toEqual(largePieceSize);
            });
        });

        describe('Multipart piece', () => {
            let multipartPieceCid: Uint8Array;
            let rawPieceCids: Uint8Array[];
            const partSize = 5 * MB;
            const rawPieceContents = [
                createDataStream(partSize, MB),
                createDataStream(partSize, MB),
                createDataStream(partSize, MB),
            ];

            const totalSize = partSize * rawPieceContents.length;

            beforeAll(async () => {
                rawPieceCids = await Promise.all(
                    rawPieceContents.map((content, index) => storeRawPiece(content, BigInt(index * partSize))),
                );
            });

            test('Store multipart piece', async () => {
                multipartPieceCid = await storageNode.fileApi.storeMultipartPiece({
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                    partHashes: rawPieceCids,
                    partSize: BigInt(partSize),
                    totalSize: BigInt(totalSize),
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

                expect(content.byteLength).toEqual(totalSize);
            });
        });
    });
});
