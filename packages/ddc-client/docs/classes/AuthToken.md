[**@cere-ddc-sdk/ddc-client**](../README.md)

***

[@cere-ddc-sdk/ddc-client](../README.md) / AuthToken

# Class: AuthToken

The `AuthToken` class represents an authentication token.

## Example

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

#### Get Signature

> **get** **bucketId**(): `bigint` \| `undefined`

The bucket identifier that the token grants access to.

##### Returns

`bigint` \| `undefined`

***

### canDelegate

#### Get Signature

> **get** **canDelegate**(): `boolean`

Whether the token can delegate access.

##### Returns

`boolean`

***

### expiresAt

#### Get Signature

> **get** **expiresAt**(): `number`

The expiration time of the token.

##### Returns

`number`

***

### isSigned

#### Get Signature

> **get** **isSigned**(): `boolean`

Whether the token is properly signed.

##### Returns

`boolean`

***

### operations

#### Get Signature

> **get** **operations**(): `Operation`[]

The operations that the token grants access to.

##### Returns

`Operation`[]

***

### pieceCid

#### Get Signature

> **get** **pieceCid**(): `string` \| `undefined`

The piece CID that the token grants access to.

##### Returns

`string` \| `undefined`

***

### signature

#### Get Signature

> **get** **signature**(): `Signature` \| `undefined`

The signature of the token

##### Returns

`Signature` \| `undefined`

## Methods

### sign()

> **sign**(`signer`): `Promise`\<`AuthToken`\>

Signs the authentication token using the provided signer.

#### Parameters

##### signer

[`Signer`](../interfaces/Signer.md)

The instance of Signer to use for signing the token.

#### Returns

`Promise`\<`AuthToken`\>

#### Example

```typescript
const signer: Signer = ...;
const authToken = new AuthToken(...);

await authToken.sign(signer);
```

***

### toString()

> **toString**(): `string`

Converts the authentication token to a string.

#### Returns

`string`

The authentication token as a base58-encoded string.

***

### from()

> `static` **from**(`token`): `AuthToken`

Creates an `AuthToken` from a string or another `AuthToken`.

#### Parameters

##### token

`string` \| `AuthToken`

The token as a string or an `AuthToken`.

#### Returns

`AuthToken`

An instance of the `AuthToken` class.

#### Throws

Will throw an error if the token is invalid.

#### Example

```typescript
const token: string = '...';
const authToken = AuthToken.from(token);

console.log(authToken);
```

***

### fullAccess()

> `static` **fullAccess**(`params?`): `AuthToken`

Creates an `AuthToken` with full access (GET, PUT, DELETE operations).

#### Parameters

##### params?

`Omit`\<`AuthTokenParams`, `"operations"`\>

The parameters of the token access.

#### Returns

`AuthToken`

An instance of the `AuthToken` class with full access.

#### Example

```typescript
const authToken = AuthToken.fullAccess({
  bucketId: 1n,
});
```

***

### maybeToken()

> `static` **maybeToken**(`token?`): `AuthToken` \| `undefined`

This static method is used to convert a token into an AuthToken object.

#### Parameters

##### token?

`string` \| `AuthToken`

The input token, which can be either a string or an AuthToken object.

#### Returns

`AuthToken` \| `undefined`

- If the input token is a string, returns an AuthToken object created from the string.
           If the input token is already an AuthToken object, returns the input token as is.

#### Example

```typescript
const token: string = '...';
const authToken = AuthToken.maybeToken(token);

console.log(authToken);
```
