[**@cere-ddc-sdk/ddc-client**](../README.md)

***

[@cere-ddc-sdk/ddc-client](../README.md) / CereWalletSigner

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

- `Web3Signer`

## Accessors

### address

#### Get Signature

> **get** **address**(): `string`

##### Inherit Doc

##### Returns

`string`

#### Inherited from

`Web3Signer.address`

***

### isLocked

#### Get Signature

> **get** **isLocked**(): `boolean`

A boolean indicating whether the signer is locked.

##### Returns

`boolean`

#### Inherited from

`Web3Signer.isLocked`

***

### publicKey

#### Get Signature

> **get** **publicKey**(): `Uint8Array`\<`ArrayBufferLike`\>

##### Inherit Doc

##### Returns

`Uint8Array`\<`ArrayBufferLike`\>

#### Inherited from

`Web3Signer.publicKey`

***

### type

#### Get Signature

> **get** **type**(): `KeypairType`

##### Inherit Doc

##### Returns

`KeypairType`

#### Inherited from

`Web3Signer.type`

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

`Web3Signer.connect`

***

### getSigner()

> **getSigner**(): `Promise`\<`Signer`\>

#### Returns

`Promise`\<`Signer`\>

#### Inherit Doc

#### Inherited from

`Web3Signer.getSigner`

***

### isReady()

> **isReady**(): `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

#### Inherit Doc

#### Overrides

`Web3Signer.isReady`

***

### sign()

> **sign**(`message`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

#### Parameters

##### message

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

#### Inherit Doc

#### Inherited from

`Web3Signer.sign`

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

`Web3Signer.unlock`

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

`Web3Signer.isSigner`
