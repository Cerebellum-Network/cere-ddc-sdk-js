[@cere-ddc-sdk/ddc-client](../README.md) / UriSigner

# Class: UriSigner

Signer that uses a Substrate URI to create a keypair.

**`Example`**

```typescript
const uriSigner = new UriSigner('//Alice', );
const signature = await uriSigner.sign('data');

console.log(signature);
```

## Hierarchy

- [`Signer`](Signer.md)

  ↳ **`UriSigner`**

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
