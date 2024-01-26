[@cere-ddc-sdk/ddc](../README.md) / Piece

# Class: Piece

The `Piece` class represents a piece of content.

**`Example`**

```typescript
const content = new Uint8Array([1, 2, 3]);
const piece = new Piece(content, { size: 3 });

console.log(Piece.isPiece(piece)); // true
```

## Methods

### from

▸ **from**(`piece`): [`Piece`](Piece.md)

Creates a new `Piece` from an existing one.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `piece` | [`Piece`](Piece.md) | The existing `Piece` to create a new one from. |

#### Returns

[`Piece`](Piece.md)

A new `Piece` with the same content and metadata as the existing one.

___

### isPiece

▸ **isPiece**(`object`): object is Piece

Checks if an object is an instance of `Piece`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `object` | `unknown` | The object to check. |

#### Returns

object is Piece

`true` if the object is an instance of `Piece` or has the same properties as a `Piece`, `false` otherwise.

___

### isStaticPiece

▸ **isStaticPiece**(`object`): object is Piece

Checks if an object is an instance of `Piece` with static content.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `object` | `unknown` | The object to check. |

#### Returns

object is Piece

`true` if the object is an instance of `Piece` and its content is a `Uint8Array`, `false` otherwise.
