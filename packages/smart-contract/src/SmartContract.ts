import {ClusterStatus} from "./model/ClusterStatus.js";
import {BucketPermissionRevokedEvent} from "./event/BucketPermissionRevokedEvent.js";
import {BucketCreatedEvent} from "./event/BucketCreatedEvent.js";
import {Permission} from "./model/Permission.js";
import {BucketPermissionGrantedEvent} from "./event/BucketPermissionGrantedEvent.js";
import {SmartContractOptions, TESTNET} from "./options/SmartContractOptions.js";
import {ApiPromise, WsProvider} from "@polkadot/api";
import {ContractPromise} from "@polkadot/api-contract";
import {Keyring} from '@polkadot/keyring';
import {AddressOrPair, SubmittableExtrinsic, SubmittableResultSubscription} from "@polkadot/api/submittable/types";
import {Callback, ISubmittableResult} from "@polkadot/types/types";
import {cryptoWaitReady} from '@polkadot/util-crypto';
import _ from "lodash";
import {NodeStatus} from "./model/NodeStatus.js";
import {cereTypes} from "./types/cere_types.js";
import {BucketStatus} from "./model/BucketStatus.js";
import {BucketStatusList} from "./model/BucketStatusList.js";
import {ApiTypes} from "@polkadot/api/types";
import {isAddress} from "@polkadot/util-crypto/address/is";
import {BucketParams, initDefaultBucketParams} from "./options/BucketParams.js";
import {waitReady} from "@polkadot/wasm-crypto";

const CERE = 10_000_000_000n;

const txOptions = {
    value: 0n,
    gasLimit: -1,
};

const txOptionsPay = {
    value: 10n * CERE,
    gasLimit: -1, //100_000n * MGAS,
}

export class SmartContract {
    readonly options: SmartContractOptions;
    readonly address: string;

    contract!: ContractPromise;

    signAndSend: (tx: SubmittableExtrinsic<any>, statusCb: Callback<ISubmittableResult>) => SubmittableResultSubscription<ApiTypes>;

    constructor(secretPhraseOrAddress: string, options: SmartContractOptions = TESTNET) {
        const keyring = new Keyring({type: 'sr25519'});
        let account: AddressOrPair;
        if (isAddress(secretPhraseOrAddress)) {
            account = keyring.addFromAddress(secretPhraseOrAddress);
        } else {
            account = keyring.addFromMnemonic(secretPhraseOrAddress, {name: 'sr25519'});
        }

        this.signAndSend = (tx, statusCb) => tx.signAndSend(account, statusCb);
        this.address = account.address;
        this.options = options;
    }

    static async buildAndConnect(secretPhraseOrAddress: string, options: SmartContractOptions = TESTNET): Promise<SmartContract> {
        await waitReady();
        return new SmartContract(secretPhraseOrAddress, options).connect();
    }

    protected async connect(): Promise<SmartContract> {
        await cryptoWaitReady();

        const wsProvider = new WsProvider(this.options.rpcUrl);
        const api = await ApiPromise.create({provider: wsProvider, types: cereTypes});

        this.contract = new ContractPromise(api, this.options.abi, this.options.contractAddress);
        return this;
    }

    async disconnect() {
        return await this.contract.api.disconnect();
    }

    async bucketCreate(balance: bigint, clusterId: bigint, bucketParams: BucketParams = new BucketParams()): Promise<BucketCreatedEvent> {
        bucketParams = initDefaultBucketParams(bucketParams);
        const tx = await this.contract.tx.bucketCreate(txOptionsPay, JSON.stringify(bucketParams), clusterId);
        const result = await this.sendTx(tx);
        // @ts-ignore
        const events = result.contractEvents || [];
        const bucketId = SmartContract.findCreatedBucketId(events);
        return new BucketCreatedEvent(BigInt(bucketId));
    }

    async bucketGet(bucketId: bigint): Promise<BucketStatus> {
        const {result, output} = await this.contract.query.bucketGet(this.address, txOptions, bucketId);
        if (!result.isOk) throw result.asErr;

        // @ts-ignore
        const bucketStatus = output.toJSON().ok;
        bucketStatus.params = JSON.parse(bucketStatus.params);

        return bucketStatus as BucketStatus;
    }

    async bucketList(offset: bigint, limit: bigint, filterOwnerId?: string): Promise<BucketStatusList> {
        const {result, output} =
            await this.contract.query.bucketList(this.address, txOptions, offset, limit, filterOwnerId);
        if (!result.isOk) throw result.asErr;

        // @ts-ignore
        const [statuses, length] = output.toJSON();
        return new BucketStatusList(statuses, length);
    }

/*    async bucketGrantPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent> {
        const tx = await this.contract.tx.bucketGrantPermission(txOptionsPay, bucketId, grantee, permission.toString());
        const result = await this.sendTx(tx);

        if (result.isError) {
            throw new Error("Failed to grant bucket permission");
        }
        return new BucketPermissionGrantedEvent();
    }

    async bucketRevokePermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent> {
        const tx = await this.contract.tx.bucketRevokePermission(txOptionsPay, bucketId, grantee, permission.toString());
        const result = await this.sendTx(tx);

        if (result.isError) {
            throw new Error("Failed to revoke bucket permission");
        }
        return new BucketPermissionRevokedEvent();
    }*/

    async clusterGet(clusterId: number): Promise<ClusterStatus> {
        let {result, output} = await this.contract.query.clusterGet(this.address, txOptions, clusterId);
        if (!result.isOk) throw result.asErr;
        // @ts-ignore
        return output.toJSON().ok as ClusterStatus;
    }

    async nodeGet(nodeId: number): Promise<NodeStatus> {
        let {result, output} = await this.contract.query.nodeGet(this.address, txOptions, nodeId);
        if (!result.isOk) throw result.asErr;
        // @ts-ignore
        return output.toJSON().ok as NodeStatus;
    }

    protected async sendTx(tx: SubmittableExtrinsic<any>): Promise<ISubmittableResult> {
        return await new Promise(async (resolve) => {
            await this.signAndSend(tx, (result) => {
                if (result.status.isInBlock || result.status.isFinalized) {
                    resolve(result);
                }
            });
        });
    }

    private static findCreatedBucketId(events: Array<any>): string {
        const eventName = "BucketCreated";

        const event = _.find(events, ["event.identifier", eventName]);
        const id = _.get(event, "args[0]");
        return id && id.toString();
    }
}
