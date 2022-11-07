# Cere DDC SDK for JavaScript

## Packages

- [content-addressable-storage](packages/content-addressable-storage/README.md)
- [key-value-storage](packages/key-value-storage/README.md)
- [file-storage](packages/file-storage/README.md)
- [proto](packages/proto/README.md)
- [core](packages/core/README.md)
- [smart-contract](packages/smart-contract/README.md)
- [ddc-client](packages/ddc-client/README.md)

## Use case

- `content-addressable-storage` use when need simple upload data to DDC as 1 unit
- `key-value-storage` use when need store data by key
- `file-storage` use when need to upload large data by chunks
- `smart-contract` client for working DDC Smart-Contract
- `ddc-client` simple client with all methods for working with DDC and DDC Smart-Contract

## Definitions

- `DDC` - decentralized data cloud, product of cerebellum network for storing data
- `piece` - abstraction which represents a unit of data stored in the DDC.
Doesn't have fixed size and can represent fully logically completed data or part of it.

## Links
- [Cere DDC](https://docs.cere.network/) description and documentation
- [Polkadot{.js} extension](https://polkadot.js.org/extension/) necessary for Cere DDC SDK using in the web browsers. 

## Dependencies

- node.js `16+`. Setup with: `nvm use`
- protobuf compiler (`protoc`) for compiling *.proto model files.
- typescript `4.5.5+`

## Compilation

To compile the code in bulk:

- clone repository
- [install](https://grpc.io/docs/protoc-installation/) `protoc` 
- download required modules ```npm install```
- compile files ```npm run compile```

## Testing

To run the tests for the entire project:
```shell
npm run test
```

## Changing the schema

Keep the protobuf schema and the test vectors in sync with the `ddc-schemas` repo.
First checkout the schemas repo:

    git submodule update --init

Then work in the `ddc-schemas` folder with git. For example, checkout a new branch, or add a new test vector ([example](packages/content-addressable-storage/src/__tests__/ContentAddressableStorage.spec.ts)). Then record the specific version of the schemas:

    git add ddc-schemas
