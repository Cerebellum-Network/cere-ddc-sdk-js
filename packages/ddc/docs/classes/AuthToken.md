[@cere-ddc-sdk/ddc](../README.md) / AuthToken

# Class: AuthToken

The `AuthToken` class represents an authentication token.

**`Example`**

```typescript
const authToken = new AuthToken({
  bucketId: 1n,
  operations: [AuthTokenOperation.GET],
});

await authToken.sign(signer);

const sharebleToken = authToken.toString();
console.log(sharebleToken);

const authTokenFromSharebleToken = AuthToken.from(sharebleToken);
console.log(authTokenFromSharebleToken);
```

## Methods

### sign

▸ **sign**(`signer`): `Promise`\<[`AuthToken`](AuthToken.md)\>

Signs the authentication token using the provided signer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | `Signer` | The instance of Signer to use for signing the token. |

#### Returns

`Promise`\<[`AuthToken`](AuthToken.md)\>

**`Example`**

```typescript
const signer: Signer = ...;
const authToken = new AuthToken(...);

await authToken.sign(signer);
```

___

### toString

▸ **toString**(): `string`

Converts the authentication token to a string.

#### Returns

`string`

The authentication token as a base58-encoded string.

___

### from

▸ **from**(`token`): [`AuthToken`](AuthToken.md)

Creates an `AuthToken` from a string or another `AuthToken`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `string` \| [`AuthToken`](AuthToken.md) | The token as a string or an `AuthToken`. |

#### Returns

[`AuthToken`](AuthToken.md)

An instance of the `AuthToken` class.

**`Throws`**

Will throw an error if the token is invalid.

**`Example`**

```typescript
const token: string = '...';
const authToken = AuthToken.from(token);

console.log(authToken);
```

___

### fullAccess

▸ **fullAccess**(`params?`): [`AuthToken`](AuthToken.md)

Creates an `AuthToken` with full access (GET, PUT, DELETE operations).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Omit`\<`AuthTokenParams`, ``"operations"``\> | The parameters of the token access. |

#### Returns

[`AuthToken`](AuthToken.md)

An instance of the `AuthToken` class with full access.

**`Example`**

```typescript
const authToken = AuthToken.fullAccess({
  bucketId: 1n,
});
```
