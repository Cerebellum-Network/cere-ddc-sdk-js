import Wallet from '../../packages/client/src/wallet';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CereWalletSigner, UriSigner } from '@cere-activity-sdk/signers';
// eslint-disable-next-line import/no-extraneous-dependencies
import { EmbedWallet } from '@cere/embed-wallet';

describe('Wallet', () => {
  it('creates UriSigner when provided a mnemonic/uri string', () => {
    const mnemonic = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';
    const wallet = new Wallet(mnemonic);
    expect(wallet.wallet).toBeInstanceOf(UriSigner);
  });

  it('uses JsonSigner-like object directly when it has sign() function', async () => {
    const signerLike = {
      type: 'ed25519',
      address: '0x0',
      publicKey: '0xabc',
      isReady: jest.fn().mockResolvedValue(true),
      sign: jest.fn(async (_data: string) => '0xsigned'),
    } as any;

    const wallet = new Wallet(signerLike);
    expect(wallet.wallet).toBe(signerLike);
  });

  it('wraps EmbedWallet instance with CereWalletSigner', () => {
    const embed = new EmbedWallet();
    const wallet = new Wallet(embed as any);
    expect(wallet.wallet).toBeInstanceOf(CereWalletSigner);
  });

  it('throws error for unsupported signer type', () => {
    expect(() => new Wallet({} as any)).toThrow('Unsupported signer type');
  });
});
