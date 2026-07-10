[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / CereWalletSigner

# Class: CereWalletSigner

Signer that uses Cere Wallet to sign messages.

## Example

```typescript
import { EmbedWallet } from '@cere/embed-wallet';

const cereWallet = new EmbedWallet({ env: 'dev' });
await cereWallet.init();

const cereWalletSigner = new CereWalletSigner(cereWallet);
const signature = await cereWalletSigner.sign('data');

console.log(signature);
```

## Extends

- [`Web3Signer`](Web3Signer.md)

## Accessors

### address

#### Get Signature

> **get** **address**(): `string`

The address of the signer.

##### Returns

`string`

The address of the signer.

#### Inherited from

[`Web3Signer`](Web3Signer.md).[`address`](Web3Signer.md#address)

***

### isLocked

#### Get Signature

> **get** **isLocked**(): `boolean`

A boolean indicating whether the signer is locked.

##### Returns

`boolean`

A boolean indicating whether the signer is locked.

#### Inherited from

[`Web3Signer`](Web3Signer.md).[`isLocked`](Web3Signer.md#islocked)

***

### publicKey

#### Get Signature

> **get** **publicKey**(): `Uint8Array`\<`ArrayBufferLike`\>

The public key of the signer.

##### Returns

`Uint8Array`\<`ArrayBufferLike`\>

The public key of the signer.

#### Inherited from

[`Web3Signer`](Web3Signer.md).[`publicKey`](Web3Signer.md#publickey)

***

### type

#### Get Signature

> **get** **type**(): `KeypairType`

The type of the signer ('ed25519' or 'sr25519').

##### Returns

`KeypairType`

The type of the signer ('ed25519' or 'sr25519').

#### Inherited from

[`Web3Signer`](Web3Signer.md).[`type`](Web3Signer.md#type)

## Methods

### connect()

> **connect**(`options?`): `Promise`\<`CereWalletSigner`\>

Connects to the underlying Web3 signer.

#### Parameters

##### options?

`WalletConnectOptions`

#### Returns

`Promise`\<`CereWalletSigner`\>

A promise that resolves to the signer.

#### Throws

An error if the signer cannot be detected.

#### Example

```typescript
await web3Signer.connect();
```

#### Overrides

[`Web3Signer`](Web3Signer.md).[`connect`](Web3Signer.md#connect)

***

### getSigner()

> **getSigner**(): `Promise`\<`Signer`\>

#### Returns

`Promise`\<`Signer`\>

#### Inherit Doc

#### Inherited from

[`Web3Signer`](Web3Signer.md).[`getSigner`](Web3Signer.md#getsigner)

***

### isReady()

> **isReady**(): `Promise`\<`boolean`\>

Checks if the signer is ready.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to a boolean indicating whether the signer is ready.

#### Overrides

[`Web3Signer`](Web3Signer.md).[`isReady`](Web3Signer.md#isready)

***

### sign()

> **sign**(`message`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Signs data with the signer.

#### Parameters

##### message

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

The data to sign.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

A promise that resolves to the signature.

#### Inherited from

[`Web3Signer`](Web3Signer.md).[`sign`](Web3Signer.md#sign)

***

### unlock()

> **unlock**(`passphrase?`): `Promise`\<`void`\>

Unlocks the signer with a passphrase.

#### Parameters

##### passphrase?

`string`

The passphrase to unlock the signer.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Web3Signer`](Web3Signer.md).[`unlock`](Web3Signer.md#unlock)

***

### isSigner()

> `static` **isSigner**(`signer`): `signer is Signer`

Checks if an object is a signer.

#### Parameters

##### signer

`unknown`

The object to check.

#### Returns

`signer is Signer`

A boolean indicating whether the object is a signer.

#### Inherited from

[`Web3Signer`](Web3Signer.md).[`isSigner`](Web3Signer.md#issigner)
