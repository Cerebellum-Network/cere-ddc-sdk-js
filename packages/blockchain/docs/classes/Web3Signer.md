[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / Web3Signer

# Class: Web3Signer

Wraps a papi-injected browser-extension account (PolkadotJs, Talisman, ...)
as a chain-free `Signer`. The extension itself does the signing — `sign()`
delegates to the account's papi signer `signBytes`.

Extension discovery/connection (`getInjectedExtensions`/`connectInjectedExtension`)
reads `window.injectedWeb3`, so it only works in a browser with the
extension installed. The `./papi` build (`tsc -p tsconfig.papi.json`) does
not do `.node` module substitution, so this file is what ships for both
browser and Node — `fromExtension()` guards against `window` being
undefined and throws a clear error instead of a bare `ReferenceError`.

## Implements

- [`Signer`](../interfaces/Signer.md)
- `NativePolkadotSigner`

## Methods

### getPolkadotSigner()

> **getPolkadotSigner**(): `PolkadotSigner`

The extension account's native papi signer, used for extrinsic signing.
The extension signs extrinsics via its signed-payload flow; reconstructing
an extrinsic signature from `sign()`/`signBytes` (data signing, which the
extension wraps in `<Bytes>…</Bytes>`) would fail on-chain with BadProof.

#### Returns

`PolkadotSigner`

#### Implementation of

`NativePolkadotSigner.getPolkadotSigner`

***

### fromExtension()

> `static` **fromExtension**(`name`): `Promise`\<`Web3Signer`[]\>

Connects to a named browser extension (e.g. `'polkadot-js'`) and returns
one `Web3Signer` per account it exposes.

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`Web3Signer`[]\>
