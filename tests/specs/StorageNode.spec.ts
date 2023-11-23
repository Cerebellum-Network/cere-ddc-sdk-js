import {
  StorageNode,
  Piece,
  PieceResponse,
  DagNode,
  MultipartPiece,
  CnsRecord,
  UriSigner,
  Link,
} from '@cere-ddc-sdk/ddc';

import { createDataStream, MB, DDC_BLOCK_SIZE, ROOT_USER_SEED, getStorageNodes } from '../helpers';

describe('Storage Node', () => {
  const bucketId = 1n;
  const [storageNodeParams] = getStorageNodes();
  const signer = new UriSigner(ROOT_USER_SEED);
  const storageNode = new StorageNode(signer, storageNodeParams);

  describe('Raw piece', () => {
    let smallPieceCid: string;
    const smallPieceName = 'small-test-piece';
    const smallPieceText = 'Hello small piece';
    const smallPieceJson = JSON.stringify(smallPieceText);
    const smallPieceData = new TextEncoder().encode(smallPieceJson);

    test('Store a piece', async () => {
      const piece = new Piece(smallPieceData);

      smallPieceCid = await storageNode.storePiece(bucketId, piece, {
        name: smallPieceName,
      });

      expect(smallPieceCid).toBeTruthy();
    });

    test('Read the piece by name', async () => {
      expect(smallPieceCid).toBeDefined();

      const piece = await storageNode.readPiece(bucketId, smallPieceName);
      const text = await piece.json();

      expect(text).toEqual(smallPieceText);
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
    const pieceName = 'multipart-test-piece';
    const partSize = 4 * MB;
    const rawPieceContents = [
      createDataStream(partSize, { chunkSize: MB }),
      createDataStream(partSize, { chunkSize: MB }),
      createDataStream(partSize, { chunkSize: MB }),
    ];

    const totalSize = partSize * rawPieceContents.length;

    beforeAll(async () => {
      rawPieceCids = await Promise.all(
        rawPieceContents.map((content, index) => {
          const piece = new Piece(content, {
            size: partSize,
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

      multipartPieceCid = await storageNode.storePiece(bucketId, multipartPiece, {
        name: pieceName,
      });

      expect(multipartPieceCid).toBeTruthy();
    });

    test('Read full piece as Uint8Array', async () => {
      expect(multipartPieceCid).toBeDefined();

      const piece = await storageNode.readPiece(bucketId, multipartPieceCid);
      const contentBuffer = await piece.arrayBuffer();

      expect(contentBuffer.byteLength).toEqual(totalSize);
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

    test('Read the piece by name', async () => {
      expect(multipartPieceCid).toBeDefined();

      const piece = await storageNode.readPiece(bucketId, pieceName);
      const contentBuffer = await piece.arrayBuffer();

      expect(contentBuffer.byteLength).toEqual(totalSize);
    });
  });

  describe('DAG node', () => {
    let nodeCid: string;
    const nodeName = 'dag-node-name';
    const nodeData = new TextEncoder().encode('Hello test DAG node');

    test('Store a node', async () => {
      const node = new DagNode(nodeData);

      nodeCid = await storageNode.storeDagNode(bucketId, node, {
        name: nodeName,
      });

      expect(nodeCid).toBeTruthy();
    });

    test('Read the node', async () => {
      expect(nodeCid).toBeDefined();

      const node = await storageNode.getDagNode(bucketId, nodeCid);

      expect(node?.data).toEqual(Buffer.from(nodeData));
    });

    test('Read the node by name', async () => {
      expect(nodeCid).toBeDefined();

      const node = await storageNode.getDagNode(bucketId, nodeName);

      expect(node?.data).toEqual(Buffer.from(nodeData));
    });

    describe('Nested nodes', () => {
      const rootCnsName = 'root';
      const leafNode = new DagNode('Leaf');

      test('Store root node', async () => {
        const leafNodeCid = await storageNode.storeDagNode(bucketId, leafNode);
        const branchNode = new DagNode('Branch', [new Link(leafNodeCid, leafNode.size, 'leaf')]);
        const branchNodeCid = await storageNode.storeDagNode(bucketId, branchNode);

        const rootCid = await storageNode.storeDagNode(
          bucketId,
          new DagNode('Root', [new Link(branchNodeCid, branchNode.size, 'branch')]),
          { name: rootCnsName },
        );

        expect(rootCid).toEqual(expect.any(String));
      });

      test('Read leaf node', async () => {
        const foundNode = await storageNode.getDagNode(bucketId, rootCnsName, {
          path: 'branch/leaf',
        });

        expect(foundNode?.data).toEqual(leafNode.data);
      });
    });
  });

  describe('CNS record', () => {
    let signature: any;

    const testCid = 'baebb4ifbvlaklsqk4ex2n2xfaghhrkd3bbqg53d2du4sdgsz7uixt25ycu';
    const testName = 'piece/name';

    test('Store a record', async () => {
      const record = new CnsRecord(testCid, testName);
      const storedRecord = await storageNode.storeCnsRecord(bucketId, record);

      signature = storedRecord.signature;

      expect(signature).toEqual({
        algorithm: signer.type,
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
