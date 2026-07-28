# Migrating from 2.x to 3.0

`@cere-ddc-sdk/blockchain` 3.0 replaces its `@polkadot/api` ("legacy") chain
layer with [`polkadot-api`](https://github.com/polkadot-api/polkadot-api)
("papi"). The legacy `Blockchain` class, its `ddcX` pallet wrappers, and the
`/papi` subpath (an internal migration seam during the 2.x series) are gone.
There is now a single public entry point:

```ts
import { connect } from '@cere-ddc-sdk/blockchain';
```

This guide maps the old names to the new ones and calls out behavior changes
worth knowing about before you upgrade.

## Packaging: ESM-only

The package no longer ships a CommonJS or `browser` build. `package.json`
declares `"type": "module"` with a single export condition:

```json
"exports": {
  ".": { "types": "./dist/types/papi/index.d.ts", "default": "./dist/papi/index.js" }
}
```

Consumers must be ESM (`import`), or bundle it (Webpack/Vite/esbuild etc. all
handle this transparently). There is only one import path —
`@cere-ddc-sdk/blockchain` — the `@cere-ddc-sdk/blockchain/papi` subpath some
2.x-era code used no longer exists.

`@cere-ddc-sdk/ddc`, `@cere-ddc-sdk/ddc-client` and `@cere-ddc-sdk/file-storage`
are ESM-only too: they no longer publish a `require`/CommonJS entry (they do
still ship a `browser` build for bundlers). `require('@cere-ddc-sdk/…')` from
CommonJS is not supported in 3.0 — use `import`, or a dynamic
`await import('@cere-ddc-sdk/ddc-client')`.

### Node version

Node **≥ 22.11** (the repo's `.nvmrc` floor). The storage transport speaks
grpc-web over WebSockets and relies on a global `WebSocket`, which Node provides
from 22. On older Node the storage read/write paths will fail even though the
chain calls work.

## Client: connect instead of `new Blockchain`

| 2.x (legacy) | 3.0 (papi) |
| --- | --- |
| `new Blockchain(...)` / `Blockchain.connect({ wsEndpoint })` | `connect({ network })` or `connect({ network, wsUrl })` → `CereClient` |
| (implicit) | `client.disconnect()` — call when done to tear down the WS connection |

`connect()` takes a `ConnectOptions` object (or a bare WS URL string, for
back-compat — the network is inferred from the hostname):

```ts
interface ConnectOptions {
  network: 'mainnet' | 'testnet' | 'devnet';
  wsUrl?: string; // override the network's default public RPC endpoint
}
```

```ts
import { connect } from '@cere-ddc-sdk/blockchain';

const client = connect({ network: 'testnet' });
// ... use the client ...
client.disconnect();
```

## Pallet calls

| 2.x (legacy) | 3.0 (papi) |
| --- | --- |
| `blockchain.ddcClusters` | `client.clusters` |
| `blockchain.ddcClustersGov` | `client.clustersGov` |
| `blockchain.ddcNodes` | `client.nodes` |
| `blockchain.ddcCustomers` | `client.customers` |
| `blockchain.ddcStaking` | `client.staking` |
| `blockchain.send(tx, { account })` | `client.tx.send(tx, { signer })` |
| `blockchain.batchAllSend(txs, { account })` | `client.tx.batchAllSend(txs, { signer })` |

`client.tx` also exposes `batchSend` (`Utility.batch` — a failing call does
not fail the whole batch, unlike `batchAllSend`/`Utility.batch_all`), `sudo`,
and `sudoAs`.

## Signers

The legacy abstract `Signer` base class and `getSigner()` factory are
replaced by a **chain-free** `Signer` interface — it has no dependency on any
Polkadot/papi type, so a signer built for `@cef-ai/signer` or a CEF wallet
satisfies it too:

```ts
interface Signer {
  readonly type: 'ed25519' | 'sr25519' | 'ecdsa' | 'ethereum';
  readonly address: string;
  readonly publicKey: Uint8Array;
  isReady(): Promise<boolean>;
  sign(bytes: Uint8Array, intent?: 'data' | 'token' | 'extrinsic'): Promise<Uint8Array>;
}
```

Bridging a `Signer` to a papi `PolkadotSigner` for extrinsic submission is an
internal detail (`toPolkadotSigner`) — you never need to call it yourself;
`client.tx.send(tx, { signer })` accepts either a `Signer` or a raw papi
`PolkadotSigner`.

Concrete signer classes keep their 2.x names, now implemented natively on
papi:

| Class | Notes |
| --- | --- |
| `UriSigner` | From a mnemonic/seed + optional `//hard/soft` derivation path. **Absorbs the old `MnemonicSigner`** — there is no separate `MnemonicSigner` in 3.0. |
| `Web3Signer` | Wraps a browser-extension account (PolkadotJs, Talisman, ...). **Absorbs the old `ExtensionSigner`.** |
| `CereWalletSigner` | Adapts an already-connected wallet signing account (e.g. `@cere/embed-wallet`) via constructor injection. |
| `KeyringSigner` | Wraps a raw keypair. |
| `JsonSigner` | From an encrypted keystore JSON. |
| `createRandomSigner` | Generates a fresh random signer. |

```ts
import { UriSigner } from '@cere-ddc-sdk/blockchain';

const signer = new UriSigner('//Alice');
```

## Address utilities

`encodeAddress`/`decodeAddress` are now implemented on papi-native
`@polkadot-labs/hdkd-helpers` ss58 codecs instead of `@polkadot/util-crypto`,
with the same call shape:

```ts
import { encodeAddress, decodeAddress } from '@cere-ddc-sdk/blockchain';

const address = encodeAddress(publicKey);
const publicKey2 = decodeAddress(address);
```

## Behavior/API changes

- **CDN staking is gone.** The legacy `ddcStaking.serve` call and the other
  CDN-node staking methods have no equivalent — `DdcStaking` on the new
  runtime has no `CDNs` storage item and no CDN-node calls, so CDN-node
  staking was dropped from the runtime itself, not just from the SDK's
  surface. `client.staking` only covers storage-node and cluster staking.
- **`StorageNodeMode.Compute` enum-domain gap.** The runtime's node-mode enum
  has a 4th variant, `Compute`, that the domain `StorageNodeMode` type
  (`Full` / `Storage` / `Cache`) doesn't model. A Compute-mode node's
  `props.mode` decodes to the out-of-domain string `'Compute'`, which is not
  a member of the `StorageNodeMode` enum. This is a known, documented
  limitation — extending `StorageNodeMode` is deferred to a follow-up.
- **`Ledger.owner` from the customer-deposit contract is corrected, not
  passed through.** The ink! contract's `get_balance` call decodes a fixed,
  *wrong* SS58 address in its `owner` field on-chain (a known contract/ABI
  quirk) — `total`/`active` decode correctly. The SDK overrides the decoded
  `owner` with the address you queried with (which is, by definition, the
  account the balance belongs to) rather than trusting the contract's
  mis-encoded value. If you rely on `getStackingInfo(...).owner`, it reflects
  the queried account, not whatever the contract's raw storage says.
- **Per-network deposit backing is transparent.** Some networks back
  customer deposits with an on-chain ink! contract, others with the
  `DdcCustomers` pallet ledger directly. `client.customers` handles this
  itself for every deposit/withdraw/read method — contract-first (if the
  cluster has a live deposit contract), falling back to the pallet ledger
  otherwise. You don't need to know or branch on which backing a given
  cluster/network uses.
- **Deposit builders accept an optional `{ from }`.** On the contract path,
  `deposit`/`depositExtra`/`depositFor`/`unlockDeposit`/
  `withdrawUnlockedDeposit` size the call with a dry run. Passing the account
  that will sign lets that dry run be priced against the real, funded caller,
  which yields precise gas and a correctly sized `storage_deposit_limit`:

  ```ts
  const tx = await client.customers.deposit(clusterId, value, { from: signer.address });
  await client.tx.send(tx, { signer });
  ```

  `DdcClient` passes its own signer automatically, so this only matters if you
  drive `client.customers` directly. Omitting it still works — sizing falls
  back to conservative ceilings.

## Before / after: connect + read balance

**2.x (legacy):**

```ts
import { Blockchain, UriSigner } from '@cere-ddc-sdk/blockchain';

const account = new UriSigner('//Alice');
const blockchain = await Blockchain.connect({ wsEndpoint: 'wss://rpc.testnet.cere.network/ws' });

const balance = await blockchain.getAccountFreeBalance(account.address);
```

**3.0 (papi):**

```ts
import { connect, UriSigner } from '@cere-ddc-sdk/blockchain';

const signer = new UriSigner('//Alice');
const client = connect({ network: 'testnet' });

const balance = await client.chain.getAccountFreeBalance(signer.address);

client.disconnect();
```

## Before / after: deposit

**2.x (legacy):**

```ts
import { Blockchain, UriSigner } from '@cere-ddc-sdk/blockchain';

const account = new UriSigner('//Alice');
const blockchain = await Blockchain.connect({ wsEndpoint: 'wss://rpc.testnet.cere.network/ws' });

const clusterId = '0x...';
const deposit = 100n * 10n ** blockchain.chainDecimals; // 100 CERE
const tx = blockchain.ddcCustomers.deposit(clusterId, deposit);

await blockchain.send(tx, { account });
```

**3.0 (papi):**

```ts
import { connect, UriSigner } from '@cere-ddc-sdk/blockchain';

const signer = new UriSigner('//Alice');
const client = connect({ network: 'testnet' });

const clusterId = '0x...';
const decimals = await client.chain.getChainDecimals();
const deposit = 100n * 10n ** BigInt(decimals); // 100 CERE
const tx = await client.customers.deposit(clusterId, deposit);

await client.tx.send(tx, { signer });

client.disconnect();
```

Note that `client.customers.deposit(clusterId, value)` is `async` (it may
need to dry-run the deposit contract for gas sizing), unlike the legacy
`ddcCustomers.deposit` which built the extrinsic synchronously.

## `@cere-ddc-sdk/ddc-client`

`DdcClient` did not change its own public method signatures
(`getBalance`, `depositBalance`, `getDeposit`, `createBucket`, ...); it now
resolves its `config.blockchain` option — a network name, a WS URL, or an
already-connected `CereClient` — through the same `connect`/`CereClient`
machinery internally. If you were constructing a `DdcClient` around a
hand-built legacy `Blockchain` instance, pass a `CereClient` (from `connect(...)`)
instead.
