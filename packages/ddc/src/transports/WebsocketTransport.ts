import {grpc} from '@improbable-eng/grpc-web';
import {IMessageType} from '@protobuf-ts/runtime';

import {
    ClientStreamingCall,
    DuplexStreamingCall,
    MethodInfo,
    RpcOptions,
    RpcTransport,
    ServerStreamingCall,
    UnaryCall,
    mergeRpcOptions,
    Deferred,
    RpcMetadata,
    RpcStatus,
    RpcError,
    RpcInputStream,
} from '@protobuf-ts/runtime-rpc';

export class WebsocketTransport implements RpcTransport {
    private defaultOptions: RpcOptions = {};

    constructor(host: string) {}

    clientStreaming<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        options: RpcOptions,
    ): ClientStreamingCall<I, O> {
        const InputType = mapType(method.I);
        const defHeader = new Deferred<RpcMetadata>();
        const defMessage = new Deferred<O>();
        const defStatus = new Deferred<RpcStatus>();
        const defTrailer = new Deferred<RpcMetadata>();

        const client = grpc.client(
            {
                methodName: method.name,
                requestStream: true,
                responseStream: false,
                requestType: InputType,
                responseType: mapType(method.O),
                service: {
                    serviceName: method.service.typeName,
                },
            },
            {
                host: 'http://localhost:8071',
                transport: grpc.WebsocketTransport(),
            },
        );

        client.onHeaders((headers) => {
            defHeader.resolvePending(headers.headersMap);
        });

        client.onMessage((message) => {
            defMessage.resolvePending(message.toObject() as any);
        });

        client.onEnd((status, statusMessage, trailers) => {
            defStatus.resolvePending({
                code: grpc.Code[status],
                detail: statusMessage,
            });

            defTrailer.resolvePending(trailers.headersMap);

            if (status !== grpc.Code.OK) {
                const error = new RpcError(statusMessage, grpc.Code[status]);

                defHeader.rejectPending(error);
                defMessage.rejectPending(error);
                defStatus.rejectPending(error);
                defTrailer.rejectPending(error);
            }
        });

        client.start(new grpc.Metadata(options.meta));

        const inputStream: RpcInputStream<any> = {
            send: async (message) => client.send(new InputType(message)),
            complete: async () => client.finishSend(),
        };

        return new ClientStreamingCall<I, O>(
            method,
            options.meta ?? {},
            inputStream,
            defHeader.promise,
            defMessage.promise,
            defStatus.promise,
            defTrailer.promise,
        );
    }

    duplex<I extends object, O extends object>(
        method: MethodInfo<I, O>,
        options: RpcOptions,
    ): DuplexStreamingCall<I, O> {
        throw new Error('Not implemented');
    }

    mergeOptions(options?: Partial<RpcOptions>): RpcOptions {
        return mergeRpcOptions(this.defaultOptions, options);
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
        const InputType = mapType(method.I);
        const defHeader = new Deferred<RpcMetadata>();
        const defMessage = new Deferred<O>();
        const defStatus = new Deferred<RpcStatus>();
        const defTrailer = new Deferred<RpcMetadata>();

        const request = new Promise<grpc.UnaryOutput<grpc.ProtobufMessage>>((onEnd) =>
            grpc.unary(
                {
                    methodName: method.name,
                    requestStream: false,
                    responseStream: false,
                    requestType: InputType,
                    responseType: mapType(method.O),
                    service: {
                        serviceName: method.service.typeName,
                    },
                },
                {
                    host: 'http://localhost:8071',
                    transport: grpc.WebsocketTransport(),
                    metadata: new grpc.Metadata(options.meta),
                    request: new InputType(input),
                    onEnd,
                },
            ),
        );

        request
            .then((output) => {
                defHeader.resolvePending(output.headers.headersMap);
                defTrailer.resolvePending(output.headers.headersMap);
                defStatus.resolvePending({
                    code: grpc.Code[output.status],
                    detail: output.statusMessage,
                });

                if (output.status !== grpc.Code.OK) {
                    throw new RpcError(output.statusMessage, grpc.Code[output.status]);
                }

                if (output.message) {
                    defMessage.resolvePending(output.message.toObject() as any);
                }
            })
            .catch((error) => {
                error.methodName = method.name;
                error.serviceName = method.service.typeName;
                defHeader.rejectPending(error);
                defMessage.rejectPending(error);
                defStatus.rejectPending(error);
                defTrailer.rejectPending(error);
            });

        return new UnaryCall<I, O>(
            method,
            options.meta ?? {},
            input,
            defHeader.promise,
            defMessage.promise,
            defStatus.promise,
            defTrailer.promise,
        );
    }
}

const mapType = (NativeType: IMessageType<any>) => {
    class WebType implements grpc.ProtobufMessage {
        constructor(public payload = NativeType.create()) {}

        serializeBinary(): Uint8Array {
            return NativeType.toBinary(this.payload);
        }

        toObject(): any {
            return this.payload;
        }

        static deserializeBinary = (bytes: Uint8Array): WebType => {
            const message = NativeType.fromBinary(bytes);

            return new WebType(message);
        };
    }

    return WebType;
};
