import { randomBytes } from 'crypto';
import {
  Content,
  WebsocketTransport,
  GrpcTransport,
  DagApi,
  FileApi,
  CnsApi,
  UriSigner,
  Cid,
  MAX_PIECE_SIZE,
  PieceMeta,
  AuthToken,
  AuthTokenOperation,
} from '@cere-ddc-sdk/ddc';

import { createDataStream, streamToU8a, MB, DDC_BLOCK_SIZE, ROOT_USER_SEED, getStorageNodes } from '../helpers';

const [transportOptions] = getStorageNodes();
const transportsVariants = [
  {
    name: 'Grpc Transport',
    transport: new GrpcTransport(transportOptions),
  },
  {
    name: 'WebSocket Transport',
    transport: new WebsocketTransport(transportOptions),
  },
];

const apiVariants = [
  { name: 'with proofs', authenticate: false },
  { name: 'without proofs', authenticate: true },
];

describe.each(transportsVariants)('DDC APIs ($name)', ({ transport }) => {
  const bucketId = 1n;
  const testRunRandom = Math.round(Math.random() * 10 ** 5);
  const signer = new UriSigner(ROOT_USER_SEED);
  const operations = [AuthTokenOperation.PUT, AuthTokenOperation.GET];
  const token = new AuthToken({ bucketId, operations });

  beforeAll(async () => {
    await token.sign(signer);
  });

  describe.each(apiVariants)('DAG Api ($name)', ({ authenticate }) => {
    const dagApi = new DagApi(transport, { authenticate });
    const nodeData = new Uint8Array(randomBytes(10));

    let nodeCid: Uint8Array;

    test('Create node', async () => {
      nodeCid = await dagApi.putNode({
        token,
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
        token,
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
        const lastCid = await dagApi.putNode({ bucketId, token, node: lastNode });
        const middleCid = await dagApi.putNode({
          bucketId,
          token,
          node: {
            data: new Uint8Array([]),
            links: [{ cid: lastCid, size: nodeData.byteLength, name: 'last' }],
            tags: [],
          },
        });

        rootNodeCid = await dagApi.putNode({
          bucketId,
          token,
          node: {
            data: nodeData,
            links: [{ cid: middleCid, size: 10, name: 'middle' }],
            tags: [],
          },
        });
      });

      test('Get last child', async () => {
        expect(rootNodeCid).toBeDefined();

        const foundNode = await dagApi.getNode({
          bucketId,
          token,
          cid: rootNodeCid,
          path: 'middle/last',
        });

        expect(foundNode).toEqual(lastNode);
      });
    });
  });

  describe('Cns Api', () => {
    const cnsApi = new CnsApi(transport, { signer });
    const testCid = new Cid('baebb4ifbvlaklsqk4ex2n2xfaghhrkd3bbqg53d2du4sdgsz7uixt25ycu').toBytes();
    const alias = `dir/file-name-${testRunRandom}`;

    let signature: any;

    test('Create alias', async () => {
      const savedRecord = await cnsApi.putRecord({
        bucketId,
        token,
        record: {
          cid: testCid,
          name: alias,
        },
      });

      signature = savedRecord.signature;
    });

    test('Get CID by alias', async () => {
      const record = await cnsApi.getRecord({
        bucketId,
        token,
        name: alias,
      });

      expect(record?.signature).toEqual(signature);
      expect(record?.cid).toEqual(testCid);
    });
  });

  describe.each(apiVariants)('File Api ($name)', ({ authenticate }) => {
    const fileApi = new FileApi(transport, { signer, authenticate });

    const storeRawPiece = async (content: Content, meta?: PieceMeta) =>
      fileApi.putRawPiece(
        {
          bucketId,
          token,
          isMultipart: meta?.multipartOffset !== undefined,
          offset: meta?.multipartOffset,
          size: meta?.size,
        },
        content,
      );

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
        smallPieceCid = await storeRawPiece(smallPieceData);

        expect(smallPieceCid).toEqual(expect.any(Uint8Array));
        expect(smallPieceCid.length).toBeGreaterThan(0);
      });

      test('Read small piece', async () => {
        expect(smallPieceCid).toBeDefined();

        const contentStream = await fileApi.getFile({
          bucketId,
          token,
          cid: smallPieceCid,
        });

        const content = await streamToU8a(contentStream);

        expect(content).toEqual(smallPieceData);
      });

      test('Store large piece', async () => {
        largePieceCid = await storeRawPiece(largePieceData, {
          size: largePieceSize,
        });

        expect(largePieceCid).toEqual(expect.any(Uint8Array));
        expect(largePieceCid.length).toBeGreaterThan(0);
      });

      test('Read large piece', async () => {
        expect(largePieceCid).toBeDefined();

        const contentStream = await fileApi.getFile({
          bucketId,
          token,
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
          token,
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
        createDataStream(partSize, { chunkSize: MB }),
        createDataStream(partSize, { chunkSize: MB }),
        createDataStream(partSize, { chunkSize: MB }),
      ];

      const totalSize = partSize * rawPieceContents.length;

      beforeAll(async () => {
        rawPieceCids = await Promise.all(
          rawPieceContents.map((content, index) =>
            storeRawPiece(content, {
              size: partSize,
              multipartOffset: index * partSize,
            }),
          ),
        );
      });

      test('Store multipart piece', async () => {
        /**
         * Get content hashes from  raw pieces
         */
        const partHashes = rawPieceCids.map((cid) => cid.slice(-32));

        multipartPieceCid = await fileApi.putMultipartPiece({
          bucketId,
          token,
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
          token,
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
          token,
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
