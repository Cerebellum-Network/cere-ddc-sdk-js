# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.13.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.12.8...v2.13.0) (2024-10-07)

### Features

- Extend node operation errors with correlation ID and node URL ([#271](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/271)) ([049cb80](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/049cb8058be4db7e11d5d07863f5139bc806e72a))

## [2.12.8](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.12.7...v2.12.8) (2024-10-02)

### Bug Fixes

- **ddc:** Throw RpcError if the upload stream closed by the node ([#270](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/270)) ([b6ccce1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/b6ccce13759e8dcfa65b044ebf9a91d654380cb7))

## [2.12.7](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.12.6...v2.12.7) (2024-09-27)

### Bug Fixes

- **ddc:** Auth token sign method waits the signer to become ready ([#269](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/269)) ([49818a3](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/49818a3a5c4d06f9487d897c7bddc6cc670a0154))

## [2.12.6](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.12.5...v2.12.6) (2024-09-13)

### Bug Fixes

- **cli:** Make it possible to create public buckets using CLI ([#267](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/267)) ([0025c9a](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/0025c9aa3bb8fb2957aa3dc8bdc414769161c397))

### Miscellaneous Chores

- **tests:** Increase nodes startup time threshold in tests ([#266](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/266)) ([03fd451](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/03fd451cb80624f43b7feaf4e38e7f32e54ba019))

## [2.12.5](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.12.4...v2.12.5) (2024-09-11)

### Bug Fixes

- **cli:** Add Cere Wallet backup file support in token generation command ([#265](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/265)) ([2944a3c](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/2944a3c141f7196a9018b7a64528194b30af3ab8))

## [2.12.4](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.12.3...v2.12.4) (2024-08-07)

### Bug Fixes

- Properly get bucketId from BucketCreated event ([#264](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/264)) ([2581320](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/2581320aa964073d994823f1877c8406d02c116d))

## [2.12.3](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.12.2...v2.12.3) (2024-08-01)

### Bug Fixes

- Update SDK token if signer address changed ([#262](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/262)) ([c1a9f30](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/c1a9f30d63e2222f0656d028adf26a4b04b65d4f))

## [2.12.2](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.12.1...v2.12.2) (2024-07-30)

### Bug Fixes

- Make sure Cere Wallet address always stays in sync ([#261](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/261)) ([db86415](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/db86415cd7494778a967ecdeccc1f2b474e297bf))

## [2.12.1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.12.0...v2.12.1) (2024-07-29)

### Bug Fixes

- Cere Wallet signer not triggering 3rd party extensions consent ([#259](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/259)) ([f67e344](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/f67e344a8732fae2b19af557924440f20dcdeac0))

## [2.12.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.11.1...v2.12.0) (2024-07-26)

### Features

- Add CNS Record cache control option ([#260](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/260)) ([4100540](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/4100540b07926679d764c05ff239bc93e0b1acc0))

## [2.11.1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.11.0...v2.11.1) (2024-07-10)

### Bug Fixes

- **ddc:** Update correlation id gRPC meta key ([#258](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/258)) ([f33de8c](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/f33de8c3049938c5162782bd8f2397ae26040b19))

## [2.11.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.10.0...v2.11.0) (2024-07-05)

### Features

- Add support for correlationId to group several requests ([#254](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/254)) ([3c264a0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/3c264a0ecb652803bcd67974646f82b99f03d70c))

### Bug Fixes

- **ddc:** Do not sign an access token if already signed properly ([#255](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/255)) ([8f275de](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/8f275de9810c81be8545987995188fd536734a83))

### Miscellaneous Chores

- Use a dedicated account in blockchain tests to resolve flaky tests ([#256](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/256)) ([db3383b](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/db3383b2a76c1f6dd8aba20b92a39d70720e8600))

## [2.10.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.9.2...v2.10.0) (2024-06-18)

### Features

- **blockchain:** Add support for new Cluster Governance blockchain API ([#251](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/251)) ([9c15746](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/9c1574602e1eea37f8d49cc08188888bb752f327))
- Improve re-try logic with exponential backoff strategy ([#252](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/252)) ([cd5d373](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/cd5d373359dbe571bce7702695ba5d45e85127e8))

## [2.9.2](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.9.1...v2.9.2) (2024-06-05)

### Miscellaneous Chores

- **blockchain:** Cere Wallet SDK dependency update ([bf14eba](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/bf14eba38e4176f39a8cfde3b1704f643b2d82be))

## [2.9.1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.9.0...v2.9.1) (2024-05-16)

### Bug Fixes

- **ddc:** Add activity request to putMultipartPiece meta ([#250](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/250)) ([cb32385](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/cb323855ceb4872b71cf79cc13123f46d2b9bd9b))

## [2.9.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.8.0...v2.9.0) (2024-05-15)

### Features

- Add support of signers created from a JSON backup file ([#248](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/248)) ([984ffb7](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/984ffb70ffa4aac8e576e5a8cc9c1f5daaed46d3))

### Documentation

- Update blockchain signers documentation ([#249](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/249)) ([e51b49a](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/e51b49a66371550af71022a54d40708162f19f8e))

## [2.8.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.7.0...v2.8.0) (2024-05-14)

### Features

- **blockchain:** Add support for new cluster properties ([#247](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/247)) ([59908fb](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/59908fbfdc8899eb1faa7cc0fd2d2860226ea844))

## [2.7.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.7.0-rc.2...v2.7.0) (2024-05-06)

### Features

- Add async acknowledgements support ([#245](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/245)) ([cb41f3d](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/cb41f3d40a50135abad2ef567fb5aad5d08124b1))

## [2.7.0-rc.2](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.7.0-rc.1...v2.7.0-rc.2) (2024-04-17)

### Features

- **cli:** Add CLI option to override default blockchain RPC URL ([#244](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/244)) ([1a8f9fd](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/1a8f9fd95e7a5805d4499d299a2214027b741b3c))

## [2.7.0-rc.1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.6.1...v2.7.0-rc.1) (2024-04-15)

### Features

- **cli:** Allow configuring DDC nodes list in CLI config ([#243](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/243)) ([f4295d1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/f4295d1f91e7cec37217604c9334dfeabb2d2e27))

## [2.7.0-rc.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.6.1...v2.7.0-rc.0) (2024-04-15)

### Features

- **cli:** Allow configuring DDC nodes list in CLI config ([#243](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/243)) ([f4295d1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/f4295d1f91e7cec37217604c9334dfeabb2d2e27))

## [2.6.1](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.6.0...v2.6.1) (2024-04-03)

### Bug Fixes

- **ddc-client:** Fix `retries` option is not applied to all operations ([#242](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/242)) ([eafd596](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/eafd5966aae74f7529d378cea6ccbe692725d6ec))

## [2.6.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.5.0...v2.6.0) (2024-04-02)

### Features

- **cli:** Add auth token management command ([#240](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/240)) ([3fd725a](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/3fd725ae148e58d862056cea8cfafe4c87fef59e))
- **ddc-client:** Add retries number configuration option ([#241](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/241)) ([92501fd](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/92501fdff1b95e2d9bf27c84fc266ebdad31aec8))
- **ddc:** Use internal SDK signers to reduce signature requests to web3 wallets ([#237](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/237)) ([f0255a3](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/f0255a3b8de678ff004898e6c547926c8b193bc3))
- Re-try piece store operation from buffered content ([#239](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/239)) ([c39dab8](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/c39dab80da108286c8ad40bfab7c458011c6d6cb))

### Bug Fixes

- **ddc:** Add gRPC request timeout to fallback from frozen nodes ([#223](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/223)) ([b58f36b](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/b58f36b578ca170f624373b0f9ee56c9b415da62))
- **playground:** Fix Playground DagNode data overflow ([#238](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/238)) ([592414f](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/592414f265f79b22bfa6930e830701ee5561a32d))

## [2.5.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.4.0...v2.5.0) (2024-02-28)

### Features

- **cli:** Add commands to download files and directories ([#236](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/236)) ([9634790](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/96347901c0c2d0a15c5a236a1625ab655858bdb1))

## [2.4.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.3.0...v2.4.0) (2024-02-27)

### Features

- **cli:** Introduce DDC command line interface ([#234](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/234)) ([ff948dd](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/ff948ddb4a18f705829ecc09b917caab240a4fd5))

## [2.3.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.2.0...v2.3.0) (2024-02-21)

### Features

- Add Cere Wallet support ([#228](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/228)) ([3cdb22e](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/3cdb22e6caf0bd1ad61c55776515c9242227cd46))
- **blockchain:** Add support for PolkadotJs compatible browser extensions ([#227](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/227)) ([94e5083](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/94e508375a9a34290b825a27a4a2de6bd3f898f5))
- **blockchain:** Update Cere Wallet SDK to allow auto-signing messages during DDC operations ([#231](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/231)) ([78691d6](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/78691d623973d0c4dcd779d4c588a02268bd5313))
- **ddc:** Add activity request header to CNS and DAG API ([#232](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/232)) ([7321a0d](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/7321a0d106487f1c94e75de77dadcdd991038b8c))

### Documentation

- **blockchain:** Add blockchain package documentation ([#229](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/229)) ([080ae5f](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/080ae5f050bf162e33ce2c339fe9dac38b7da58b))
- DDC SDK examples directory ([#233](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/233)) ([6ea4564](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/6ea4564b95166ad4d9e533a209b44a51ea5fcabf))
- Update source code and README documentation for `file-storage` package ([#226](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/226)) ([f3ff248](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/f3ff248268acfdde90544d81a5c39214a62a322b))

### Miscellaneous Chores

- **blockchain:** Update all blockchain package dependencies to the latest versions ([#219](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/219)) ([65dbf8b](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/65dbf8b3da2c28c28c0ddc6f4688340931d3987e))

## [2.2.0](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.1.1...v2.2.0) (2024-02-02)

### Features

- **blockchain:** Add change bucket parameters method ([93c47eb](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/93c47eb9fdb30718e923e594a27e0441ce3cb7f8))

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
