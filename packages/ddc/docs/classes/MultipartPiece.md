[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / MultipartPiece

# Class: MultipartPiece

The `MultipartPiece` class represents a piece cobined from multiple parts (raw pieces).

## Example

```typescript
const parts = ['CID1', 'CID2'];
const multipartPiece = new MultipartPiece(parts, {
 partSize: 1024,
 totalSize: 2048,
});

console.log(MultipartPiece.isMultipartPiece(multipartPiece)); // true
```

## Methods

### isMultipartPiece()

> `static` **isMultipartPiece**(`object`): `object is MultipartPiece`

Checks if an object is an instance of `MultipartPiece`.

#### Parameters

##### object

`unknown`

The object to check.

#### Returns

`object is MultipartPiece`

`true` if the object is an instance of `MultipartPiece` or has the same properties as a `MultipartPiece`, `false` otherwise.

## Properties

### meta

> `readonly` **meta**: `MultipartPieceMeta`

The metadata of the multipart piece.

***

### partHashes

> `readonly` **partHashes**: `Uint8Array`\<`ArrayBufferLike`\>[]

The hashes of the parts of the multipart piece.

***

### parts

> `readonly` **parts**: `string`[]

The parts of the multipart piece.
