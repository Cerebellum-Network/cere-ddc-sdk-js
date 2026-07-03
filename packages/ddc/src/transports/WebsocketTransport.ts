import { grpc } from '@improbable-eng/grpc-web';
import { IMessageType } from '@protobuf-ts/runtime';
import { GrpcOptions } from '@protobuf-ts/grpc-transport';
import {
  ClientStreamingCall,
  DuplexStreamingCall,
  MethodInfo,
  RpcOptions,
  ServerStreamingCall,
  UnaryCall,
  mergeRpcOptions,
  Deferred,
  RpcMetadata,
  RpcStatus,
  RpcError,
  RpcInputStream,
  RpcOutputStreamController,
  DeferredState,
} from '@protobuf-ts/runtime-rpc';

import { GrpcStatus } from '../grpc/status';
import { RpcTransport, RpcTransportOptions } from './RpcTransport';
import { TimeoutInterceptor } from './TimeoutInterceptor';

export type WebsocketTransportOptions = Pick<RpcTransportOptions, 'httpUrl' | 'ssl' | 'timeout'> &
  Pick<GrpcOptions, 'interceptors'>;

const createHost = ({ httpUrl, ssl }: WebsocketTransportOptions) => {
  const sanitizedUrl = /^https?:\/\//i.test(httpUrl) ? httpUrl : `http://${httpUrl}`;
  const url = new URL(sanitizedUrl);

  if (ssl) {
    url.protocol = 'https:';
  }

  return url.href.replace(/\/+$/, '');
};

const getStatus = (headers: grpc.Metadata): RpcStatus | null => {
  const [statusCode] = headers.get('grpc-status') || [];
  const [message] = headers.get('grpc-message') || [];

  return statusCode ? { code: GrpcStatus[Number(statusCode)], detail: message || '' } : null;
};

/**
 * The `WebsocketTransport` class represents a gRPC transport layer for RPC communication over WebSockets.
 *
 * @group RPC Transport
 */
export class WebsocketTransport implements RpcTransport {
  private defaultOptions: RpcOptions = {};
  private host: string;

