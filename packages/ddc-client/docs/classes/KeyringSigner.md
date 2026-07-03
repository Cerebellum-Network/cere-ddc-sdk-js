[@cere-ddc-sdk/ddc-client](../README.md) / KeyringSigner

# Class: KeyringSigner

Signer that uses a keyring pair to sign data.

**`Example`**

```typescript
const pair = new Keyring().addFromUri('//Alice');
const keyringSigner = new KeyringSigner(pair);
const signature = await keyringSigner.sign('data');

console.log(signature);
```

## Hierarchy

- [`Signer`](Signer.md)

  ↳ **`KeyringSigner`**

  ↳↳ [`UriSigner`](UriSigner.md)

  ↳↳ [`JsonSigner`](JsonSigner.md)

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

[Signer](Signer.md).[isSigner](Signer.md#issigner)
