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

### getSigner

▸ **getSigner**(): `Promise`\<`Signer`\>

#### Returns

`Promise`\<`Signer`\>

**`Inherit Doc`**

#### Overrides

Signer.getSigner

___

### isReady

▸ **isReady**(): `Promise`\<`boolean`\>

Checks if the signer is ready.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to a boolean indicating whether the signer is ready.

#### Overrides

[Signer](Signer.md).[isReady](Signer.md#isready)

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

#### Overrides

[Signer](Signer.md).[sign](Signer.md#sign)

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

#### Inherited from

[Signer](Signer.md).[unlock](Signer.md#unlock)

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
