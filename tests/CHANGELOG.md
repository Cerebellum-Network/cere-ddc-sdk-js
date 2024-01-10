# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.0-rc.29](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.28...v2.0.0-rc.29) (2024-01-10)

### Features

- **ddc:** Fallback to other nodes in case of connection errors ([#211](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/211)) ([a403d2a](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/a403d2ac051e5d2fbf1782a0d76ca863a82d4ffc))

## [2.0.0-rc.28](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.27...v2.0.0-rc.28) (2024-01-09)

### Features

- **blockchain:** Get current block number ([#209](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/209)) ([836a394](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/836a3944c8f314b0cbbc92ad4143f6aa60bec3b0))

## [2.0.0-rc.27](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.26...v2.0.0-rc.27) (2024-01-09)

### Features

- **ddc:** Add DAG Node content hash validation ([#206](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/206)) ([152f257](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/152f257d31c34dad3f721a1820f7f9d554458df2))

### Bug Fixes

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

## [2.0.0-rc.23](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.21...v2.0.0-rc.23) (2023-12-21)

### ⚠ BREAKING CHANGES

- Add storage node mode and `isPublic` bucket property (#193)

### Features

- Add storage node mode and `isPublic` bucket property ([#193](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/193)) ([ebac903](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/ebac90385eba994371a0da93ca55de9bb772c2c8))
- Select node for operation based on nodes mode priority ([#195](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/195)) ([5f3e688](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/5f3e688b2bd9208027d0f41fefd3dbbd1d1856bb))
