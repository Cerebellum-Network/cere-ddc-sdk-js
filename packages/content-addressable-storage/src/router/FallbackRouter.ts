import {v4 as uuid} from 'uuid';
import {SmartContract, SmartContractOptions} from '@cere-ddc-sdk/smart-contract';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import {randomUint8} from '@cere-ddc-sdk/core';

import {Link} from '../models/Link';
import {PieceUri} from '../models/PieceUri';
import {Route} from './Route';
import {RouterInterface} from './types';
import {Session} from '../ca-create-options';

export class FallbackRouter implements RouterInterface {
    private nodeUrlPromise?: Promise<string>;

    constructor(
        private clusterAddress: string | number,
        private smartContract: SmartContractOptions,
        private session?: Session | null,
    ) {
        console.log('Fallback router mode');
    }

    private async detectNodeUrl() {
        if (typeof this.clusterAddress === 'string') {
            return this.clusterAddress;
        }

        const smartContract = await SmartContract.buildAndConnect(mnemonicGenerate(), this.smartContract);

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

            return new URL(cdnNode.cdnNodeParams.url).href;
        } finally {
            await smartContract.disconnect();
        }
    }

    private getNodeUrl() {
        this.nodeUrlPromise ||= this.detectNodeUrl();

        return this.nodeUrlPromise;
    }

    private async getFallbackRoute() {
        const nodeUrl = await this.getNodeUrl();
        const requestId = uuid();
        const sessionId = this.session?.toString() || uuid();

        return new Route(requestId, {
            fallbackNodeUrl: nodeUrl,
            fallbackSessionId: sessionId,
        });
    }

    async getReadRoute(uri: PieceUri) {
        return this.getFallbackRoute();
    }

    async getSearchRoute(bucketId: bigint) {
        return this.getFallbackRoute();
    }

    async getStoreRoute(uri: PieceUri, links: Link[]) {
        return this.getFallbackRoute();
    }
}
