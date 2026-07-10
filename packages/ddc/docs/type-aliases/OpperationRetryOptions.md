[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / OpperationRetryOptions

# Type Alias: OpperationRetryOptions

> **OpperationRetryOptions** = `Omit`\<`RetryOptions`, `"retries"`\> & `object`

The timeouts bettween retries are exponential, starting at `minTimeout` and increasing each time until `maxTimeout`.

The formuka for the timeout between retries is:

```typescript
const timeout = Math.min(random * minTimeout * Math.pow(factor, attempt), maxTimeout);
```

## Type Declaration

### attempts?

> `optional` **attempts?**: `number`
