# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.1...v2.1.0) (2024-01-30)

### Features

- **ddc:** Add network latency based routing to select closest nodes to the client ([#218](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/218)) ([6ddc828](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/6ddc8284b03b397bd4f7ae7c16a9f1235585946c))
- Extend auth token API with methods to delegate access ([#215](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/215)) ([1da5e38](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/1da5e387369645893ff512bc1a00d78ad2dbd6bd))

### Bug Fixes

- **ddc:** Properly handle grpc headers error in WebSocket transport ([#216](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/216)) ([b3aac34](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/b3aac340cb05138b97aede6f11164d857cbff6ed))

### Documentation

- Add reusable typedoc configs package ([#222](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/222)) ([8af0a66](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/8af0a6657906f09cc29136abd751065f18ba9510))
- **ddc-client:** Update README with documentation of added APIs ([#220](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/220)) ([d01972c](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/d01972c0cb56e6e9709e7f6cbf91789a2ea7a0f0))
- **ddc:** Update ddc package documentation ([#221](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/221)) ([1d9ade3](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/1d9ade363f29a11f63a7b960c6dbf16271085292))

## [2.0.1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0...v2.0.1) (2024-01-12)

### Bug Fixes

- **ddc:** Add support for retries to file store operations ([#214](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/214)) ([48968d1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/48968d1a4e6192e4117f3552f5b81519ade0d1d0))

## [2.0.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.29...v2.0.0) (2024-01-10)

DDC SDK was re-worked from the ground. Several packages were removed, some re-written and new packages added to the tool set.

### New packages

- [@cere-ddc-sdk/blockchain](packages/blockchain/README.md) - Work directly with the Cere blockchain
- [@cere-ddc-sdk/ddc](packages/ddc/README.md) - Low level package to directly communicate with DDC nodes

### Updated packages

- [@cere-ddc-sdk/ddc-client](packages/ddc-client/README.md) - The main DDC SDK interface with all methods for working with DDC
- [@cere-ddc-sdk/file-storage](packages/file-storage/README.md) - Upload large files, using chunk streaming

### Removed packages

- `@cere-ddc-sdk/content-addressable-storage`
- `@cere-ddc-sdk/core`
- `@cere-ddc-sdk/key-value-storage`
- `@cere-ddc-sdk/proto`
- `@cere-ddc-sdk/smart-contract`

## [2.0.0-rc.29](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.28...v2.0.0-rc.29) (2024-01-10)

### Features

- **ddc:** Fallback to other nodes in case of connection errors ([#211](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/211)) ([a403d2a](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/a403d2ac051e5d2fbf1782a0d76ca863a82d4ffc))

## [2.0.0-rc.28](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.27...v2.0.0-rc.28) (2024-01-09)

### Features

- **blockchain:** Get current block number ([#209](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/209)) ([836a394](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/836a3944c8f314b0cbbc92ad4143f6aa60bec3b0))

## [2.0.0-rc.27](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.26...v2.0.0-rc.27) (2024-01-09)

### Features

- **ddc:** Add DAG Node content hash validation ([#206](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/206)) ([152f257](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/152f257d31c34dad3f721a1820f7f9d554458df2))
- **ddc:** Add piece content hash validation ([#205](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/205)) ([a8bea81](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/a8bea8199862c7167c36ec7f1f8f652db1f92465))

### Bug Fixes

- **ddc:** Fix sending several excessive messages to already closing upload stream ([#204](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/204)) ([b43dac8](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/b43dac86e77902ebf8bf3eca22fb4b6e51098696))
- **ddc:** Use proper activity request type for file read operation ([#210](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/210)) ([e651382](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/e651382664e978bf47aeaea3ba7901e2968046ee))

## [2.0.0-rc.26](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.25...v2.0.0-rc.26) (2024-01-03)

### Bug Fixes

- **ddc:** Properly handle file access errors ([#202](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/202)) ([1224424](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/1224424c8eeadcab63592e195d16ff62620781b7))

### Miscellaneous Chores

- Switch to latest devnet blockchain in tests and playground ([#203](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/203)) ([8cac165](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/8cac165cf39655f91d55df616ba1078cacbd1741))

## [2.0.0-rc.25](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.24...v2.0.0-rc.25) (2023-12-28)

### Miscellaneous Chores

- Update SDK packages dependencies ([#200](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/200)) ([cade763](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/cade763467a247f621e798b158fdd2fbce86217f))

## [2.0.0-rc.24](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.23...v2.0.0-rc.24) (2023-12-28)

### Features

- **blockchain:** Add support for new node props - `domain` and `ssl` ([#198](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/198)) ([8c32e81](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/8c32e81dc115f8ea1fc5348e864805467482d3ec))
- **ddc:** Add token authentication to all DDC operations ([#197](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/197)) ([2cae1bd](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/2cae1bd779a98966fb2dcdc009f43bc41fffa8dd))
- **ddc:** Update TESTNET preset to use on-chain network topology ([#199](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/199)) ([0793310](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/079331035769ffbc4ea72959bb74767ffc622c37))

## [2.0.0-rc.23](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.21...v2.0.0-rc.23) (2023-12-21)

### ⚠ BREAKING CHANGES

- Add storage node mode and `isPublic` bucket property (#193)

### Features

- Add storage node mode and `isPublic` bucket property ([#193](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/193)) ([ebac903](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/ebac90385eba994371a0da93ca55de9bb772c2c8))
- Select node for operation based on nodes mode priority ([#195](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/195)) ([5f3e688](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/5f3e688b2bd9208027d0f41fefd3dbbd1d1856bb))

### Miscellaneous Chores

- Setup convectional commits and auto-generation of changelogs ([#196](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/196)) ([e4f819e](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/e4f819e4fc0d4eda7e27bf94bc55119728091129))
- Update node list in TESTNET preset ([#194](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/194)) ([d4b5015](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/d4b5015161955c373a6aaa3a6770ea592ded2e9b))
