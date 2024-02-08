[@cere-ddc-sdk/blockchain](../README.md) / Signer

# Class: Signer

This abstract class provides a blueprint for creating different types of signers.

**`Example`**

```typescript
class MySigner extends Signer {
  // Implement abstract properties and methods...
}

const mySigner = new MySigner();
const isReady = await mySigner.isReady();
console.log(isReady);
```

## Hierarchy

- **`Signer`**

  ↳ [`UriSigner`](UriSigner.md)

  ↳ [`Web3Signer`](Web3Signer.md)

## Methods

### isReady

▸ **isReady**(): `Promise`\<`boolean`\>

Checks if the signer is ready.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to a boolean indicating whether the signer is ready.

___

### sign

▸ **sign**(`data`): `Promise`\<`Uint8Array`\>

Signs data with the signer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `string` \| `Uint8Array` | The data to sign. |

#### Returns

`Promise`\<`Uint8Array`\>

A promise that resolves to the signature.

___

### isSigner

▸ **isSigner**(`signer`): signer is Signer

Checks if an object is a signer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `unknown` | The object to check. |

#### Returns

signer is Signer

A boolean indicating whether the object is a signer.

## Properties

### address

• `Readonly` `Abstract` **address**: `string`

The address of the signer.

___

### publicKey

• `Readonly` `Abstract` **publicKey**: `Uint8Array`

The public key of the signer.

___

### type

• `Readonly` `Abstract` **type**: `KeypairType`

The type of the signer ('ed25519' or 'sr25519').
