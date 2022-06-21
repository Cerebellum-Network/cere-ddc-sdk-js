import {ClusterStatus} from "./model/ClusterStatus.js";
import {BucketPermissionRevokedEvent} from "./event/BucketPermissionRevokedEvent.js";
import {BucketCreatedEvent} from "./event/BucketCreatedEvent.js";
import {Permission} from "./model/Permission.js";
import {BucketPermissionGrantedEvent} from "./event/BucketPermissionGrantedEvent.js";
import {Options, TESTNET} from "./Options.js";
import {ApiPromise, WsProvider} from "@polkadot/api";
import {ContractPromise} from "@polkadot/api-contract";
import {Keyring} from '@polkadot/keyring';
import {KeyringPair} from "@polkadot/keyring/types";
import {SubmittableExtrinsic} from "@polkadot/api/submittable/types";
import {ISubmittableResult} from "@polkadot/types/types";
import {cryptoWaitReady} from '@polkadot/util-crypto';
import _ from "lodash";
import {NodeStatus} from "./model/NodeStatus.js";
import {cereTypes} from "./types/cere_types.js";
import {BucketStatus} from "./model/BucketStatus.js";
import {BucketStatusList} from "./model/BucketStatusList.js";

const CERE = 10_000_000_000n

const txOptions = {
    value: 0n,
    gasLimit: -1,
};

const txOptionsPay = {
    value: 10n * CERE,
    gasLimit: -1, //100_000n * MGAS,
}

export class SmartContract {
    secretPhrase: string;
    options: Options;

    account!: KeyringPair;
    contract!: ContractPromise;

    private constructor(
        secretPhrase: string,
        options: Options,
    ) {
        this.secretPhrase = secretPhrase;
        this.options = options;
    }

    static async buildAndConnect(secretPhrase: string, options: Options = TESTNET): Promise<SmartContract> {
        return new SmartContract(secretPhrase, options).connect()
    }

    async connect(): Promise<SmartContract> {
        await cryptoWaitReady();

        const keyring = new Keyring({type: 'sr25519'});
        this.account = keyring.createFromUri(this.secretPhrase, {name: 'sr25519'});

        const wsProvider = new WsProvider(this.options.rpcUrl);
        const api = await ApiPromise.create({
            provider: wsProvider,
            types: cereTypes,
        });

        this.contract = new ContractPromise(api, this.options.abi, this.options.contractAddress);
        return this
    }

    async disconnect() {
        return await this.contract.api.disconnect();
    }

    async bucketCreate(balance: bigint, bucketParams: string, clusterId: bigint): Promise<BucketCreatedEvent> {
        const tx = await this.contract.tx.bucketCreate(txOptionsPay, bucketParams, clusterId);
        const result = await this.sendTx(this.account, tx);
        // @ts-ignore
        const events = result.contractEvents || [];
        const bucketId = this.findCreatedBucketId(events);
        return new BucketCreatedEvent(BigInt(bucketId));
    }

    async bucketGet(bucketId: bigint): Promise<BucketStatus> {
        const {result, output} = await this.contract.query.bucketGet(this.account.address, txOptions, bucketId);
        if (!result.isOk) throw result.asErr;

        // @ts-ignore
        return output.toJSON().ok as BucketStatus
    }

    async bucketList(offset: bigint, limit: bigint, filterOwnerId?: string): Promise<BucketStatusList> {
        const {result, output} =
            await this.contract.query.bucketList(this.account.address, txOptions, offset, limit, filterOwnerId);
        if (!result.isOk) throw result.asErr;

        // @ts-ignore
        const [statuses, length] = output.toJSON();
        return new BucketStatusList(statuses, length);
    }

    async bucketGrantPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent> {
        const tx = await this.contract.tx.bucketGrantPermission(txOptionsPay, bucketId, grantee, permission.toString());
        const result = await this.sendTx(this.account, tx);

        if (result.isError) {
            throw new Error("Failed to grant bucket permission")
        }
        return new BucketPermissionGrantedEvent()
    }

    async bucketRevokePermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent> {
        const tx = await this.contract.tx.bucketRevokePermission(txOptionsPay, bucketId, grantee, permission.toString());
        const result = await this.sendTx(this.account, tx);

        if (result.isError) {
            throw new Error("Failed to revoke bucket permission")
        }
        return new BucketPermissionRevokedEvent()
    }

    async clusterGet(clusterId: number): Promise<ClusterStatus> {
        let {result, output} = await this.contract.query.clusterGet(this.account.address, txOptions, clusterId)
        if (!result.isOk) throw result.asErr;
        // @ts-ignore
        return output.toJSON().ok as ClusterStatus
    }

    async nodeGet(nodeId: number): Promise<NodeStatus> {
        let {result, output} = await this.contract.query.nodeGet(this.account.address, txOptions, nodeId)
        if (!result.isOk) throw result.asErr;
        // @ts-ignore
        return output.toJSON().ok as NodeStatus
    }

    async sendTx(account: KeyringPair, tx: SubmittableExtrinsic<any>): Promise<ISubmittableResult> {
        return await new Promise(async (resolve) => {
            await tx.signAndSend(account, (result) => {
                if (result.status.isInBlock || result.status.isFinalized) {
                    resolve(result);
                }
            });
        });
    }

    findCreatedId(events: Array<any>, eventName: string): string {
        const event = _.find(events, ["event.identifier", eventName]);
        const id = _.get(event, "args[0]");
        return id && id.toString();
    }

    findCreatedBucketId(events: Array<any>): string {
        return this.findCreatedId(events, "BucketCreated");
    }
}
