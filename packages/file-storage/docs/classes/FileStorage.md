[@cere-ddc-sdk/file-storage](../README.md) / FileStorage

# Class: FileStorage

Represents a storage system for files.

It provides methods to read and store files in the DDC.

## Methods

### read

▸ **read**(`bucketId`, `cidOrName`, `options?`): `Promise`\<[`FileResponse`](FileResponse.md)\>

Reads a file from the file storage.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket where the file is stored. |
| `cidOrName` | `string` | The CID or CNS name of the file to read. |
| `options?` | `PieceReadOptions` | The options for reading the file. |

#### Returns

`Promise`\<[`FileResponse`](FileResponse.md)\>

A promise that resolves to a `FileResponse` instance.

___

### store

▸ **store**(`bucketId`, `file`, `options?`): `Promise`\<`string`\>

Stores a file in the DDC. Large files are stored as a collection of pieces.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucketId` | `bigint` | The ID of the bucket where the file will be stored. |
| `file` | [`File`](File.md) | The file to store. |
| `options?` | `PieceStoreOptions` | The options for storing the file. |

#### Returns

`Promise`\<`string`\>

A promise that resolves to the CID of the stored file.

___

### create

▸ **create**(`uriOrSigner`, `config?`): `Promise`\<[`FileStorage`](FileStorage.md)\>

Creates a new instance of the `FileStorage` class asynchronously.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `uriOrSigner` | `string` \| `Signer` | `undefined` | A Signer instance or a [substrate URI](https://polkadot.js.org/docs/keyring/start/suri). |
| `config` | `FileStorageConfig` | `DEFAULT_PRESET` | Configuration options for the `FileStorage`. Defaults to TESTNET. |

#### Returns

`Promise`\<[`FileStorage`](FileStorage.md)\>

A promise that resolves to a new `FileStorage` instance.
