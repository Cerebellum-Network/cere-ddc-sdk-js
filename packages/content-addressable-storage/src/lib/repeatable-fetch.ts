import {fetch} from 'cross-fetch';

type GetArgTypes<F> = F extends (x: infer A, b: infer B) => infer R ? [A, B, R] : unknown;

type FetchTypes = GetArgTypes<typeof fetch>;
type Input = FetchTypes[0];
type Options = FetchTypes[1] & {attempts?: number};
type Result = FetchTypes[2];

type PromiseCallback<T> = (value: T | PromiseLike<T>) => void;
const defer = <T = undefined>(): {resolve: PromiseCallback<T>; promise: Promise<T>} => {
    let res: PromiseCallback<T> = () => undefined;
    const p = new Promise<T>((resolve) => {
        res = resolve;
    });
    return {
        promise: p,
        resolve: res,
    };
};

const key = Symbol();

export function repeatableFetch(input: Input, options: Options = {}): Result {
    const {attempts = 1, ...fetchOptions} = options;
    const defers = Array.from(new Array(attempts)).map(() => defer());
    defers[0].resolve(undefined);
    return Promise.any(defers.map((d, i) => {
        return d.promise.then(() => fetch(input, fetchOptions))
            .catch(err => {
                if (i + 1 < attempts) {
                    defers[i + 1].resolve(undefined);
                }
                throw err;
            })
            .then(response => {
                if (response.ok) {
                    return response;
                }
                if (i + 1 < attempts) {
                    defers[i + 1].resolve(undefined);
                }
                throw {[key]: response};
            });
    })).catch(e => {
        if (e instanceof AggregateError) {
            const response = e.errors[0];
            if (response?.[key]) {
                return response[key];
            }
            throw response;
        }
        throw e;
    });
}
