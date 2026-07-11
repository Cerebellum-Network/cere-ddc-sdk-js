import {
  encodeAddress,
  decodeAddress,
  UriSigner,
  StorageNodeMode,
  connect,
  isSigner,
} from '@cere-ddc-sdk/blockchain/papi';

describe('papi barrel (unit)', () => {
  it('exposes the consumer surface (values defined)', () => {
    expect(typeof encodeAddress).toBe('function');
    expect(typeof decodeAddress).toBe('function');
    expect(typeof connect).toBe('function');
    expect(typeof isSigner).toBe('function');
    expect(StorageNodeMode.Storage).toBe('Storage');
  });

  it('encodeAddress/decodeAddress round-trip a UriSigner address', () => {
    const s = new UriSigner('bottom drive obey lake curtain smoke basket hold race lonely fit walk');
    const decoded = decodeAddress(s.address);
    expect(decoded).toEqual(s.publicKey);
    expect(encodeAddress(decoded)).toBe(s.address);
  });
});
