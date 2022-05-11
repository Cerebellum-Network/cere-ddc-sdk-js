# Cere DDC SDK for JavaScript

## Packages

- [Content addressable Storage](packages/content-addressable-storage/README.md)
- [Key value Storage](packages/key-value-storage/README.md)
- [File Storage](packages/file-storage/README.md)
- [Proto](packages/proto/README.md)

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
