[@cere-ddc-sdk/blockchain](../README.md) / Web3Signer

# Class: Web3Signer

Signer that uses browser extensions (eg. PolkadotJs) to sign messages.

**`Example`**

```typescript
const web3Signer = new Web3Signer({ autoConnect: true });
const signature = await web3Signer.sign('data');

console.log(signature);
```

## Hierarchy

- [`Signer`](Signer.md)

  ↳ **`Web3Signer`**

  ↳↳ [`CereWalletSigner`](CereWalletSigner.md)

## Accessors

### address

• `get` **address**(): `string`

The address of the signer.

#### Returns

`string`

#### Overrides

Signer.address

___

### publicKey

• `get` **publicKey**(): `Uint8Array`

The public key of the signer.

#### Returns

`Uint8Array`

#### Overrides

Signer.publicKey

___

### type

• `get` **type**(): `KeypairType`

The type of the signer ('ed25519' or 'sr25519').

#### Returns

`KeypairType`

#### Overrides

Signer.type

## Methods

### connect

▸ **connect**(): `Promise`\<[`Web3Signer`](Web3Signer.md)\>

Connects to the underlying Web3 signer.

#### Returns

`Promise`\<[`Web3Signer`](Web3Signer.md)\>

A promise that resolves to the signer.

**`Throws`**

An error if the signer cannot be detected.

**`Example`**

```typescript
await web3Signer.connect();
```

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

[Signer](Signer.md).[isSigner](Signer.md#issigner)
