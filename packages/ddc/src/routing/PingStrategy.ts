import { fetch } from 'cross-fetch';
import { Deferred, DeferredState } from '@protobuf-ts/runtime-rpc';

import { PING_BACKGROUND_DELAY, PING_LATENCY_GROUP, PING_THRESHOLD, PING_THRESHOLD_INC } from '../constants';
import { RouterOperation, RouterNode } from '.';
import { NodeTypeStrategy } from './NodeTypeStrategy';
import { shuffle } from './RandomStrategy';

type PingRecord = {
  node: RouterNode;
  isDone: Deferred<boolean>;
  latency?: number;
};

export abstract class PingStrategy extends NodeTypeStrategy {
  private nodesMap = new Map<RouterNode['httpUrl'], PingRecord>();

  private getPingedNodes(state?: DeferredState) {
    const pings = Array.from(this.nodesMap.values());
    const foundPings = pings.filter(({ isDone }) =>
      state ? isDone.state === state : isDone.state !== DeferredState.REJECTED,
    );

    return foundPings.map(({ node }) => node);
  }

  private async ping(record: PingRecord): Promise<PingRecord> {
    const start = Date.now();
    const pingUrl = new URL('/info', record.node.httpUrl);

    try {
      const response = await fetch(pingUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      this.logger.warn('Node ping %s failed with error %s', record.node.httpUrl, err);

      throw err;
    }

    record.latency = Date.now() - start;
    this.logger.info('Node ping completed %s with latency %d ms', record.node.httpUrl, record.latency);

    return record;
  }

  private enqueuePing(node: RouterNode) {
    const existingPing = this.nodesMap.get(node.httpUrl);

    if (existingPing) {
      return existingPing;
    }

    const isDone = new Deferred<boolean>();
    const pingRecord: PingRecord = { node, isDone };

    this.nodesMap.set(node.httpUrl, pingRecord);
    this.ping(pingRecord)
      .then(() => isDone.resolve(true))
      .catch((err) => isDone.reject(err));

    return isDone.promise;
  }

  async marshalNodes(operation: RouterOperation, allNodes: RouterNode[]): Promise<RouterNode[]> {
    const pingedNodes = await super.marshalNodes(operation, this.getPingedNodes());
    const allOperationNodes = await super.marshalNodes(operation, allNodes);
    const notPingedNodes = allOperationNodes.filter((node) => !this.nodesMap.has(node.httpUrl));
    const toPingSync = notPingedNodes.splice(0, Math.max(0, PING_THRESHOLD - pingedNodes.length));
    const toPingAsync = notPingedNodes.splice(0, PING_THRESHOLD_INC);
    const syncPings = [...this.getPingedNodes(), ...toPingSync].map((node) => this.enqueuePing(node));

    /**
     * Wait for all sync pings to complete
     */
    await Promise.allSettled(syncPings);

    /**
     * After a short delay, start async pings in background
     */
    setTimeout(() => toPingAsync.forEach((node) => this.enqueuePing(node)), PING_BACKGROUND_DELAY);

    /**
     * Shuffle nodes and sort by latency levels
     */
    const latencySortedNodes = shuffle(this.getPingedNodes(DeferredState.RESOLVED)).sort((a, b) => {
      const pingA = this.nodesMap.get(a.httpUrl)!;
      const pingB = this.nodesMap.get(b.httpUrl)!;

      /**
       * Group latency by PING_LATENCY_GROUP ms levels to avaoid sorting by small differences
       */
      const levelA = Math.ceil(pingA.latency! / PING_LATENCY_GROUP);
      const levelB = Math.ceil(pingB.latency! / PING_LATENCY_GROUP);

      return levelA - levelB;
    });

    return super.marshalNodes(operation, latencySortedNodes);
  }
}
