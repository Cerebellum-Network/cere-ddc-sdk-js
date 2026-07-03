[@cere-ddc-sdk/ddc-client](../README.md) / DagNodeResponse

# Class: DagNodeResponse

The `DagNodeResponse` class represents a response for a DAG Node.

## Hierarchy

- [`DagNode`](DagNode.md)

  ↳ **`DagNodeResponse`**

## Properties

### links

• **links**: [`Link`](Link.md)[]

The links of the node.

#### Inherited from

[DagNode](DagNode.md).[links](DagNode.md#links)

___

### tags

• **tags**: [`Tag`](Tag.md)[]

The tags of the node.

#### Inherited from

[DagNode](DagNode.md).[tags](DagNode.md#tags)

## Accessors

### cid

• `get` **cid**(): `string`

The content identifier of the response as a string.

#### Returns

`string`

___

### data

• `get` **data**(): `Buffer`

The data of the node as a `Buffer`.

#### Returns

`Buffer`

#### Inherited from

DagNode.data

___

### size

• `get` **size**(): `number`

The size of the node in bytes.

#### Returns

`number`

#### Inherited from

DagNode.size

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

#### Inherited from

[DagNode](DagNode.md).[isDagNode](DagNode.md#isdagnode)
