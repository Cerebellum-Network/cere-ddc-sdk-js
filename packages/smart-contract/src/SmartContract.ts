import {BucketCreatedEvent} from './event/BucketCreatedEvent';
import {SmartContractOptions, TESTNET} from './options/SmartContractOptions';
import {ApiPromise, WsProvider} from '@polkadot/api';
import {ContractPromise} from '@polkadot/api-contract';
import {Keyring} from '@polkadot/keyring';
import {AddressOrPair, SubmittableExtrinsic, SubmittableResultSubscription} from '@polkadot/api/submittable/types';
import {Callback, ISubmittableResult} from '@polkadot/types/types';
import {cryptoWaitReady, isAddress} from '@polkadot/util-crypto';
import {find, get} from 'lodash';
import {NodeStatus} from './model/NodeStatus';
import {cereTypes} from './types/cere_types';
import {BucketStatus} from './model/BucketStatus';
import {BucketStatusList} from './model/BucketStatusList';
import {ApiTypes} from '@polkadot/api/types';
import {BucketParams, initDefaultBucketParams} from './options/BucketParams';
import {CdnClusterGetResult, CdnNodeGetResult, ClusterGetResult} from './types/smart-contract-responses';

const CERE = 10_000_000_000n;

const txOptions = {
    storageDepositLimit: null,
    gasLimit: -1,
};

const txOptionsPay = {
    value: 10n * CERE,
    gasLimit: -1, //100_000n * MGAS,
};

export class SmartContract {
    readonly options: SmartContractOptions;
    readonly address: string;

    private api!: ApiPromise;

    contract!: ContractPromise;

    signAndSend: (
        tx: SubmittableExtrinsic<any>,
        statusCb: Callback<ISubmittableResult>,
    ) => SubmittableResultSubscription<ApiTypes>;

    constructor(secretPhraseOrAddress: string, options: SmartContractOptions = TESTNET) {
        const keyring = new Keyring({type: 'sr25519'});
        let account: AddressOrPair;
        if (isAddress(secretPhraseOrAddress)) {
            account = keyring.addFromAddress(secretPhraseOrAddress);
        } else {
            account = keyring.addFromMnemonic(secretPhraseOrAddress, {name: 'sr25519'});
        }

        this.signAndSend = (tx, statusCb): any => tx.signAndSend(account, statusCb as any);
        this.address = account.address;
        this.options = options;
    }

    static async buildAndConnect(
        secretPhraseOrAddress: string,
        options: SmartContractOptions = TESTNET,
    ): Promise<SmartContract> {
        await cryptoWaitReady();

        return new SmartContract(secretPhraseOrAddress, options).connect();
    }

    async connect(): Promise<SmartContract> {
        const provider = new WsProvider(this.options.rpcUrl);
        this.api = await ApiPromise.create({provider, types: cereTypes});
        await this.api.isReady;
        this.contract = new ContractPromise(this.api, this.options.abi, this.options.contractAddress);
        return this;
    }

    async disconnect() {
        return await this.contract.api.disconnect();
    }

    async bucketCreate(
        owner: string,
        clusterId: bigint,
        bucketParams: BucketParams = new BucketParams(),
    ): Promise<BucketCreatedEvent> {
        const createBucketParams = initDefaultBucketParams(bucketParams);
        const tx = await this.contract.tx.bucketCreate(
            txOptionsPay,
            JSON.stringify(createBucketParams),
            clusterId,
            owner,
        );
        const result = await this.sendTx(tx);
        const events = (result as any).contractEvents || [];
        const bucketId = SmartContract.findCreatedBucketId(events);
        return new BucketCreatedEvent(BigInt(bucketId));
    }

    async bucketGet(bucketId: bigint): Promise<BucketStatus> {
        const {result, output} = await this.contract.query.bucketGet(this.address, txOptions, bucketId);
        if (!result.isOk) throw result.asErr;

        const bucketStatus = (output as any).toJSON().ok;
        bucketStatus.params = JSON.parse(bucketStatus.params);

        return bucketStatus as BucketStatus;
    }

    async bucketList(offset: bigint, limit: bigint, filterOwnerId?: string): Promise<BucketStatusList> {
        const {result, output} = await this.contract.query.bucketList(
            this.address,
            txOptions,
            offset,
            limit,
            filterOwnerId,
        );
        if (!result.isOk) throw result.asErr;

        const [statuses, length] = (output as any).toJSON();
        return new BucketStatusList(statuses, length);
    }

    async clusterGet(clusterId: number): Promise<ClusterGetResult> {
        let {result, output} = await this.contract.query.clusterGet(this.address, txOptions, clusterId);
        if (!result.isOk) {
            throw result.asErr;
        }
        return (output as any).toJSON().ok as ClusterGetResult;
    }

    async cdnClusterGet(clusterId: number): Promise<CdnClusterGetResult> {
        let {result, output} = await this.contract.query.cdnClusterGet(this.address, txOptions, clusterId);
        if (!result.isOk) {
            throw result.asErr;
        }
        return (output as any).toJSON().ok as CdnClusterGetResult;
    }

    async cdnNodeGet(clusterId: number): Promise<CdnNodeGetResult> {
        let {result, output} = await this.contract.query.cdnNodeGet(this.address, txOptions, clusterId);
        if (!result.isOk) {
            throw result.asErr;
        }
        // @ts-ignore
        return output.toJSON().ok as CdnNodeGetResult;
    }

    async accountBond(value: bigint) {
        const tx = await this.contract.tx.accountBond(txOptions, value * CERE);
        const result = await this.sendTx(tx);
        if (result.dispatchError) {
            throw new Error('Unable to deposit account');
        }
    }

    async accountDeposit(value: bigint) {
        const tx = await this.contract.tx.accountDeposit({...txOptions, value: value * CERE});
        const result = await this.sendTx(tx);
        if (result.dispatchError) {
            throw new Error('Unable to deposit account');
        }
    }

    async bucketAllocIntoCluster(bucketId: bigint, resource: bigint) {
        if (resource <= 0) {
            throw new Error('Invalid bucket size');
        }

        const tx = await this.contract.tx.bucketAllocIntoCluster(txOptions, bucketId, resource);
        const result = await this.sendTx(tx);
        if (result.dispatchError) throw new Error(`Unable to allocate in cluster. Bucket: ${bucketId}`);
    }

    async nodeGet(nodeId: number): Promise<NodeStatus> {
        let {result, output} = await this.contract.query.nodeGet(this.address, txOptions, nodeId);
        if (!result.isOk) throw result.asErr;
        // @ts-ignore
        return output.toJSON().ok as NodeStatus;
    }

    async sendTx(tx: SubmittableExtrinsic<any>): Promise<ISubmittableResult> {
        return await new Promise(async (resolve) => {
            await this.signAndSend(tx, (result: any) => {
                if (result.status.isInBlock || result.status.isFinalized) {
                    resolve(result);
                }
            });
        });
    }

    private static findCreatedBucketId(events: Array<any>): string {
        const eventName = 'BucketCreated';

        const event = find(events, ['event.identifier', eventName]);
        const id = get(event, 'args[0]');
        return id && id.toString();
    }
}
