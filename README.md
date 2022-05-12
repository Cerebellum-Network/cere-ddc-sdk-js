# Cere DDC SDK for JavaScript

## Packages

- [content-addressable-storage](packages/content-addressable-storage/README.md)
- [key-value-storage](packages/key-value-storage/README.md)
- [file-storage](packages/file-storage/README.md)
- [proto](packages/proto/README.md)
- [core](packages/core/README.md)

## Use case

- `content-addressable-storage` use when need simple upload data to DDC as 1 unit
- `key-value-storage` use when need store data by key
- `file-storage` use when need to upload large data by chunks

## Definitions

- `DDC` - decentralized data cloud, product of cerebellum network for storing data
- `piece` - abstraction which represents a unit of data stored in the DDC.
Doesn't have fixed size and can represent fully logically completed data or part of it.

## Dependencies

- protobuf compiler (`protoc`) for compiling *.proto model files.
- typescript `4.5.5+`

## Compilation

To compile the code in bulk:

- clone repository
- download required modules ```npm install```
- compile files ```npm run compile -ws```

## Testing

To run the tests for the entire project:
```shell
npm run test
```

To run the tests for a single package:

```shell
npm run test -- packages/content-addressable-storage
```
