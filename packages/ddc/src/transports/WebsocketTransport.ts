import {
    ClientStreamingCall,
    DuplexStreamingCall,
    MethodInfo,
    RpcOptions,
    RpcTransport,
    ServerStreamingCall,
    UnaryCall,
} from '@protobuf-ts/runtime-rpc';

export class WebsocketTransport implements RpcTransport {
    clientStreaming<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        options: RpcOptions,
    ): ClientStreamingCall<I, O> {
        throw new Error('Not implemented');
    }

    duplex<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        options: RpcOptions,
    ): DuplexStreamingCall<I, O> {
        throw new Error('Not implemented');
    }

    mergeOptions(options?: Partial<RpcOptions> | undefined): RpcOptions {
        throw new Error('Not implemented');
    }

    serverStreaming<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        input: I,
        options: RpcOptions,
    ): ServerStreamingCall<I, O> {
        throw new Error('Not implemented');
    }

    unary<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        input: I,
        options: RpcOptions,
    ): UnaryCall<I, O> {
        throw new Error('Not implemented');
    }
}
