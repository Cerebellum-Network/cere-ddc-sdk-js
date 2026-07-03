[@cere-ddc-sdk/ddc](../README.md) / JsonSigner

# Class: JsonSigner

Signer that uses a JSON object to create a keypair.

**`Example`**

```typescript
const accountDataJson = {}; // Exported from Cere Wallet or other wallets
const jsonSigner = new JsonSigner(accountDataJson, { passphrase: '1234' });
const signature = await jsonSigner.sign('data');

console.log(signature);
```

## Hierarchy

- [`KeyringSigner`](KeyringSigner.md)

  ↳ **`JsonSigner`**

## Methods

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

[KeyringSigner](KeyringSigner.md).[isSigner](KeyringSigner.md#issigner)
