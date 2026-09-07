[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / resolveClient

# Function: resolveClient()

> **resolveClient**(`config`): `ResolvedClient`

Resolves a `ChainConfig` into a `CereClient` + an `ownsClient` flag.

A pre-built `CereClient` is passed through as-is with `ownsClient: false`
(the caller owns its lifecycle). A network name or WS URL is connected via
`connect()` with `ownsClient: true` (the resolver's caller owns the
resulting client and is responsible for disconnecting it).

Shared by `DdcClient` and `FileStorage`, which both accept the same
`network | wsUrl | CereClient` shape for their `blockchain` config.

## Parameters

### config

[`ChainConfig`](../type-aliases/ChainConfig.md)

## Returns

`ResolvedClient`
