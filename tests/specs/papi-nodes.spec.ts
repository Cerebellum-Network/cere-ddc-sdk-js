import { Binary } from 'polkadot-api';
import { connect, createNodesPallet, StorageNodeMode } from '@cere-ddc-sdk/blockchain';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

describeChain('papi nodes (live, devnet)', () => {
  it('listStorageNodes() decodes host to utf8 and mode to enum string', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const nodes = await client.nodes.listStorageNodes();
      expect(nodes.length).toBeGreaterThan(0);
      const n = nodes[0];
      expect(typeof n.props.host).toBe('string');
      expect(n.props.host).not.toMatch(/^0x/); // decoded, not raw hex
      expect(Object.values(StorageNodeMode)).toContain(n.props.mode);
      expect(typeof n.props.httpPort).toBe('number');
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it('findStorageNodeByPublicKey() round-trips a known node; unknown → undefined', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const nodes = await client.nodes.listStorageNodes();
      const [first] = nodes;
      const found = await client.nodes.findStorageNodeByPublicKey(first.pubKey);
      expect(found?.pubKey).toBe(first.pubKey);

      // A syntactically valid, checksummed SS58 address (a node's own provider id) that
      // this test dynamically confirms is not itself a registered storage node pub key,
      // so the not-found path is exercised without hand-typing an address — papi's
      // `AccountId` codec strictly validates the SS58 checksum (unlike the legacy
      // polkadot.js path, which tolerated malformed placeholder strings).
      const pubKeys = new Set(nodes.map((n) => n.pubKey));
      const notANode = first.providerId;
      if (!pubKeys.has(notANode as any)) {
        const missing = await client.nodes.findStorageNodeByPublicKey(notANode);
        expect(missing).toBeUndefined();
      }
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it('create/set/delete builders encode + are runtime-compatible (no submit)', async () => {
    const client = connect({ network: 'devnet' });
    try {
      // Reuse a real, validly-checksummed SS58 address observed on this chain (a known
      // node's own pub key) rather than a hand-typed literal: this is a pure-encode test
      // (no submit), so any valid SS58 string round-trips through the codec fine — it
      // doesn't need to be free of an existing registration.
      const [first] = await client.nodes.listStorageNodes();
      const key = first.pubKey;
      const props = {
        host: 'node.example.com',
        httpPort: 8091,
        grpcPort: 9091,
        p2pPort: 9071,
        mode: StorageNodeMode.Storage,
      };
      expect(Binary.toHex(await client.nodes.createStorageNode(key, props).getEncodedData())).toMatch(/^0x/);
      expect(Binary.toHex(await client.nodes.setStorageNodeProps(key, props).getEncodedData())).toMatch(/^0x/);
      expect(Binary.toHex(await client.nodes.deleteStorageNode(key).getEncodedData())).toMatch(/^0x/);
      await client.assertCompatible('DdcNodes', 'create_node');
      await client.assertCompatible('DdcNodes', 'set_node_params');
      await client.assertCompatible('DdcNodes', 'delete_node');
    } finally {
      client.disconnect();
    }
  }, 60_000);
});

describe('papi nodes (unit)', () => {
  const nodeKey = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const providerId = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
  const props = {
    host: '178.251.228.165',
    httpPort: 8080,
    grpcPort: 9090,
    p2pPort: 9070,
    mode: StorageNodeMode.Storage,
  };

  const stubApi = (txArgs: any[], storedProps: Record<string, unknown>) =>
    ({
      tx: {
        DdcNodes: {
          create_node: (args: any) => (txArgs.push(args), {}),
          set_node_params: (args: any) => (txArgs.push(args), {}),
        },
      },
      query: {
        DdcNodes: {
          StorageNodes: {
            getValue: async () => ({
              pub_key: nodeKey,
              provider_id: providerId,
              cluster_id: undefined,
              props: storedProps,
            }),
          },
        },
      },
    }) as any;

  it('a node stored with domain and ssl reads back without them', async () => {
    const nodes = createNodesPallet(
      stubApi([], {
        host: Binary.fromText(props.host),
        domain: Binary.fromText('storage-7.devnet.ddc-dragon.com'),
        ssl: true,
        http_port: props.httpPort,
        grpc_port: props.grpcPort,
        p2p_port: props.p2pPort,
        mode: { type: props.mode },
      }),
    );

    const node = await nodes.findStorageNodeByPublicKey(nodeKey as any);

    expect(node?.props).toEqual(props);
  });

  it('create and set node params carry neither domain nor ssl', () => {
    const txArgs: any[] = [];
    const nodes = createNodesPallet(stubApi(txArgs, {}));

    nodes.createStorageNode(nodeKey as any, props);
    nodes.setStorageNodeProps(nodeKey as any, props);

    for (const args of txArgs) {
      expect(Object.keys(args.node_params.value).sort()).toEqual([
        'grpc_port',
        'host',
        'http_port',
        'mode',
        'p2p_port',
      ]);
    }
    expect(txArgs).toHaveLength(2);
  });
});
