import { v4 as uuid } from 'uuid';
import pkg from 'blakejs';
import { JsonSigner, UriSigner, CereWalletSigner } from '@cere-activity-sdk/signers';
import type { ClientConfig } from './types';
const { blake2bHex } = pkg;

type EventOptions = {
  id?: string;
  timestamp?: Date;
};

export type ActivityEventPayload = Record<string, any>;

class Event {
  readonly id: string;
  readonly timestamp: string;
  readonly signer: CereWalletSigner | JsonSigner | UriSigner;
  readonly context: ClientConfig['context'];
  constructor(
    readonly payload: ActivityEventPayload = {},
    signer: JsonSigner | UriSigner | CereWalletSigner,
    context: ClientConfig['context'],
    options: EventOptions = {},
  ) {
    this.id = options.id ?? uuid();
    this.payload = payload;
    this.signer = signer;
    this.context = context;
    this.timestamp = (options.timestamp ?? new Date()).toISOString();
  }
  async body() {
    // Canonical message: Blake2b-256(id + event_type + timestamp)
    // The "0x" prefix ensures the Polkadot signer hex-decodes the hash to 32 raw bytes,
    // matching the server-side CanonicalMessage() which verifies against raw Blake2b-256 bytes.
    const message = blake2bHex([this.id, this.payload.event_type, this.timestamp].join(''), undefined, 32);
    const signature = await this.signer.sign('0x' + message);
    return {
      id: this.id,
      timestamp: this.timestamp,
      ...this.payload,
      account_id: this.signer.publicKey,
      app_id: this.context.agent_service,
      signature,
    };
  }
}

export default Event;
