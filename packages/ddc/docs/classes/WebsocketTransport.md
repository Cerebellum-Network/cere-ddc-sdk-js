[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / WebsocketTransport

# Class: WebsocketTransport

The `WebsocketTransport` class represents a gRPC transport layer for RPC communication over WebSockets.

## Implements

- `RpcTransport`

## Methods

### clientStreaming()

> **clientStreaming**\<`I`, `O`\>(`method`, `options`): `ClientStreamingCall`\<`I`, `O`\>

Execute a client streaming RPC.

#### Type Parameters

##### I

`I` *extends* `object`

##### O

`O` *extends* `object`

#### Parameters

##### method

`MethodInfo`\<`I`, `O`\>

##### options

`RpcOptions`

#### Returns

`ClientStreamingCall`\<`I`, `O`\>

#### Implementation of

`RpcTransport.clientStreaming`

***

### duplex()

> **duplex**\<`I`, `O`\>(`method`, `options`): `DuplexStreamingCall`\<`I`, `O`\>

Execute a duplex streaming RPC.

#### Type Parameters

##### I

`I` *extends* `object`

##### O

`O` *extends* `object`

#### Parameters

##### method

`MethodInfo`\<`I`, `O`\>

##### options

`RpcOptions`

#### Returns

`DuplexStreamingCall`\<`I`, `O`\>

#### Implementation of

`RpcTransport.duplex`

***

### mergeOptions()

> **mergeOptions**(`options?`): `RpcOptions`

Merge call options with default options.
Generated service clients will call this method with the users'
call options and pass the result to the execute-method below.

#### Parameters

##### options?

`Partial`\<`RpcOptions`\>

#### Returns

`RpcOptions`

#### Implementation of

`RpcTransport.mergeOptions`

***

### serverStreaming()

> **serverStreaming**\<`I`, `O`\>(): `ServerStreamingCall`\<`I`, `O`\>

Execute a server streaming RPC.

#### Type Parameters

##### I

`I` *extends* `object`

##### O

`O` *extends* `object`

#### Returns

`ServerStreamingCall`\<`I`, `O`\>

#### Implementation of

`RpcTransport.serverStreaming`

***

### unary()

> **unary**\<`I`, `O`\>(`method`, `input`, `options`): `UnaryCall`\<`I`, `O`\>

Execute an unary RPC.

#### Type Parameters

##### I

`I` *extends* `object`

##### O

`O` *extends* `object`

#### Parameters

##### method

`MethodInfo`\<`I`, `O`\>

##### input

`I`

##### options

`RpcOptions`

#### Returns

`UnaryCall`\<`I`, `O`\>

#### Implementation of

`RpcTransport.unary`
