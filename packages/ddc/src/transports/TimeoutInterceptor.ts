import {
  MethodInfo,
  NextClientStreamingFn,
  NextDuplexStreamingFn,
  NextServerStreamingFn,
  NextUnaryFn,
  RpcError,
  RpcInterceptor,
  RpcOptions,
} from '@protobuf-ts/runtime-rpc';

import { GrpcStatus } from '../grpc/status';

class TimeoutAbortController extends AbortController {
  private timeoutHandle: NodeJS.Timeout | undefined;

  constructor(readonly timeout: number) {
    super();

    this.timeout = timeout;
  }

  stop = () => {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
  };

  start = () => {
    this.stop();

    this.timeoutHandle = setTimeout(
      () => this.abort(new RpcError('Request timed out', GrpcStatus[GrpcStatus.CANCELLED])),
      this.timeout,
    );

    return this;
  };
}

const composeSignal = (sigA: AbortSignal, sigB?: AbortSignal) => {
  if (!sigB) {
    return sigA;
  }

  const controller = new AbortController();
  const abortHandler = () => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  };

  sigA.addEventListener('abort', abortHandler);
  sigB.addEventListener('abort', abortHandler);

  return controller.signal;
};

/**
 * An interceptor that adds a timeout to all RPC calls.
 *
 * TODO: This interceptor adds timeout to `headers` promise only for now, since the SDK cannot retry ongoing requests for now.
 */
export class TimeoutInterceptor implements RpcInterceptor {
  constructor(readonly timeout: number) {}

  private start(options: RpcOptions) {
    const controller = new TimeoutAbortController(this.timeout);

    return [controller.start(), composeSignal(controller.signal, options.abort)] as const;
  }

  interceptDuplex(next: NextDuplexStreamingFn, method: MethodInfo, options: RpcOptions) {
    const [controller, abort] = this.start(options);
    const call = next(method, { ...options, abort });

    call.headers.then(controller.stop, controller.stop);

    return call;
  }

  interceptServerStreaming(next: NextServerStreamingFn, method: MethodInfo, input: object, options: RpcOptions) {
    const [controller, abort] = this.start(options);
    const call = next(method, input, { ...options, abort });

    call.headers.then(controller.stop, controller.stop);

    return call;
  }

  interceptClientStreaming(next: NextClientStreamingFn, method: MethodInfo<any, any>, options: RpcOptions) {
    const [controller, abort] = this.start(options);
    const call = next(method, { ...options, abort });

    call.headers.then(controller.stop, controller.stop);

    return call;
  }

  interceptUnary(next: NextUnaryFn, method: MethodInfo, input: object, { timeout, ...options }: RpcOptions) {
    return next(method, input, { ...options, timeout: timeout ?? this.timeout });
  }
}
