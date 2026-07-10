import type { Transaction } from 'polkadot-api';
import type { PolkadotSigner } from 'polkadot-api/signer';

import type { CereApi } from './api-types.js';
import type { CereSigner } from './signers/types.js';

/** A papi transaction builder (returned by pallet write methods). */
export type Sendable = Transaction<any, any>;

export interface SendOptions {
  /** A 2a signer wrapper, or a raw papi `PolkadotSigner`. */
  signer: CereSigner | PolkadotSigner;
  nonce?: number;
}

export interface Event {
  section: string;
  method: string;
  data?: any;
  payload?: Record<string, any>;
}

export interface SendResult {
  events: Event[];
  txHash: string;
}

export interface TxApi {
  /** Sign, submit, and await finalization. Throws a decoded `Pallet.Error` on dispatch failure. */
  send(tx: Sendable, opts: SendOptions): Promise<SendResult>;
  /** Batch — one failing call does not fail the batch (Utility.batch). */
  batchSend(txs: Sendable[], opts: SendOptions): Promise<SendResult>;
  /** Batch-all — any failing call reverts the whole batch (Utility.batch_all). */
  batchAllSend(txs: Sendable[], opts: SendOptions): Promise<SendResult>;
  sudo(tx: Sendable): Sendable;
  sudoAs(who: string, tx: Sendable): Sendable;
}

function resolveSigner(signer: CereSigner | PolkadotSigner): PolkadotSigner {
  return 'getPolkadotSigner' in signer ? signer.getPolkadotSigner() : signer;
}

function shapeEvents(events: ReadonlyArray<{ type: string; value: { type: string; value: any } }>): Event[] {
  return events.map((e) => ({
    section: e.type,
    method: e.value?.type,
    data: e.value?.value,
    payload: e.value?.value,
  }));
}

export function createTxApi(api: CereApi): TxApi {
  const send = async (tx: Sendable, { signer, nonce }: SendOptions): Promise<SendResult> => {
    const res = await tx.signAndSubmit(resolveSigner(signer), nonce == null ? undefined : { nonce });
    if (!res.ok) {
      const err: any = res.dispatchError;
      const msg =
        err?.type === 'Module' && err.value?.type
          ? `${err.value.type}.${err.value.value?.type ?? ''}`
          : JSON.stringify(err);
      throw new Error(`Transaction failed: ${msg}`);
    }
    return { events: shapeEvents(res.events as any), txHash: res.txHash };
  };

  return {
    send,
    batchSend: (txs, opts) => send(api.tx.Utility.batch({ calls: txs.map((t) => t.decodedCall) }) as Sendable, opts),
    batchAllSend: (txs, opts) =>
      send(api.tx.Utility.batch_all({ calls: txs.map((t) => t.decodedCall) }) as Sendable, opts),
    sudo: (tx) => api.tx.Sudo.sudo({ call: tx.decodedCall }) as Sendable,
    sudoAs: (who, tx) =>
      api.tx.Sudo.sudo_as({ who: { type: 'Id', value: who } as any, call: tx.decodedCall }) as Sendable,
  };
}
