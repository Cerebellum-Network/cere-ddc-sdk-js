import {ContractPromise} from '@polkadot/api-contract';
import {isKeyringPair} from '@polkadot/api/util';
import {SubmittableResultValue, Signer, AddressOrPair} from '@polkadot/api/types';
import {ContractQuery, ContractTx} from '@polkadot/api-contract/base/types';
import {DecodedEvent} from '@polkadot/api-contract/types';
import {ContractEvent, ContractEventArgs} from './types';

const CERE = 10_000_000_000n;

const txOptions = {
    storageDepositLimit: null,
    gasLimit: -1,
};

const txOptionsPay = {
    value: 10n * CERE,
    gasLimit: -1, //100_000n * MGAS,
};

type SubmitResult = Pick<SubmittableResultValue, 'events'> & {
    contractEvents?: DecodedEvent[];
};

const drainList = async <T extends unknown>(
    offset: number,
    limit: number,
    iterate: (offset: number, limit: number) => Promise<[unknown[], number]>,
) => {
    let cursor = offset;
    let total = 0;
    const chunkSize = 10;
    const list: unknown[] = [];

    while (true) {
        const [chunk, totalCount] = await iterate(offset + list.length, list.length + chunkSize);

        total = totalCount;
        list.push(...chunk);

        cursor += chunkSize;

        if (cursor > limit || cursor > totalCount) {
            break;
        }
    }

    return [list as T[], total] as const;
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
        const {output, result} = await query(this.address, txOptions, ...params);

        if (!result.isOk) {
            throw result.asErr;
        }

        return output!.toJSON() as T;
    }

    protected async queryOne<T extends unknown>(query: ContractQuery<'promise'>, ...params: unknown[]) {
        const result = await this.query<{ok: T}>(query, ...params);

        return result.ok;
    }

    protected async queryList<T extends unknown>(
        query: ContractQuery<'promise'>,
        offset?: number | null,
        limit?: number | null,
        ...params: unknown[]
    ) {
        return drainList<T>(offset || 0, limit || 10, (...slice) => this.query(query, ...slice, ...params));
    }

    protected async submit(tx: ContractTx<'promise'>, ...params: unknown[]) {
        const extrinsic = tx(txOptionsPay, ...params);

        return new Promise<Required<SubmitResult>>((resolve, reject) =>
            extrinsic.signAndSend(this.account, {signer: this.signer}, (result) => {
                const {status, dispatchError} = result;
                const {events = [], contractEvents = []} = result as SubmitResult;

                if (status.isInBlock || status.isFinalized) {
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

    protected getContractEventArgs<T extends ContractEvent>(contractEvents: DecodedEvent[], eventName: T) {
        const result = contractEvents.find(({event}) => event.identifier === eventName);

        if (!result) {
            throw new Error(`Event ${eventName} has not been emited`);
        }

        const args: ContractEventArgs<T> = result.event.args.reduce<any>(
            (args, {name}, index) => ({...args, [name]: result.args[index].toJSON()}),
            {},
        );

        return args;
    }
}