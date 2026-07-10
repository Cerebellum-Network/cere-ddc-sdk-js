// Node stub for the browser-extension signer. `ExtensionSigner` (and its
// `fromExtension` factory) depend on `window.injectedWeb3`, which does not
// exist in Node — this throws a clear error instead of a bare
// `ReferenceError: window is not defined` from `polkadot-api/pjs-signer`.
// Picked over `ExtensionSigner.ts` via `moduleSuffixes: ['.node', '']` in
// `tsconfig.node.json`, mirroring the legacy `Web3Signer.node.ts`/
// `CereWalletSigner.node.ts` split.
export class ExtensionSigner {
  constructor() {
    throw new Error('ExtensionSigner is not supported in a NodeJS environment');
  }

  static async fromExtension(): Promise<never> {
    throw new Error('ExtensionSigner is not supported in a NodeJS environment');
  }
}
