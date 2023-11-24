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
