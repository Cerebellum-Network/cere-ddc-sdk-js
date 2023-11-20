import {randomBytes} from 'crypto';
import {
    Content,
    WebsocketTransport,
    GrpcTransport,
    DagApi,
    FileApi,
    CnsApi,
    Signer,
    UriSigner,
    Cid,
    MAX_PIECE_SIZE,
} from '@cere-ddc-sdk/ddc';

import {createDataStream, streamToU8a, MB, DDC_BLOCK_SIZE, ROOT_USER_SEED, getStorageNodes} from '../helpers';

const [transportOptions] = getStorageNodes();
const transports = [
    {
        name: 'Grpc Transport',
        transport: new GrpcTransport(transportOptions),
    },
    {
        name: 'WebSocket Transport',
        transport: new WebsocketTransport(transportOptions),
    },
];

describe.each(transports)('DDC APIs ($name)', ({transport}) => {
    let signer: Signer;

    const bucketId = 1;
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

    beforeAll(async () => {
        signer = await UriSigner.create(ROOT_USER_SEED);
    });

    describe('Dag Api', () => {
        let nodeCid: Uint8Array;
        const nodeData = new Uint8Array(randomBytes(10));

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

        describe('Nested nodes', () => {
            let rootNodeCid: Uint8Array;
            const lastNode = {
                data: nodeData,
                links: [],
                tags: [],
            };

            test('Create node tree', async () => {
                const lastCid = await dagApi.putNode({bucketId, node: lastNode});
                const middleCid = await dagApi.putNode({
                    bucketId,
                    node: {
                        data: new Uint8Array([]),
                        links: [{cid: lastCid, size: nodeData.byteLength, name: 'last'}],
                        tags: [],
                    },
                });

                rootNodeCid = await dagApi.putNode({
                    bucketId,
                    node: {
                        data: nodeData,
                        links: [{cid: middleCid, size: 10, name: 'middle'}],
                        tags: [],
                    },
                });
            });

            test('Get last child', async () => {
                const foundNode = await dagApi.getNode({
                    bucketId,
                    cid: rootNodeCid,
                    path: 'middle/last',
                });

                expect(foundNode).toEqual(lastNode);
            });
        });
    });

    describe('Cns Api', () => {
        let signature: any;

        const testCid = new Cid('AEBB4IEIDC5HNY76TBBV5CK5WQT7FXCGNJATYVLW5WRMJ7IMNOQECYYCDQ').toBytes();
        const alias = 'dir/file-name';

        test('Create alias', async () => {
            const sigMessage = CnsApi.createSignatureMessage({
                cid: testCid,
                name: alias,
            });

            signature = {
                signer: signer.publicKey,
                algorithm: signer.type as any,
                value: signer.sign(sigMessage),
            };

            await cnsApi.putRecord({
                bucketId,
                record: {
                    cid: testCid,
                    name: alias,
                    signature,
                },
            });
        });

        test('Get CID by alias', async () => {
            const record = await cnsApi.getRecord({
                bucketId,
                name: alias,
            });

            expect(record?.signature).toEqual(signature);
            expect(record?.cid).toEqual(testCid);
        });
    });

    describe('File Api', () => {
        describe('Raw piece', () => {
            let smallPieceCid: Uint8Array;
            let largePieceCid: Uint8Array;
            const smallPieceSize = MB;
            const largePieceSize = MAX_PIECE_SIZE;
            const smallPieceData = new Uint8Array(randomBytes(smallPieceSize));
            const largePieceData = createDataStream(largePieceSize, {
                chunkSize: 12345, // Intentionaly use not aligned to power of 2 chunk size
            });

            test('Store small piece', async () => {
                smallPieceCid = await storeRawPiece([smallPieceData]);

                expect(smallPieceCid).toEqual(expect.any(Uint8Array));
                expect(smallPieceCid.length).toBeGreaterThan(0);
            });

            test('Read small piece', async () => {
                expect(smallPieceCid).toBeDefined();

                const contentStream = await fileApi.getFile({
                    bucketId,
                    cid: smallPieceCid,
                });

                const content = await streamToU8a(contentStream);

                expect(content).toEqual(smallPieceData);
            });

            test('Store large piece', async () => {
                largePieceCid = await storeRawPiece(largePieceData);

                expect(largePieceCid).toEqual(expect.any(Uint8Array));
                expect(largePieceCid.length).toBeGreaterThan(0);
            });

            test('Read large piece', async () => {
                expect(largePieceCid).toBeDefined();

                const contentStream = await fileApi.getFile({
                    bucketId,
                    cid: largePieceCid,
                });

                const content = await streamToU8a(contentStream);

                expect(content.byteLength).toEqual(largePieceSize);
            });

            test('Read a range of large piece', async () => {
                expect(largePieceCid).toBeDefined();

                const rangeSize = 10 * DDC_BLOCK_SIZE;
                const contentStream = await fileApi.getFile({
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
                createDataStream(partSize, {chunkSize: MB}),
                createDataStream(partSize, {chunkSize: MB}),
                createDataStream(partSize, {chunkSize: MB}),
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

                const contentStream = await fileApi.getFile({
                    bucketId,
                    cid: multipartPieceCid,
                });

                const content = await streamToU8a(contentStream);

                expect(content.byteLength).toEqual(totalSize);
            });

            test('Read a range of multipart piece', async () => {
                expect(multipartPieceCid).toBeDefined();

                const rangeSize = 10 * DDC_BLOCK_SIZE;
                const contentStream = await fileApi.getFile({
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
