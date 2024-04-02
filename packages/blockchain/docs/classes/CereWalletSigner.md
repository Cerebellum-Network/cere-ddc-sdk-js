[@cere-ddc-sdk/blockchain](../README.md) / CereWalletSigner

# Class: CereWalletSigner

Signer that uses Cere Wallet to sign messages.

**`Example`**

```typescript
import { EmbedWallet } from '@cere/embed-wallet';

const cereWallet = new EmbedWallet({ env: 'dev' });
await cereWallet.init();

const cereWalletSigner = new CereWalletSigner(cereWallet);
const signature = await cereWalletSigner.sign('data');

console.log(signature);
```

## Hierarchy

- [`Web3Signer`](Web3Signer.md)

  ↳ **`CereWalletSigner`**

## Accessors

### address

• `get` **address**(): `string`

The address of the signer.

#### Returns

`string`

#### Inherited from

Web3Signer.address

___

### publicKey

• `get` **publicKey**(): `Uint8Array`

The public key of the signer.

#### Returns

`Uint8Array`

#### Inherited from

Web3Signer.publicKey

___

### type

• `get` **type**(): `KeypairType`

The type of the signer ('ed25519' or 'sr25519').

#### Returns

`KeypairType`

#### Inherited from

Web3Signer.type

## Methods

### getSigner

▸ **getSigner**(): `Promise`\<`Signer`\>

#### Returns

`Promise`\<`Signer`\>

**`Inherit Doc`**

#### Inherited from

[Web3Signer](Web3Signer.md).[getSigner](Web3Signer.md#getsigner)

___

### isReady

▸ **isReady**(): `Promise`\<`boolean`\>

Checks if the signer is ready.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to a boolean indicating whether the signer is ready.

#### Inherited from

[Web3Signer](Web3Signer.md).[isReady](Web3Signer.md#isready)

___

### sign

▸ **sign**(`message`): `Promise`\<`Uint8Array`\>

Signs data with the signer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` \| `Uint8Array` | The data to sign. |

#### Returns

`Promise`\<`Uint8Array`\>

A promise that resolves to the signature.

#### Inherited from

[Web3Signer](Web3Signer.md).[sign](Web3Signer.md#sign)

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

#### Inherited from

[Web3Signer](Web3Signer.md).[isSigner](Web3Signer.md#issigner)
