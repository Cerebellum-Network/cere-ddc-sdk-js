[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / Web3Signer

# Class: Web3Signer

Signer that uses browser extensions (eg. PolkadotJs) to sign messages.

## Example

```typescript
const web3Signer = new Web3Signer({ autoConnect: true });
const signature = await web3Signer.sign('data');

console.log(signature);
```

## Extends

- [`Signer`](Signer.md)

## Extended by

- [`CereWalletSigner`](CereWalletSigner.md)

## Accessors

### address

#### Get Signature

> **get** **address**(): `string`

The address of the signer.

##### Returns

`string`

The address of the signer.

#### Overrides

[`Signer`](Signer.md).[`address`](Signer.md#address)

***

### isLocked

#### Get Signature

> **get** **isLocked**(): `boolean`

A boolean indicating whether the signer is locked.

##### Returns

`boolean`

A boolean indicating whether the signer is locked.

#### Overrides

[`Signer`](Signer.md).[`isLocked`](Signer.md#islocked)

***

### publicKey

#### Get Signature

> **get** **publicKey**(): `Uint8Array`\<`ArrayBufferLike`\>

The public key of the signer.

##### Returns

`Uint8Array`\<`ArrayBufferLike`\>

The public key of the signer.

#### Overrides

[`Signer`](Signer.md).[`publicKey`](Signer.md#publickey)

***

### type

#### Get Signature

> **get** **type**(): `KeypairType`

The type of the signer ('ed25519' or 'sr25519').

##### Returns

`KeypairType`

The type of the signer ('ed25519' or 'sr25519').

#### Overrides

[`Signer`](Signer.md).[`type`](Signer.md#type)

## Methods

### connect()

> **connect**(): `Promise`\<`Web3Signer`\>

Connects to the underlying Web3 signer.

#### Returns

`Promise`\<`Web3Signer`\>

A promise that resolves to the signer.

#### Throws

An error if the signer cannot be detected.

#### Example

```typescript
await web3Signer.connect();
```

***

### getSigner()

> **getSigner**(): `Promise`\<`Signer`\>

#### Returns

`Promise`\<`Signer`\>

#### Inherit Doc

#### Overrides

`Signer.getSigner`

***

### isReady()

> **isReady**(): `Promise`\<`boolean`\>

Checks if the signer is ready.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to a boolean indicating whether the signer is ready.

#### Overrides

[`Signer`](Signer.md).[`isReady`](Signer.md#isready)

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

#### Overrides

[`Signer`](Signer.md).[`sign`](Signer.md#sign)

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

[`Signer`](Signer.md).[`unlock`](Signer.md#unlock)

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

[`Signer`](Signer.md).[`isSigner`](Signer.md#issigner)
