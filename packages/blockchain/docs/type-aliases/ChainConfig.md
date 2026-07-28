[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / ChainConfig

# Type Alias: ChainConfig

> **ChainConfig** = `CereNetwork` \| `string` \| `CereClient`

A network name (`'mainnet' | 'testnet' | 'devnet'`), a WS URL, or a
pre-connected/injected `CereClient`. `CereNetwork` is folded into `string`
here (rather than `CereNetwork | (string & {})`) to keep `@typescript-eslint/ban-types`
happy; the network name is still validated at runtime.
