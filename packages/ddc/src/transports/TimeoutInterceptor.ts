import {
  MethodInfo,
  NextDuplexStreamingFn,
  NextServerStreamingFn,
  NextUnaryFn,
  RpcError,
  RpcInterceptor,
  RpcOptions,
} from '@protobuf-ts/runtime-rpc';

import { GrpcStatus } from '../grpc/status';

export class RpcTimeoutError extends RpcError {
  constructor() {
    super('Request timed out', GrpcStatus[GrpcStatus.DEADLINE_EXCEEDED]);
  }
}

class TimeoutAbortController extends AbortController {
  private timeoutHandle: NodeJS.Timeout | undefined;

  constructor(readonly timeout: number) {
    super();

    this.timeout = timeout;
  }

  start() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }

    this.timeoutHandle = setTimeout(() => this.abort(new RpcTimeoutError()), this.timeout);

    return this;
  }

  handleActivity = () => this.start();
}

const composeSignal = (sigA: AbortSignal, sigB?: AbortSignal) => {
  if (!sigB) {
    return sigA;
  }

  const controller = new AbortController();
  const combinedSignal = controller.signal;
  const abortHandler = () => {
    if (!combinedSignal.aborted) {
      controller.abort();
    }
  };

  sigA.addEventListener('abort', abortHandler);
  sigB.addEventListener('abort', abortHandler);

  return combinedSignal;
};

export class TimeoutInterceptor implements RpcInterceptor {
  constructor(readonly timeout: number) {}

  interceptDuplex(next: NextDuplexStreamingFn, method: MethodInfo, options: RpcOptions) {
    const controller = new TimeoutAbortController(this.timeout).start();
    const abort = composeSignal(controller.signal, options.abort);
    const duplexCall = next(method, { ...options, abort });

    duplexCall.responses.onNext(controller.handleActivity);

    return duplexCall;
  }

  interceptServerStreaming(next: NextServerStreamingFn, method: MethodInfo, input: object, options: RpcOptions) {
    const controller = new TimeoutAbortController(this.timeout).start();
    const abort = composeSignal(controller.signal, options.abort);
    const serverStreamingCall = next(method, input, { ...options, abort });

    serverStreamingCall.responses.onNext(controller.handleActivity);

    return serverStreamingCall;
  }

  interceptUnary(next: NextUnaryFn, method: MethodInfo, input: object, { timeout, ...options }: RpcOptions) {
    return next(method, input, { ...options, timeout: timeout ?? this.timeout });
  }
}
