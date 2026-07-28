[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / KeyringSigner

# Class: KeyringSigner

Signer that uses a keyring pair to sign data.

## Example

```typescript
const pair = new Keyring().addFromUri('//Alice');
const keyringSigner = new KeyringSigner(pair);
const signature = await keyringSigner.sign('data');

console.log(signature);
```

## Extends

- [`Signer`](../interfaces/Signer.md)

## Extended by

- [`UriSigner`](UriSigner.md)
- [`JsonSigner`](JsonSigner.md)

## Accessors

### address

#### Get Signature

> **get** **address**(): `string`

The address of the signer.

##### Returns

`string`

The address of the signer.

#### Overrides

[`Signer`](../interfaces/Signer.md).[`address`](../interfaces/Signer.md#address)

***

### isLocked

#### Get Signature

> **get** **isLocked**(): `boolean`

A boolean indicating whether the signer is locked.

##### Returns

`boolean`

A boolean indicating whether the signer is locked.

#### Overrides

[`Signer`](../interfaces/Signer.md).[`isLocked`](../interfaces/Signer.md#islocked)

***

### publicKey

#### Get Signature

> **get** **publicKey**(): `Uint8Array`\<`ArrayBufferLike`\>

The public key of the signer.

##### Returns

`Uint8Array`\<`ArrayBufferLike`\>

The public key of the signer.

#### Overrides

[`Signer`](../interfaces/Signer.md).[`publicKey`](../interfaces/Signer.md#publickey)

***

### type

#### Get Signature

> **get** **type**(): `KeypairType`

The type of the signer ('ed25519' or 'sr25519').

##### Returns

`KeypairType`

The type of the signer ('ed25519' or 'sr25519').

#### Overrides

[`Signer`](../interfaces/Signer.md).[`type`](../interfaces/Signer.md#type)

## Methods

### isReady()

> **isReady**(): `Promise`\<`boolean`\>

Checks if the signer is ready.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to a boolean indicating whether the signer is ready.

#### Overrides

[`Signer`](../interfaces/Signer.md).[`isReady`](../interfaces/Signer.md#isready)

***

### sign()

> **sign**(`data`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Signs data with the signer.

#### Parameters

##### data

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

The data to sign.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

A promise that resolves to the signature.

#### Overrides

[`Signer`](../interfaces/Signer.md).[`sign`](../interfaces/Signer.md#sign)

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

#### Overrides

[`Signer`](../interfaces/Signer.md).[`unlock`](../interfaces/Signer.md#unlock)

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

`Signer.isSigner`
