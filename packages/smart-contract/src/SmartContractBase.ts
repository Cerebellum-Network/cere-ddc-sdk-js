import {ContractPromise} from '@polkadot/api-contract';
import {isKeyringPair} from '@polkadot/api/util';
import {SubmittableResultValue, Signer, AddressOrPair, SubmittableExtrinsic} from '@polkadot/api/types';
import {ContractQuery, ContractTx} from '@polkadot/api-contract/base/types';
import {DecodedEvent, ContractOptions} from '@polkadot/api-contract/types';
import {ContractEvent, ContractEventArgs, Offset, toJs} from './types';
import {Bytes} from '@polkadot/types';
import {ApiPromise} from '@polkadot/api';

const defaultOptions: ContractOptions = {
    gasLimit: 10_000_000_000,
    storageDepositLimit: null,
};

const dryRunOptions: ContractOptions = {
    ...defaultOptions,

    gasLimit: -1,
};

export type SubmitResult = Pick<SubmittableResultValue, 'events'> & {
    contractEvents?: DecodedEvent[];
};

export type ListResult<T> = [T[], Offset];

const drainList = async <T extends unknown>(
    offset: Offset,
    limit: Offset,
    iterate: (offset: Offset, limit: Offset) => Promise<[T[], bigint | number | string]>,
) => {
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

    return [list as T[], total] as ListResult<T>;
};

export class SmartContractBase {
    private currentBatch?: SubmittableExtrinsic<'promise'>[];
    private currentBatchPromise?: Promise<Required<SubmitResult>>;

    protected readonly address: string;

    constructor(
        protected readonly account: AddressOrPair,
        protected readonly contract: ContractPromise,
        protected readonly signer?: Signer,
    ) {
        this.address = isKeyringPair(this.account) ? this.account.address : this.account.toString();
    }

    protected estimateGasLimit() {
        const api = this.contract.api as ApiPromise;
        const {maxBlock} = api.consts.system.blockWeights.toJSON() as any;

        return Number(maxBlock);
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

        if (this.currentBatch && this.currentBatchPromise) {
            this.currentBatch.push(extrinsic);

            return this.currentBatchPromise;
        }

        return this.signAndSend(extrinsic);
    }

    protected submit(tx: ContractTx<'promise'>, ...params: unknown[]) {
        return this.submitWithOptions(tx, defaultOptions, ...params);
    }

    /**
     * Returns a contract event params from the events list and removes the event to not allow it to be reused in batched operations
     */
    protected pullContractEventArgs<T extends ContractEvent>(contractEvents: DecodedEvent[], eventName: T) {
        const eventIndex = contractEvents.findIndex(({event}) => event.identifier === eventName);

        if (eventIndex < 0) {
            throw new Error(`Event ${eventName} has not been emited`);
        }

        const [record] = contractEvents.splice(eventIndex, 1);
        const args: ContractEventArgs<T> = record.event.args.reduce<any>(
            (args, {name}, index) => ({...args, [name]: toJs(record.args[index])}),
            {},
        );

        return args;
    }

    protected async signAndSend(extrinsic: SubmittableExtrinsic<'promise'>) {
        return new Promise<Required<SubmitResult>>((resolve, reject) =>
            extrinsic
                .signAndSend(this.account, {signer: this.signer, nonce: -1}, (result) => {
                    const {status, dispatchError, events = []} = result;
                    const contractEvents = result.filterRecords('contracts', 'ContractEmitted').map((record) => {
                        const [, data] = record.event.data;

                        return this.contract.abi.decodeEvent(data as Bytes);
                    });

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
                })
                .catch(reject),
        );
    }

    async batch<T extends readonly Promise<any>[]>(builder: () => T | void) {
        let resolveBatch!: (params: any) => any;
        let rejectBatch!: (params: any) => any;

        this.currentBatch = [];
        this.currentBatchPromise = new Promise((resolve, reject) => {
            resolveBatch = resolve;
            rejectBatch = reject;
        });

        const batchPromise = this.currentBatchPromise;
        const promises = builder() || ([] as any);

        this.signAndSend(this.contract.api.tx.utility.batch([...this.currentBatch]))
            .then(resolveBatch)
            .catch(rejectBatch);

        this.currentBatchPromise = undefined;
        this.currentBatch = undefined;

        await batchPromise;

        return Promise.all(promises);
    }
}
