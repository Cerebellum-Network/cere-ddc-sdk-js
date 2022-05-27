import {ClusterStatus} from "./model/ClusterStatus";
import {BucketPermissionRevokedEvent} from "./event/BucketPermissionRevokedEvent";
import {BucketCreatedEvent} from "./event/BucketCreatedEvent";
import {Permission} from "./model/Permission";
import {BucketPermissionGrantedEvent} from "./event/BucketPermissionGrantedEvent";
import {Options, TESTNET} from "./Options";
import {ApiPromise, WsProvider} from "@polkadot/api";
import {ContractPromise} from "@polkadot/api-contract";
import {Keyring} from '@polkadot/keyring';
import {KeyringPair} from "@polkadot/keyring/types";
import {SubmittableExtrinsic} from "@polkadot/api/submittable/types";
import {ISubmittableResult} from "@polkadot/types/types";
import {cryptoWaitReady} from '@polkadot/util-crypto';
import _ from "lodash";

const cereTypes = require("./types/cere_types.json");

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
    mnemonic: string;
    options: Options;

    account!: KeyringPair;
    contract!: ContractPromise;

    private constructor(
        mnemonic: string,
        options: Options,
    ) {
        this.mnemonic = mnemonic;
        this.options = options;
    }

    static async buildAndConnect(mnemonic: string, options: Options = TESTNET): Promise<SmartContract> {
        return new SmartContract(mnemonic, options).connect()
    }

    async connect(): Promise<SmartContract> {
        await cryptoWaitReady();

        const keyring = new Keyring({type: 'sr25519'});
        this.account = keyring.createFromUri(this.mnemonic, {name: 'sr25519'});

        const wsProvider = new WsProvider(this.options.rpcUrl);
        const api = await ApiPromise.create({
            provider: wsProvider,
            types: cereTypes,
        });

        this.contract = new ContractPromise(api, this.options.abi, this.options.contractAddress);
        return this
    }

    async bucketCreate(balance: bigint, bucketParams: string, clusterId: bigint): Promise<BucketCreatedEvent> {
        const tx = await this.contract.tx.bucketCreate(txOptionsPay, bucketParams, clusterId);
        const result = await this.sendTx(this.account, tx);
        // @ts-ignore
        const events = result.contractEvents || [];
        const bucketId = this.findCreatedBucketId(events);
        return Promise.resolve(new BucketCreatedEvent(BigInt(bucketId)))
    }

    async bucketGrantPermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionGrantedEvent> {
        const tx = await this.contract.tx.bucketGrantPermission(txOptionsPay, bucketId, grantee, permission.toString());
        const result = await this.sendTx(this.account, tx);

        if (result.isError) {
            return Promise.reject("Failed to grant bucket permission")
        }
        return Promise.resolve(new BucketPermissionGrantedEvent())
    }

    async bucketRevokePermission(bucketId: bigint, grantee: string, permission: Permission): Promise<BucketPermissionRevokedEvent> {
        const tx = await this.contract.tx.bucketRevokePermission(txOptionsPay, bucketId, grantee, permission.toString());
        const result = await this.sendTx(this.account, tx);

        if (result.isError) {
            return Promise.reject("Failed to revoke bucket permission")
        }
        return Promise.resolve(new BucketPermissionRevokedEvent())
    }

    async clusterGet(clusterId: number): Promise<ClusterStatus> {
        let {result, output} = await this.contract.query.clusterGet(this.account.address, txOptions, clusterId)
        if (!result.isOk) throw result.asErr;
        // @ts-ignore
        return output.toJSON().ok as ClusterStatus
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
