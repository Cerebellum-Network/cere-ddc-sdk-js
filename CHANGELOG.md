# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.0-rc.23](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/compare/v2.0.0-rc.21...v2.0.0-rc.23) (2023-12-20)

### ⚠ BREAKING CHANGES

- Add storage node mode and `isPublic` bucket property (#193)

### Features

- Add storage node mode and `isPublic` bucket property ([#193](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/193)) ([ebac903](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/ebac90385eba994371a0da93ca55de9bb772c2c8))
- Select node for operation based on nodes mode priority ([#195](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/issues/195)) ([47a30af](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/commit/47a30afa5b6dd166c2f4a6a8896c6c8aa48c8973))

## Changelog

## Release Notes:

### v2.0.0

> The SDK has been overhauled from scratch in this major release.

**Braking changes**:

- `@cere-ddc-sdk/content-addressable-storage` has been removed
- `@cere-ddc-sdk/core` has been removed
- `@cere-ddc-sdk/key-value-storage` has been removed
- `@cere-ddc-sdk/proto` has been removed
- `@cere-ddc-sdk/smart-contract` has been removed
- `@cere-ddc-sdk/ddc-client` package API has been changed ([README](packages/ddc-client/README.md))
- `@cere-ddc-sdk/file-storage` package API has been changed ([README](packages/file-storage/README.md))

### v1.7.5

- Add bucket availability method to Smart Contract module
- Get $CERE decimals value from blockchain properties instead of hardcoded value
- Fix RPC error handling in Smart Contract module
- Update build and publish to use Lerna.js
- Expanded Cluster Parameters
- Upgrade Smart Contract to `v1.0.1`
- Refactor Smart Contract module to include missing methods
- Cover Smart Contract API with tests

### v1.7.4

- Update Smart Contract addresses for all environments
- Minor changes for browser version of the SDK
- Update `@polkadot/api` and related packages to `v9.4.1`
