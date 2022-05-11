# Cere DDC SDK for JavaScript

## Packages

- [Content addressable Storage](packages/content-addressable-storage/README.md)
- [Key value Storage](packages/key-value-storage/README.md)
- [File Storage](packages/file-storage/README.md)
- [Proto](packages/proto/README.md)

## Definitions

- `DDC` - decentralized data cloud, product of cerebellum network for storing data
- `piece` - abstraction which represents a unit of data stored in the DDC.
Doesn't have fixed size and can represent fully logically completed data or part of it.

## Dependencies

Require protobuf compiler (`protoc`) for compiling *.proto model files.

## Compilation

To compile the code in bulk:

```shell
npm run compile -ws
```

## Testing

To run the tests for the entire project:
```shell
npm run test
```

To run the tests for a single package:

```shell
npm run test -- packages/content-addressable-storage
```
