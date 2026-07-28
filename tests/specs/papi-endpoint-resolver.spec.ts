import { EndpointResolver, RouterOperation } from '@cere-ddc-sdk/ddc';

// A minimal offline `Signer` stand-in: `publicKey` must be a valid ed25519-length
// (32 byte) key so the SDK-token memoization path (which encodes it as an ss58
// `address` when re-validating the cached token) doesn't throw on a bogus key.
const signer: any = {
  type: 'ed25519',
  address: '0x',
  publicKey: new Uint8Array(32),
  isReady: async () => true,
  sign: async () => new Uint8Array(64),
};

describe('EndpointResolver', () => {
  it('routes write ops to storageUrl and read ops to cdnUrl', async () => {
    const r = new EndpointResolver({ signer, storageUrl: 'https://storage.example', cdnUrl: 'https://cdn.example' });
    const w = await r.getNode(RouterOperation.STORE_PIECE, 1n);
    const rd = await r.getNode(RouterOperation.READ_PIECE, 1n);
    expect(w.displayName).toContain('storage.example');
    expect(rd.displayName).toContain('cdn.example');
  });

  it('falls back reads to storageUrl when cdnUrl is omitted', async () => {
    const r = new EndpointResolver({ signer, storageUrl: 'https://storage.example' });
    const rd = await r.getNode(RouterOperation.READ_PIECE, 1n);
    expect(rd.displayName).toContain('storage.example');
  });
});
