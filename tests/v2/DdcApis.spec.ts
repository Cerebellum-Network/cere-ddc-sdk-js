import {randomBytes} from 'crypto';
import {PieceContent, RpcTransport, DagApi, FileApi, CnsApi} from '@cere-ddc-sdk/ddc';

import {createDataStream, streamToU8a} from '../../tests/helpers';

const MB = 1024 * 1024;
const DDC_BLOCK_SIZE = 16 * 1024;

describe('DDC APIs', () => {
    const bucketId = 0;
    const transport = new RpcTransport('localhost:9091');
    const dagApi = new DagApi(transport);
    const fileApi = new FileApi(transport);
    const cnsApi = new CnsApi(transport);

    const storeRawPiece = async (chunks: PieceContent, mutipartOffset?: bigint) => {
        return fileApi.storeRawPiece(
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
            nodeCid = await dagApi.storeNode({
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

            const node = await dagApi.getNode({
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
            await cnsApi.assignName({
                bucketId,
                cid: testCid,
                name: alias,
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

                const contentStream = fileApi.readPiece({
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

                const contentStream = fileApi.readPiece({
                    cid: largePieceCid,
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                });

                const content = await streamToU8a(contentStream);

                expect(content.byteLength).toEqual(largePieceSize);
            });

            test('Read a range of large (chunked) piece', async () => {
                expect(largePieceCid).toBeDefined();

                const rangeSize = BigInt(10 * DDC_BLOCK_SIZE);
                const contentStream = fileApi.readPiece({
                    cid: largePieceCid,
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                    range: {
                        start: 0n,
                        end: rangeSize,
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
                    rawPieceContents.map((content, index) => storeRawPiece(content, BigInt(index * partSize))),
                );
            });

            test('Store multipart piece', async () => {
                console.log('Store multipart params', {
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                    partHashes: rawPieceCids,
                    partSize: BigInt(partSize),
                    totalSize: BigInt(totalSize),
                });

                multipartPieceCid = await fileApi.storeMultipartPiece({
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

                const contentStream = fileApi.readPiece({
                    cid: multipartPieceCid,
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type
                });

                const content = await streamToU8a(contentStream);

                expect(content.byteLength).toEqual(totalSize);
            });

            test('Read a range of multipart piece', async () => {
                expect(multipartPieceCid).toBeDefined();

                const rangeSize = BigInt(10 * DDC_BLOCK_SIZE);
                const contentStream = fileApi.readPiece({
                    cid: multipartPieceCid,
                    bucketId: bucketId.toString(), // TODO: Inconsistent bucketId type,
                    range: {
                        start: 0n,
                        end: rangeSize,
                    },
                });

                const content = await streamToU8a(contentStream);

                expect(content.byteLength).toEqual(rangeSize);
            });
        });
    });
});
