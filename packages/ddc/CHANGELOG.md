# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.9.1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.9.0...v2.9.1) (2024-05-16)

### Bug Fixes

- **ddc:** Add activity request to putMultipartPiece meta ([#250](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/250)) ([cb32385](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/cb323855ceb4872b71cf79cc13123f46d2b9bd9b))

## [2.9.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.8.0...v2.9.0) (2024-05-15)

### Features

- Add support of signers created from a JSON backup file ([#248](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/248)) ([984ffb7](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/984ffb70ffa4aac8e576e5a8cc9c1f5daaed46d3))

### Documentation

- Update blockchain signers documentation ([#249](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/249)) ([e51b49a](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/e51b49a66371550af71022a54d40708162f19f8e))

## [2.8.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.7.0...v2.8.0) (2024-05-14)

**Note:** Version bump only for package @cere-ddc-sdk/ddc

## [2.7.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.7.0-rc.2...v2.7.0) (2024-05-06)

### Features

- Add async acknowledgements support ([#245](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/245)) ([cb41f3d](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/cb41f3d40a50135abad2ef567fb5aad5d08124b1))

## [2.7.0-rc.2](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.7.0-rc.1...v2.7.0-rc.2) (2024-04-17)

**Note:** Version bump only for package @cere-ddc-sdk/ddc

## [2.7.0-rc.1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.6.1...v2.7.0-rc.1) (2024-04-15)

**Note:** Version bump only for package @cere-ddc-sdk/ddc

## [2.7.0-rc.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.6.1...v2.7.0-rc.0) (2024-04-15)

**Note:** Version bump only for package @cere-ddc-sdk/ddc

## [2.6.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.5.0...v2.6.0) (2024-04-02)

### Features

- **cli:** Add auth token management command ([#240](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/240)) ([3fd725a](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/3fd725ae148e58d862056cea8cfafe4c87fef59e))
- **ddc-client:** Add retries number configuration option ([#241](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/241)) ([92501fd](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/92501fdff1b95e2d9bf27c84fc266ebdad31aec8))
- **ddc:** Use internal SDK signers to reduce signature requests to web3 wallets ([#237](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/237)) ([f0255a3](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/f0255a3b8de678ff004898e6c547926c8b193bc3))
- Re-try piece store operation from buffered content ([#239](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/239)) ([c39dab8](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/c39dab80da108286c8ad40bfab7c458011c6d6cb))

### Bug Fixes

- **ddc:** Add gRPC request timeout to fallback from frozen nodes ([#223](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/223)) ([b58f36b](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/b58f36b578ca170f624373b0f9ee56c9b415da62))

## [2.5.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.4.0...v2.5.0) (2024-02-28)

### Features

- **cli:** Add commands to download files and directories ([#236](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/236)) ([9634790](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/96347901c0c2d0a15c5a236a1625ab655858bdb1))

## [2.3.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.2.0...v2.3.0) (2024-02-21)

### Features

- **blockchain:** Add support for PolkadotJs compatible browser extensions ([#227](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/227)) ([94e5083](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/94e508375a9a34290b825a27a4a2de6bd3f898f5))
- **ddc:** Add activity request header to CNS and DAG API ([#232](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/232)) ([7321a0d](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/7321a0d106487f1c94e75de77dadcdd991038b8c))

### Documentation

- **blockchain:** Add blockchain package documentation ([#229](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/229)) ([080ae5f](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/080ae5f050bf162e33ce2c339fe9dac38b7da58b))
- DDC SDK examples directory ([#233](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/233)) ([6ea4564](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/6ea4564b95166ad4d9e533a209b44a51ea5fcabf))
- Update source code and README documentation for `file-storage` package ([#226](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/226)) ([f3ff248](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/f3ff248268acfdde90544d81a5c39214a62a322b))

## [2.2.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.1.1...v2.2.0) (2024-02-02)

**Note:** Version bump only for package @cere-ddc-sdk/ddc

## [2.1.1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.1.0...v2.1.1) (2024-01-31)

### Bug Fixes

- **ddc:** Use proper MAINNET preset blockchain endpoint ([#224](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/224)) ([d8a2f22](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/d8a2f22aab4f0907bc05e6fe772656abbbd76ba1))

## [2.1.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.1...v2.1.0) (2024-01-30)

### Features

- **ddc:** Add network latency based routing to select closest nodes to the client ([#218](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/218)) ([6ddc828](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/6ddc8284b03b397bd4f7ae7c16a9f1235585946c))
- Extend auth token API with methods to delegate access ([#215](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/215)) ([1da5e38](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/1da5e387369645893ff512bc1a00d78ad2dbd6bd))

### Bug Fixes

- **ddc:** Properly handle grpc headers error in WebSocket transport ([#216](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/216)) ([b3aac34](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/b3aac340cb05138b97aede6f11164d857cbff6ed))

### Documentation

- Add reusable typedoc configs package ([#222](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/222)) ([8af0a66](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/8af0a6657906f09cc29136abd751065f18ba9510))
- **ddc:** Update ddc package documentation ([#221](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/221)) ([1d9ade3](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/1d9ade363f29a11f63a7b960c6dbf16271085292))

## [2.0.1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0...v2.0.1) (2024-01-12)

### Bug Fixes

- **ddc:** Add support for retries to file store operations ([#214](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/214)) ([48968d1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/48968d1a4e6192e4117f3552f5b81519ade0d1d0))

## [2.0.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.29...v2.0.0) (2024-01-10)

**Note:** Version bump only for package @cere-ddc-sdk/ddc

## [2.0.0-rc.29](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.28...v2.0.0-rc.29) (2024-01-10)

### Features

- **ddc:** Fallback to other nodes in case of connection errors ([#211](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/211)) ([a403d2a](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/a403d2ac051e5d2fbf1782a0d76ca863a82d4ffc))

## [2.0.0-rc.28](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.27...v2.0.0-rc.28) (2024-01-09)

**Note:** Version bump only for package @cere-ddc-sdk/ddc

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

### Features

- Select node for operation based on nodes mode priority ([#195](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/195)) ([5f3e688](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/5f3e688b2bd9208027d0f41fefd3dbbd1d1856bb))

### Miscellaneous Chores

- Update node list in TESTNET preset ([#194](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/194)) ([d4b5015](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/d4b5015161955c373a6aaa3a6770ea592ded2e9b))
