[@cere-ddc-sdk/ddc-client](../README.md) / File

# Class: File

Represents a file with content and metadata.

## Properties

### body

• `Readonly` **body**: `ContentStream`

The content of the file as a stream.

___

### meta

• `Readonly` **meta**: `StreamMeta` \| `StaticContentMeta`

The metadata for the file.

___

### size

• `Readonly` **size**: `number`

The size of the file in bytes.

## Methods

### isFile

▸ **isFile**(`object`): object is File

Checks if a given object is an instance of the `File` class.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `object` | `unknown` | The object to check. |

#### Returns

object is File

True if the object is a `File` instance, false otherwise.
