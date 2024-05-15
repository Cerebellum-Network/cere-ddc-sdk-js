[@cere-ddc-sdk/file-storage](../README.md) / Signer

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

## Properties

### address

• `Readonly` `Abstract` **address**: `string`

The address of the signer.

___

### isLocked

• `Readonly` `Abstract` **isLocked**: `boolean`

A boolean indicating whether the signer is locked.

___

### publicKey

• `Readonly` `Abstract` **publicKey**: `Uint8Array`

The public key of the signer.

___

### type

• `Readonly` `Abstract` **type**: `KeypairType`

The type of the signer ('ed25519' or 'sr25519').

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

### unlock

▸ **unlock**(`passphrase?`): `Promise`\<`void`\>

Unlocks the signer with a passphrase.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `passphrase?` | `string` | The passphrase to unlock the signer. |

#### Returns

`Promise`\<`void`\>

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
