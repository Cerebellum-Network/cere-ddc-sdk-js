[@cere-ddc-sdk/ddc](../README.md) / [Exports](../modules.md) / Link

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

## Implements

- `Omit`\<`dag.Link`, ``"cid"``\>
