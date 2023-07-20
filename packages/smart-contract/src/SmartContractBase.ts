import {ContractPromise} from '@polkadot/api-contract';
import {isKeyringPair} from '@polkadot/api/util';
import {SubmittableResultValue, Signer, AddressOrPair} from '@polkadot/api/types';
import {ContractQuery, ContractTx} from '@polkadot/api-contract/base/types';
import {DecodedEvent, ContractOptions} from '@polkadot/api-contract/types';
import {ContractEvent, ContractEventArgs, Offset, toJs} from './types';

const defaultOptions: ContractOptions = {
    gasLimit: -1,
};

const dryRunOptions: ContractOptions = {
    ...defaultOptions,

    storageDepositLimit: null,
};

type SubmitResult = Pick<SubmittableResultValue, 'events'> & {
    contractEvents?: DecodedEvent[];
};

const drainList = async <T extends unknown>(
    offset: Offset,
    limit: Offset,
    iterate: (offset: Offset, limit: Offset) => Promise<[T[], bigint | number | string]>,
): Promise<[T[], Offset]> => {
    let cursor = offset;
    let total: Offset = 0n;
    const chunkSize: Offset = 10n;
    const list: unknown[] = [];

    while (true) {
        const length = BigInt(list.length);
        const [chunk, totalCount] = await iterate(offset + length, length + chunkSize);

        total = BigInt(totalCount);
        list.push(...chunk);

        cursor += chunkSize;

        if (cursor > limit || cursor > total) {
            break;
        }
    }

    return [list as T[], total];
};

export class SmartContractBase {
    protected readonly address: string;

    constructor(
        protected readonly account: AddressOrPair,
        protected readonly contract: ContractPromise,
        protected readonly signer?: Signer,
    ) {
        this.address = isKeyringPair(this.account) ? this.account.address : this.account.toString();
    }

    protected async query<T extends unknown>(query: ContractQuery<'promise'>, ...params: unknown[]) {
        const {output, result} = await query(this.address, dryRunOptions, ...params);

        if (!result.isOk) {
            throw result.asErr;
        }

        return toJs(output!) as T;
    }

    protected async queryOne<T extends unknown>(query: ContractQuery<'promise'>, ...params: unknown[]) {
        const result = await this.query<{ok: T}>(query, ...params);

        return result.ok;
    }

    protected async queryList<T extends unknown>(
        query: ContractQuery<'promise'>,
        offset?: Offset | null,
        limit?: Offset | null,
        ...params: unknown[]
    ) {
        return drainList<T>(offset || 0n, limit || 10n, (...slice) => this.query(query, ...slice, ...params));
    }

    protected async submitWithOptions(tx: ContractTx<'promise'>, options: ContractOptions, ...params: unknown[]) {
        const extrinsic = tx({...defaultOptions, ...options}, ...params);

        return new Promise<Required<SubmitResult>>((resolve, reject) =>
            extrinsic.signAndSend(this.account, {signer: this.signer}, (result) => {
                const {status, dispatchError} = result;
                const {events = [], contractEvents = []} = result as SubmitResult;

                if (status.isFinalized) {
                    return resolve({events, contractEvents});
                }

                if (dispatchError) {
                    let errorMessage: string;

                    if (dispatchError.isModule) {
                        const decoded = this.contract.api.registry.findMetaError(dispatchError.asModule);

                        errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`;
                    } else {
                        errorMessage = dispatchError.toString();
                    }

                    reject(new Error(errorMessage));
                }
            }),
        );
    }

    protected submit(tx: ContractTx<'promise'>, ...params: unknown[]) {
        return this.submitWithOptions(tx, dryRunOptions, ...params);
    }

    protected getContractEventArgs<T extends ContractEvent>(contractEvents: DecodedEvent[], eventName: T) {
        const result = contractEvents.find(({event}) => event.identifier === eventName);

        if (!result) {
            throw new Error(`Event ${eventName} has not been emited`);
        }

        const args: ContractEventArgs<T> = result.event.args.reduce<any>(
            (args, {name}, index) => ({...args, [name]: toJs(result.args[index])}),
            {},
        );

        return args;
    }
}
