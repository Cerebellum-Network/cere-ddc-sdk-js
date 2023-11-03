import {randomBytes} from 'crypto';
import {Content, RpcTransport, DagApi, FileApi, CnsApi} from '@cere-ddc-sdk/ddc';

import {createDataStream, streamToU8a, MB, DDC_BLOCK_SIZE} from '../../tests/helpers';

describe('DDC APIs', () => {
    const bucketId = 0;
    const transport = new RpcTransport('localhost:9091');
    const dagApi = new DagApi(transport);
    const fileApi = new FileApi(transport);
    const cnsApi = new CnsApi(transport);

    const storeRawPiece = async (chunks: Content, mutipartOffset?: number) => {
        return fileApi.putRawPiece(
            {
                bucketId,
                isMultipart: mutipartOffset !== undefined,
                offset: mutipartOffset,
            },
            chunks,
        );
    };

    describe('Dag Api', () => {
        let nodeCid: Uint8Array;
        const nodeData = randomBytes(10);

        test('Create node', async () => {
            nodeCid = await dagApi.putNode({
                bucketId,
                node: {
                    data: nodeData,
                    links: [],
                    tags: [],
                },
            });

            expect(nodeCid).toEqual(expect.any(Uint8Array));
        });

        test('Read node', async () => {
            expect(nodeCid).toBeDefined();

            const node = await dagApi.getNode({
                cid: nodeCid,
                bucketId,
            });

            expect(node?.data).toEqual(nodeData);
        });
    });

    describe.skip('Cns Api', () => {
        const alias = 'test-cid-alias';
        const testCid = new Uint8Array(randomBytes(32));

        test('Create alias', async () => {
            await cnsApi.assignName({
                bucketId,
                record: {
                    cid: testCid,
                    name: alias,
                },
            });
        });

        test('Get CID by alias', async () => {
            const cid = await cnsApi.getCid({
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
            const largePieceSize = 4 * MB;
            const smallPieceData = new Uint8Array(randomBytes(smallPieceSize));
            const largePieceData = createDataStream(largePieceSize, MB);

            test('Store small piece', async () => {
                smallPieceCid = await storeRawPiece([smallPieceData]);

                expect(smallPieceCid).toEqual(expect.any(Uint8Array));
                expect(smallPieceCid.length).toBeGreaterThan(0);
            });

            test('Read small piece', async () => {
                expect(smallPieceCid).toBeDefined();

                const contentStream = fileApi.getFile({
                    bucketId,
                    cid: smallPieceCid,
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

                const contentStream = fileApi.getFile({
                    bucketId,
                    cid: largePieceCid,
                });

                const content = await streamToU8a(contentStream);

                expect(content.byteLength).toEqual(largePieceSize);
            });

            test('Read a range of large (chunked) piece', async () => {
                expect(largePieceCid).toBeDefined();

                const rangeSize = 10 * DDC_BLOCK_SIZE;
                const contentStream = fileApi.getFile({
                    bucketId,
                    cid: largePieceCid,
                    range: {
                        start: 0,
                        end: rangeSize - 1,
                    },
                });

                const content = await streamToU8a(contentStream);

                expect(content.byteLength).toEqual(rangeSize);
            });
        });

        describe('Multipart piece', () => {
            let multipartPieceCid: Uint8Array;
            let rawPieceCids: Uint8Array[];
            const partSize = 4 * MB;
            const rawPieceContents = [
                createDataStream(partSize, MB),
                createDataStream(partSize, MB),
                createDataStream(partSize, MB),
            ];

            const totalSize = partSize * rawPieceContents.length;

            beforeAll(async () => {
                rawPieceCids = await Promise.all(
                    rawPieceContents.map((content, index) => storeRawPiece(content, index * partSize)),
                );
            });

            test('Store multipart piece', async () => {
                /**
                 * Get content hashes from  raw pieces
                 */
                const partHashes = rawPieceCids.map((cid) => cid.slice(-32));

                multipartPieceCid = await fileApi.putMultipartPiece({
                    bucketId,
                    partHashes,
                    partSize,
                    totalSize,
                });

                expect(multipartPieceCid).toEqual(expect.any(Uint8Array));
                expect(multipartPieceCid.length).toBeGreaterThan(0);
            });

            test('Read full multipart piece', async () => {
                expect(multipartPieceCid).toBeDefined();

                const contentStream = fileApi.getFile({
                    bucketId,
                    cid: multipartPieceCid,
                });

                const content = await streamToU8a(contentStream);

                expect(content.byteLength).toEqual(totalSize);
            });

            test('Read a range of multipart piece', async () => {
                expect(multipartPieceCid).toBeDefined();

                const rangeSize = 10 * DDC_BLOCK_SIZE;
                const contentStream = fileApi.getFile({
                    bucketId,
                    cid: multipartPieceCid,
                    range: {
                        start: 0,
                        end: rangeSize - 1,
                    },
                });

                const content = await streamToU8a(contentStream);

                expect(content.byteLength).toEqual(rangeSize);
            });
        });
    });
});
