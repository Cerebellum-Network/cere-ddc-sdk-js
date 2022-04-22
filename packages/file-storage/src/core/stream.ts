export interface ReadableWritablePair<R = any, W = any> {
    readable: ReadableStream<R>;
    writable: WritableStream<W>;
}

export interface StreamPipeOptions {
    preventAbort?: boolean;
    preventCancel?: boolean;
    preventClose?: boolean;
    signal?: AbortSignal;
}

export interface ReadableStreamGenericReader {
    readonly closed: Promise<undefined>;

    cancel(reason?: any): Promise<void>;
}

export interface ReadableStreamDefaultReadValueResult<T> {
    done: false;
    value: T;
}

export interface ReadableStreamDefaultReadDoneResult {
    done: true;
    value?: undefined;
}

type ReadableStreamController<T> = ReadableStreamDefaultController<T>;
type ReadableStreamDefaultReadResult<T> =
    | ReadableStreamDefaultReadValueResult<T>
    | ReadableStreamDefaultReadDoneResult;

export interface ReadableByteStreamControllerCallback {
    (controller: ReadableByteStreamController): void | PromiseLike<void>;
}

export interface UnderlyingSinkAbortCallback {
    (reason?: any): void | PromiseLike<void>;
}

export interface UnderlyingSinkCloseCallback {
    (): void | PromiseLike<void>;
}

export interface UnderlyingSinkStartCallback {
    (controller: WritableStreamDefaultController): any;
}

export interface UnderlyingSinkWriteCallback<W> {
    (chunk: W, controller: WritableStreamDefaultController): void | PromiseLike<void>;
}

export interface UnderlyingSourceCancelCallback {
    (reason?: any): void | PromiseLike<void>;
}

export interface UnderlyingSourcePullCallback<R> {
    (controller: ReadableStreamController<R>): void | PromiseLike<void>;
}

export interface UnderlyingSourceStartCallback<R> {
    (controller: ReadableStreamController<R>): any;
}

export interface TransformerFlushCallback<O> {
    (controller: TransformStreamDefaultController<O>): void | PromiseLike<void>;
}

export interface TransformerStartCallback<O> {
    (controller: TransformStreamDefaultController<O>): any;
}

export interface TransformerTransformCallback<I, O> {
    (chunk: I, controller: TransformStreamDefaultController<O>): void | PromiseLike<void>;
}

export interface UnderlyingByteSource {
    autoAllocateChunkSize?: number;
    cancel?: ReadableStreamErrorCallback;
    pull?: ReadableByteStreamControllerCallback;
    start?: ReadableByteStreamControllerCallback;
    type: 'bytes';
}

export interface UnderlyingSource<R = any> {
    cancel?: UnderlyingSourceCancelCallback;
    pull?: UnderlyingSourcePullCallback<R>;
    start?: UnderlyingSourceStartCallback<R>;
    type?: undefined;
}

export interface UnderlyingSink<W = any> {
    abort?: UnderlyingSinkAbortCallback;
    close?: UnderlyingSinkCloseCallback;
    start?: UnderlyingSinkStartCallback;
    type?: undefined;
    write?: UnderlyingSinkWriteCallback<W>;
}

export interface ReadableStreamErrorCallback {
    (reason: any): void | PromiseLike<void>;
}

export interface ReadableStream<R = any> {
    readonly locked: boolean;

    cancel(reason?: any): Promise<void>;

    getReader(): ReadableStreamDefaultReader<R>;

    pipeThrough<T>(transform: ReadableWritablePair<T, R>, options?: StreamPipeOptions): ReadableStream<T>;

    pipeTo(destination: WritableStream<R>, options?: StreamPipeOptions): Promise<void>;

    tee(): [ReadableStream<R>, ReadableStream<R>];
}

export interface ReadableStreamDefaultReader<R = any> extends ReadableStreamGenericReader {
    read(): Promise<ReadableStreamDefaultReadResult<R>>;

    releaseLock(): void;
}

export interface ReadableByteStreamController {
    readonly byobRequest: undefined;
    readonly desiredSize: number | null;

    close(): void;

    enqueue(chunk: ArrayBufferView): void;

    error(error?: any): void;
}

export interface ReadableStreamDefaultController<R = any> {
    readonly desiredSize: number | null;

    close(): void;

    enqueue(chunk?: R): void;

    error(e?: any): void;
}

export interface Transformer<I = any, O = any> {
    flush?: TransformerFlushCallback<O>;
    readableType?: undefined;
    start?: TransformerStartCallback<O>;
    transform?: TransformerTransformCallback<I, O>;
    writableType?: undefined;
}

export interface TransformStream<I = any, O = any> {
    readonly readable: ReadableStream<O>;
    readonly writable: WritableStream<I>;
}

export interface TransformStreamDefaultController<O = any> {
    readonly desiredSize: number | null;

    enqueue(chunk?: O): void;

    error(reason?: any): void;

    terminate(): void;
}

export interface WritableStream<W = any> {
    readonly locked: boolean;

    abort(reason?: any): Promise<void>;

    close(): Promise<void>;

    getWriter(): WritableStreamDefaultWriter<W>;
}

export interface WritableStreamDefaultWriter<W = any> {
    readonly closed: Promise<undefined>;
    readonly desiredSize: number | null;
    readonly ready: Promise<undefined>;

    abort(reason?: any): Promise<void>;

    close(): Promise<void>;

    releaseLock(): void;

    write(chunk?: W): Promise<void>;
}

export interface WritableStreamDefaultController {
    error(e?: any): void;
}

export interface QueuingStrategy<T = any> {
    highWaterMark?: number;
    size?: QueuingStrategySize<T>;
}

export interface QueuingStrategySize<T = any> {
    (chunk?: T): number;
}

export interface QueuingStrategyInit {
    highWaterMark: number;
}

export interface ByteLengthQueuingStrategy extends QueuingStrategy<ArrayBufferView> {
    readonly highWaterMark: number;
    readonly size: QueuingStrategySize<ArrayBufferView>;
}


export interface CountQueuingStrategy extends QueuingStrategy {
    readonly highWaterMark: number;
    readonly size: QueuingStrategySize;
}


export interface TextEncoderStream {
    /** Returns "utf-8". */
    readonly encoding: 'utf-8';
    readonly readable: ReadableStream<Uint8Array>;
    readonly writable: WritableStream<string>;
    readonly [Symbol.toStringTag]: string;
}


export interface TextDecoderOptions {
    fatal?: boolean;
    ignoreBOM?: boolean;
}

export type BufferSource = ArrayBufferView | ArrayBuffer;

export interface TextDecoderStream {
    readonly encoding: string;
    readonly fatal: boolean;
    readonly ignoreBOM: boolean;
    readonly readable: ReadableStream<string>;
    readonly writable: WritableStream<BufferSource>;
    readonly [Symbol.toStringTag]: string;
}