  constructor({ timeout, interceptors = [], ...options }: WebsocketTransportOptions) {
    this.host = createHost(options);

    this.defaultOptions = {
      interceptors: timeout ? [new TimeoutInterceptor(timeout), ...interceptors] : interceptors,
    };
  }

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
        host: this.host,
        transport: grpc.WebsocketTransport(),
      },
    );

    const emitError = (error: RpcError) => {
      defHeader.rejectPending(error);
      defMessage.rejectPending(error);
      defStatus.rejectPending(error);
      defTrailer.rejectPending(error);
    };

    if (options.abort) {
      options.abort.addEventListener('abort', () => {
        emitError(options.abort!.reason || new RpcError('Canceled by client', GrpcStatus[GrpcStatus.CANCELLED]));

        client.close();
      });
    }

    client.onHeaders((meta) => {
      const status = getStatus(meta);

      if (status && status.code !== GrpcStatus[GrpcStatus.OK]) {
        return defHeader.rejectPending(new RpcError(status.detail, status.code));
      }

      defHeader.resolvePending(meta.headersMap);
    });

    client.onMessage((message) => {
      defMessage.resolvePending(message.toObject() as any);
    });

    client.onEnd((status, statusMessage, trailers) => {
      if (status !== grpc.Code.OK) {
        return emitError(new RpcError(statusMessage, GrpcStatus[status]));
      }

      defStatus.resolvePending({ code: GrpcStatus[status], detail: statusMessage });
      defTrailer.resolvePending(trailers.headersMap);
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

  duplex<I extends object, O extends object>(method: MethodInfo<I, O>, options: RpcOptions): DuplexStreamingCall<I, O> {
    const InputType = mapType(method.I);
    const defHeader = new Deferred<RpcMetadata>();
    const outStream = new RpcOutputStreamController<O>();
    const defStatus = new Deferred<RpcStatus>();
    const defTrailer = new Deferred<RpcMetadata>();

    const client = grpc.client(
      {
        methodName: method.name,
        requestStream: true,
        responseStream: true,
        requestType: InputType,
        responseType: mapType(method.O),
        service: {
          serviceName: method.service.typeName,
        },
      },
      {
        host: this.host,
        transport: grpc.WebsocketTransport(),
      },
    );

    const emitError = (error: RpcError) => {
      defHeader.rejectPending(error);
      defStatus.rejectPending(error);
      defTrailer.rejectPending(error);

      if (!outStream.closed) {
        outStream.notifyError(error);
      }
    };

    if (options.abort) {
      options.abort.addEventListener('abort', () => {
        emitError(options.abort!.reason || new RpcError('Canceled by client', GrpcStatus[GrpcStatus.CANCELLED]));

        client.close();
      });
    }

    client.onHeaders((meta) => {
      const status = getStatus(meta);

      if (status && status.code !== GrpcStatus[GrpcStatus.OK]) {
        return defHeader.rejectPending(new RpcError(status.detail, status.code));
      }

      defHeader.resolvePending(meta.headersMap);
    });

    client.onMessage((message) => {
      outStream.notifyMessage(message.toObject() as any);
    });

    client.onEnd((status, statusMessage, trailers) => {
      if (status !== grpc.Code.OK) {
        return emitError(new RpcError(statusMessage, GrpcStatus[status]));
      }

      defStatus.resolvePending({ code: GrpcStatus[status], detail: statusMessage });
      defTrailer.resolvePending(trailers.headersMap);

      if (!outStream.closed) {
        outStream.notifyComplete();
      }
    });

    client.start(new grpc.Metadata(options.meta));

    const inputStream: RpcInputStream<any> = {
      send: async (message) => {
        client.send(new InputType(message));
      },

      complete: async () => {
        if (defStatus.state === DeferredState.PENDING) {
          client.finishSend();
        }
      },
    };

    return new DuplexStreamingCall(
      method,
      options.meta ?? {},
      inputStream,
      defHeader.promise,
      outStream,
      defStatus.promise,
      defTrailer.promise,
    );
  }

  mergeOptions(options?: Partial<RpcOptions>): RpcOptions {
    return mergeRpcOptions(this.defaultOptions, options);
  }

  serverStreaming<I extends object, O extends object>(): ServerStreamingCall<I, O> {
    throw new Error('Not implemented');
  }

  unary<I extends object, O extends object>(method: MethodInfo<I, O>, input: I, options: RpcOptions): UnaryCall<I, O> {
    const InputType = mapType(method.I);
    const defHeader = new Deferred<RpcMetadata>();
    const defMessage = new Deferred<O>();
    const defStatus = new Deferred<RpcStatus>();
    const defTrailer = new Deferred<RpcMetadata>();

    const request = new Promise<grpc.UnaryOutput<grpc.ProtobufMessage>>((onEnd, reject) => {
      const client = grpc.unary(
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
          host: this.host,
          transport: grpc.WebsocketTransport(),
          metadata: new grpc.Metadata(options.meta),
          request: new InputType(input),
          onEnd,
        },
      );

      if (options.abort) {
        options.abort.addEventListener('abort', () => {
          reject(options.abort?.reason || new RpcError('Canceled by client', GrpcStatus[GrpcStatus.CANCELLED]));

          client.close();
        });
      }
    });

    request
      .then((output) => {
        defHeader.resolvePending(output.headers.headersMap);
        defTrailer.resolvePending(output.headers.headersMap);
        defStatus.resolvePending({
          code: GrpcStatus[output.status],
          detail: output.statusMessage,
        });

        if (output.status !== grpc.Code.OK) {
          throw new RpcError(output.statusMessage, GrpcStatus[output.status]);
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
