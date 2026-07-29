[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / createResolverNode

# Function: createResolverNode()

> **createResolverNode**(`__namedParameters`): [`BalancedNode`](../classes/BalancedNode.md)

Builds a `BalancedNode` backed by a single-cluster `EndpointResolver` for the given
`storageUrl`/`cdnUrl`.

`DdcClient` and `FileStorage` wire the resolver up identically, so this is shared
between the two rather than duplicated.

## Parameters

### \_\_namedParameters

`ResolverNodeConfig`

## Returns

[`BalancedNode`](../classes/BalancedNode.md)
