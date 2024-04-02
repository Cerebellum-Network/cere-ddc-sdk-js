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

## Accessors

### bucketId

• `get` **bucketId**(): `undefined` \| `bigint`

The bucket identifier that the token grants access to.

#### Returns

`undefined` \| `bigint`

___

### canDelegate

• `get` **canDelegate**(): `boolean`

Whether the token can delegate access.

#### Returns

`boolean`

___

### expiresAt

• `get` **expiresAt**(): `number`

The expiration time of the token.

#### Returns

`number`

___

### operations

• `get` **operations**(): `Operation`[]

The operations that the token grants access to.

#### Returns

`Operation`[]

___

### pieceCid

• `get` **pieceCid**(): `undefined` \| `string`

The piece CID that the token grants access to.

#### Returns

`undefined` \| `string`

___

### signature

• `get` **signature**(): `undefined` \| `Signature`

The signature of the token

#### Returns

`undefined` \| `Signature`

## Methods

### sign

▸ **sign**(`signer`): `Promise`\<[`AuthToken`](AuthToken.md)\>

Signs the authentication token using the provided signer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signer` | [`Signer`](Signer.md) | The instance of Signer to use for signing the token. |

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

___

### maybeToken

▸ **maybeToken**(`token?`): `undefined` \| [`AuthToken`](AuthToken.md)

This static method is used to convert a token into an AuthToken object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token?` | `string` \| [`AuthToken`](AuthToken.md) | The input token, which can be either a string or an AuthToken object. |

#### Returns

`undefined` \| [`AuthToken`](AuthToken.md)

- If the input token is a string, returns an AuthToken object created from the string.
           If the input token is already an AuthToken object, returns the input token as is.

**`Example`**

```typescript
const token: string = '...';
const authToken = AuthToken.maybeToken(token);

console.log(authToken);
```
