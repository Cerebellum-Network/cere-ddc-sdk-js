[@cere-ddc-sdk/ddc](../README.md) / DagNode

# Class: DagNode

The `DagNode` class represents a node in a Directed Acyclic Graph (DAG).

**`Example`**

```typescript
const data = 'Node data';
const links = [new Link('...', 10, 'link1')];
const tags = [new Tag('exampleKey', 'exampleValue')];
const node = new DagNode(data, links, tags);

console.log(DagNode.isDagNode(node)); // true
```

## Hierarchy

- **`DagNode`**

  ↳ [`DagNodeResponse`](DagNodeResponse.md)

## Methods

### isDagNode

▸ **isDagNode**(`object`): object is DagNode

Checks if an object is an instance of `DagNode`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `object` | `unknown` | The object to check. |

#### Returns

object is DagNode

`true` if the object is an instance of `DagNode` or has the same properties as a `DagNode`, `false` otherwise.
