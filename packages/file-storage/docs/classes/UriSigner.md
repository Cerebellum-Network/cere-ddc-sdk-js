[**@cere-ddc-sdk/file-storage**](../README.md)

***

[@cere-ddc-sdk/file-storage](../README.md) / UriSigner

# Class: UriSigner

Signer that uses a Substrate URI to create a keypair.

## Example

```typescript
const uriSigner = new UriSigner('//Alice', );
const signature = await uriSigner.sign('data');

console.log(signature);
```

## Extends

- [`KeyringSigner`](KeyringSigner.md)

## Accessors

### address

#### Get Signature

> **get** **address**(): `string`

The address of the signer.

##### Returns

`string`

The address of the signer.

#### Inherited from

[`KeyringSigner`](KeyringSigner.md).[`address`](KeyringSigner.md#address)

***

### isLocked

#### Get Signature

> **get** **isLocked**(): `boolean`

A boolean indicating whether the signer is locked.

##### Returns

`boolean`

A boolean indicating whether the signer is locked.

#### Inherited from

[`KeyringSigner`](KeyringSigner.md).[`isLocked`](KeyringSigner.md#islocked)

***

### publicKey

#### Get Signature

> **get** **publicKey**(): `Uint8Array`\<`ArrayBufferLike`\>

The public key of the signer.

##### Returns

`Uint8Array`\<`ArrayBufferLike`\>

The public key of the signer.

#### Inherited from

[`KeyringSigner`](KeyringSigner.md).[`publicKey`](KeyringSigner.md#publickey)

## Methods

### isReady()

> **isReady**(): `Promise`\<`boolean`\>

Checks if the signer is ready.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to a boolean indicating whether the signer is ready.

#### Inherited from

[`KeyringSigner`](KeyringSigner.md).[`isReady`](KeyringSigner.md#isready)

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

#### Inherited from

[`KeyringSigner`](KeyringSigner.md).[`sign`](KeyringSigner.md#sign)

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

[`KeyringSigner`](KeyringSigner.md).[`unlock`](KeyringSigner.md#unlock)

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

[`KeyringSigner`](KeyringSigner.md).[`isSigner`](KeyringSigner.md#issigner)
