[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / Piece

# Class: Piece

The `Piece` class represents a piece of content.

## Example

```typescript
const content = new Uint8Array([1, 2, 3]);
const piece = new Piece(content, { size: 3 });

console.log(Piece.isPiece(piece)); // true
```

## Accessors

### isPart

#### Get Signature

> **get** **isPart**(): `boolean`

Checks if the piece is part of a multipart upload.

##### Returns

`boolean`

***

### size

#### Get Signature

> **get** **size**(): `number`

The size of the piece.

##### Returns

`number`

## Methods

### from()

> `static` **from**(`piece`): `Piece`

Creates a new `Piece` from an existing one.

#### Parameters

##### piece

`Piece`

The existing `Piece` to create a new one from.

#### Returns

`Piece`

A new `Piece` with the same content and metadata as the existing one.

***

### isPiece()

> `static` **isPiece**(`object`): `object is Piece`

Checks if an object is an instance of `Piece`.

#### Parameters

##### object

`unknown`

The object to check.

#### Returns

`object is Piece`

`true` if the object is an instance of `Piece` or has the same properties as a `Piece`, `false` otherwise.

***

### isStaticPiece()

> `static` **isStaticPiece**(`object`): `object is Piece`

Checks if an object is an instance of `Piece` with static content.

#### Parameters

##### object

`unknown`

The object to check.

#### Returns

`object is Piece`

`true` if the object is an instance of `Piece` and its content is a `Uint8Array`, `false` otherwise.

## Properties

### body

> `readonly` **body**: `ContentStream`

The content of the piece as a stream.

***

### meta

> `readonly` **meta**: `StaticPieceMeta`

The metadata for the piece.

***

### offset?

> `optional` **offset?**: `number`

The offset of the piece in a multipart upload.
