[@cere-ddc-sdk/ddc-client](../README.md) / Link

# Class: Link

The `Link` class represents a link in a DAG.

**`Example`**

```typescript
const cid = '...';
const size = 10;
const name = 'example';
const link = new Link(cid, size, name);

console.log(link);
```

## Properties

### cid

• **cid**: `string`

The content identifier of the link.

___

### name

• **name**: `string`

The name of the link.

___

### size

• **size**: `number`

The content size on which the link points to.
