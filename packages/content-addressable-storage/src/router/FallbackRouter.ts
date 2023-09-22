import {v4 as uuid} from 'uuid';
import {SmartContract, SmartContractOptions} from '@cere-ddc-sdk/smart-contract';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import {randomUint8} from '@cere-ddc-sdk/core';

import {Link} from '../models/Link';
import {PieceUri} from '../models/PieceUri';
import {Route, RouteOperation} from './Route';
import {RouterInterface} from './types';
import {Session} from '../ca-create-options';

type NodeInfo = {
    nodeUrl: string;
    workerAddress: string;
};

export class FallbackRouter implements RouterInterface {
    private nodeInfoPromise?: Promise<NodeInfo>;

    constructor(
        private clusterAddress: string | number,
        private smartContract: SmartContractOptions | SmartContract,
        private session?: Session | null,
    ) {}

    private async detectNodeInfo(): Promise<NodeInfo> {
        const isExternalContract = this.smartContract instanceof SmartContract;

        if (typeof this.clusterAddress === 'string') {
            return {
                nodeUrl: this.clusterAddress,
                workerAddress: '', // Cannot detect workerAddress in this case
            };
        }

        const smartContract =
            this.smartContract instanceof SmartContract
                ? this.smartContract
                : await SmartContract.buildAndConnect(mnemonicGenerate(), this.smartContract);

        try {
            const {cluster} = await smartContract.clusterGet(this.clusterAddress);

            if (cluster.cdnNodesKeys.length === 0) {
                throw new Error(`unable to find cdn nodes in cluster='${this.clusterAddress}'`);
            }

            const index = randomUint8(cluster.cdnNodesKeys.length);
            const cdnNodeKey = cluster.cdnNodesKeys[index];
            const {cdnNode} = await smartContract.cdnNodeGet(cdnNodeKey);

            if (!cdnNode.cdnNodeParams.url) {
                throw new Error(`unable to get CDN node URL. Node key '${cdnNodeKey}'`);
            }

            return {
                nodeUrl: new URL(cdnNode.cdnNodeParams.url).href,
                workerAddress: cdnNodeKey,
            };
        } finally {
            if (!isExternalContract) {
                await smartContract.disconnect();
            }
        }
    }

    private getNodeInfo() {
        this.nodeInfoPromise ||= this.detectNodeInfo();

        return this.nodeInfoPromise;
    }

    private async getFallbackRoute(opCode: RouteOperation) {
        const {nodeUrl, workerAddress} = await this.getNodeInfo();
        const requestId = uuid();
        const sessionId = this.session?.toString() || uuid();

        return new Route(requestId, opCode, {
            fallbackNodeUrl: nodeUrl,
            fallbackSessionId: sessionId,
            fallbackWorkerAddress: workerAddress,
        });
    }

    async getReadRoute(uri: PieceUri) {
        return this.getFallbackRoute(RouteOperation.READ);
    }

    async getSearchRoute(bucketId: bigint) {
        return this.getFallbackRoute(RouteOperation.SEARCH);
    }

    async getStoreRoute(uri: PieceUri, links: Link[]) {
        return this.getFallbackRoute(RouteOperation.STORE);
    }
}
