import {StorageNode, Piece, PieceResponse, DagNode, MultipartPiece, CnsRecord, UriSigner} from '@cere-ddc-sdk/ddc';

import {createDataStream, MB, DDC_BLOCK_SIZE, ROOT_USER_SEED} from '../../tests/helpers';

describe('Storage Node', () => {
    const bucketId = 0;
    const storageNode = new StorageNode({
        rpcHost: 'localhost:9091',
        signer: new UriSigner(ROOT_USER_SEED),
    });

    describe('Raw piece', () => {
        let smallPieceCid: string;
        const smallPieceText = 'Hello small piece';
        const smallPieceJson = JSON.stringify(smallPieceText);
        const smallPieceData = new TextEncoder().encode(smallPieceJson);

        test('Store a piece', async () => {
            const piece = new Piece(smallPieceData);

            smallPieceCid = await storageNode.storePiece(bucketId, piece);

            expect(smallPieceCid).toBeTruthy();
        });

        describe('Read the piece', () => {
            let piece: PieceResponse;

            beforeEach(async () => {
                expect(smallPieceCid).toBeDefined();

                piece = await storageNode.readPiece(bucketId, smallPieceCid);
            });

            test('Read as Uint8Array', async () => {
                const contentBuffer = await piece.arrayBuffer();
                const content = new Uint8Array(contentBuffer);

                expect(content).toEqual(smallPieceData);
            });

            test('Read as string', async () => {
                const text = await piece.text();

                expect(text).toEqual(smallPieceJson);
            });

            test('Read as JSON', async () => {
                const text = await piece.json();

                expect(text).toEqual(smallPieceText);
            });
        });
    });

    describe('Multipart piece', () => {
        let multipartPieceCid: string;
        let rawPieceCids: string[];
        const partSize = 4 * MB;
        const rawPieceContents = [
            createDataStream(partSize, MB),
            createDataStream(partSize, MB),
            createDataStream(partSize, MB),
        ];

        const totalSize = partSize * rawPieceContents.length;

        beforeAll(async () => {
            rawPieceCids = await Promise.all(
                rawPieceContents.map((content, index) => {
                    const piece = new Piece(content, {
                        multipartOffset: index * partSize,
                    });

                    return storageNode.storePiece(bucketId, piece);
                }),
            );
        });

        test('Store a piece', async () => {
            const multipartPiece = new MultipartPiece(rawPieceCids, {
                partSize,
                totalSize,
            });

            multipartPieceCid = await storageNode.storePiece(bucketId, multipartPiece);

            expect(multipartPieceCid).toBeTruthy();
        });

        test('Read full piece as Uint8Array', async () => {
            expect(multipartPieceCid).toBeDefined();

            const piece = await storageNode.readPiece(bucketId, multipartPieceCid);
            const contentBuffer = await piece.arrayBuffer();
            const content = new Uint8Array(contentBuffer);

            expect(content.byteLength).toEqual(totalSize);
        });

        test('Read the piece range', async () => {
            expect(multipartPieceCid).toBeDefined();

            const rangeLength = DDC_BLOCK_SIZE;
            const piece = await storageNode.readPiece(bucketId, multipartPieceCid, {
                range: {
                    start: 0,
                    end: rangeLength - 1,
                },
            });

            const contentBuffer = await piece.arrayBuffer();

            expect(contentBuffer.byteLength).toEqual(rangeLength);
        });
    });

    describe('DAG node', () => {
        let nodeCid: string;
        const nodeData = new TextEncoder().encode('Hello test DAG node');

        test('Store a node', async () => {
            const node = new DagNode(nodeData);

            nodeCid = await storageNode.storeDagNode(bucketId, node);

            expect(nodeCid).toBeTruthy();
        });

        test('Read the node', async () => {
            expect(nodeCid).toBeDefined();

            const node = await storageNode.getDagNode(bucketId, nodeCid);

            expect(node?.data).toEqual(Buffer.from(nodeData));
        });
    });

    describe('CNS record', () => {
        let testCid: string;
        let signature: any;

        const testName = 'piece/name';

        beforeAll(async () => {
            testCid = await storageNode.storePiece(bucketId, new Piece(new TextEncoder().encode('Small piece')));
        });

        test('Store a record', async () => {
            const record = new CnsRecord(testCid, testName);

            await storageNode.storeCnsRecord(bucketId, record);

            signature = record.signature;

            expect(signature).toEqual({
                algorithm: 'sr25519',
                signer: expect.any(Uint8Array),
                value: expect.any(Uint8Array),
            });
        });

        test('Read the record', async () => {
            const record = await storageNode.getCnsRecord(bucketId, testName);

            expect(record?.signature).toEqual(signature);
            expect(record?.cid).toEqual(testCid);
        });

        test('Not found record', async () => {
            const record = await storageNode.getCnsRecord(bucketId, 'non-existing-record-name');

            expect(record).toEqual(undefined);
        });
    });
});
