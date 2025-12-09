// Jest stub for @cere/embed-wallet to run in Node test environment
// Provides minimal surface used by CereWalletSigner and Wallet constructor typing

export type WalletAccount = {
  publicKey: string;
  address: string;
  type: string;
};

export interface SignerInterface {
  getAccount(): Promise<WalletAccount>;
  signMessage(data: string): Promise<string> | string;
}

export type EmbedWalletOptions = Record<string, unknown>;

export class EmbedWallet {
  public isConnected: Promise<boolean>;

  constructor(_opts?: EmbedWalletOptions) {
    // Immediately "connected" in tests
    this.isConnected = Promise.resolve(true);
  }

  getSigner(_opts: { type: string }): SignerInterface {
    const account: WalletAccount = {
      publicKey: 'deadbeef',
      address: '0x0000000000000000000000000000000000000000',
      type: 'ed25519',
    };

    return {
      async getAccount() {
        return account;
      },
      async signMessage(data: string) {
        // Deterministic fake signature for tests
        return `signed:${data}`;
      },
    };
  }
}
