import {StorageNode, Piece, PieceResponse, File, FileResponse, DagNode, DagNodeResponse} from '@cere-ddc-sdk/ddc';

describe('Storage Node', () => {
    const bucketId = 0n;
    const storageNode = new StorageNode('localhost:9091');

    describe('Files', () => {
        let smallFileCid: Uint8Array;
        const smallFileText = 'Hello small file';
        const smallFileJson = JSON.stringify(smallFileText);
        const smallFileData = new TextEncoder().encode(smallFileJson);

        test('Store a small file', async () => {
            const file = new File(bucketId, smallFileData);

            smallFileCid = await storageNode.store(file);

            expect(smallFileCid).toBeTruthy();
        });

        describe('Read a small file', () => {
            let file: FileResponse;

            beforeEach(async () => {
                expect(smallFileCid).toBeDefined();

                file = await storageNode.getPiece(bucketId, smallFileCid);
            });

            test('Read as Uint8Array', async () => {
                const contentBuffer = await file.arrayBuffer();
                const content = new Uint8Array(contentBuffer);

                expect(content).toEqual(smallFileData);
            });

            test('Read as string', async () => {
                const text = await file.text();

                expect(text).toEqual(smallFileJson);
            });

            test('Read as JSON', async () => {
                const text = await file.json();

                expect(text).toEqual(smallFileText);
            });
        });
    });

    describe('Pieces', () => {
        let smallPieceCid: Uint8Array;
        const smallPieceText = 'Hello small piece';
        const smallPieceJson = JSON.stringify(smallPieceText);
        const smallPieceData = new TextEncoder().encode(smallPieceJson);

        test('Store a small piece', async () => {
            const piece = new Piece(bucketId, smallPieceData);

            smallPieceCid = await storageNode.store(piece);

            expect(smallPieceCid).toBeTruthy();
        });

        describe('Read a small piece', () => {
            let piece: PieceResponse;

            beforeEach(async () => {
                expect(smallPieceCid).toBeDefined();

                piece = await storageNode.getPiece(bucketId, smallPieceCid);
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

    describe('DAG nodes', () => {
        let nodeCid: string;
        const nodeData = new TextEncoder().encode('Hello test DAG node');

        test('Store a DAG node', async () => {
            const node = new DagNode(bucketId, nodeData);

            nodeCid = await storageNode.store(node);

            expect(nodeCid).toBeTruthy();
        });

        test('Read a DAG node', async () => {
            expect(nodeCid).toBeDefined();

            const node = await storageNode.getDagNode(bucketId, nodeCid);

            expect(node?.data).toEqual(nodeData);
        });
    });
});
