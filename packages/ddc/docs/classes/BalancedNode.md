[@cere-ddc-sdk/ddc](../README.md) / [Exports](../modules.md) / BalancedNode

# Class: BalancedNode

The `BalancedNode` class implements the `NodeInterface` and provides methods for interacting with storage nodes.

A balanced node is a node that distributes operations across multiple underlying nodes to balance the load.

**`Example`**

```typescript
const router = new Router(...);
const balancedNode = new BalancedNode({ router });
```

## Implements

- [`NodeInterface`](../interfaces/NodeInterface.md)
