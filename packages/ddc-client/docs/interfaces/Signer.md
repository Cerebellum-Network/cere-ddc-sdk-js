[**@cere-ddc-sdk/ddc-client**](../README.md)

***

[@cere-ddc-sdk/ddc-client](../README.md) / Signer

# Abstract Interface: Signer

This abstract class provides a blueprint for creating different types of signers.

## Example

```typescript
class MySigner extends Signer {
  // Implement abstract properties and methods...
}

const mySigner = new MySigner();
const isReady = await mySigner.isReady();
console.log(isReady);
```

## Extended by

- [`KeyringSigner`](../classes/KeyringSigner.md)

## Properties

### address

> `abstract` `readonly` **address**: `string`

The address of the signer.

***

### isLocked

> `abstract` `readonly` **isLocked**: `boolean`

A boolean indicating whether the signer is locked.

***

### publicKey

> `abstract` `readonly` **publicKey**: `Uint8Array`

The public key of the signer.

***

### type

> `abstract` `readonly` **type**: `KeypairType`

The type of the signer ('ed25519' or 'sr25519').

## Methods

### isReady()

> `abstract` **isReady**(): `Promise`\<`boolean`\>

Checks if the signer is ready.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to a boolean indicating whether the signer is ready.

***

### sign()

> `abstract` **sign**(`data`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Signs data with the signer.

#### Parameters

##### data

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

The data to sign.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

A promise that resolves to the signature.

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
