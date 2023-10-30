import {StorageNode, Piece, PieceResponse, DagNode, MultipartPiece} from '@cere-ddc-sdk/ddc';

import {createDataStream, MB, DDC_BLOCK_SIZE} from '../../tests/helpers';

describe('Storage Node', () => {
    const bucketId = 0n;
    const storageNode = new StorageNode('localhost:9091');

    describe('Raw piece', () => {
        let smallPieceCid: Uint8Array;
        const smallPieceText = 'Hello small piece';
        const smallPieceJson = JSON.stringify(smallPieceText);
        const smallPieceData = new TextEncoder().encode(smallPieceJson);

        test('Store a piece', async () => {
            const piece = new Piece(bucketId, smallPieceData);

            smallPieceCid = await storageNode.storePiece(piece);

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
                rawPieceContents.map((content, index) => {
                    const piece = new Piece(bucketId, content, {
                        multipartOffset: BigInt(index * partSize),
                    });

                    return storageNode.storePiece(piece);
                }),
            );
        });

        test('Store a piece', async () => {
            const multipartPiece = new MultipartPiece(bucketId, rawPieceCids, {
                partSize: BigInt(partSize),
                totalSize: BigInt(totalSize),
            });

            multipartPieceCid = await storageNode.storePiece(multipartPiece);

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
                    start: 0n,
                    end: BigInt(rangeLength) - 1n,
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
            const node = new DagNode(bucketId, nodeData);

            nodeCid = await storageNode.storeDagNode(node);

            expect(nodeCid).toBeTruthy();
        });

        test('Read the node', async () => {
            expect(nodeCid).toBeDefined();

            const node = await storageNode.getDagNode(bucketId, nodeCid);

            expect(node?.data).toEqual(nodeData);
        });
    });
});
