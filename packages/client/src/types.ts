import { CereWalletSigner, JsonSigner, UriSigner } from '@cere-activity-sdk/signers';
import { EmbedWallet } from '@cere/embed-wallet';

export type ContextInput = {
  agentService: string;
  workspace: string;
  stream: string;
};

export type ContextInterface = {
  agent_service: string;
  workspace: string;
  stream: string;
};

export type SignedWallet = JsonSigner | UriSigner | CereWalletSigner;
export type WalletConfig = JsonSigner | EmbedWallet;

export type ClientConfig = {
  context: ContextInterface;
  url: string;
  eventRuntimeUrl?: string;
  agentRuntimeUrl?: string;
  webTransportUrl?: string;
  sisUrl?: string;
  wallet?: WalletConfig | string;
};

export class CubbyError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string | number,
  ) {
    super(message);
    this.name = 'CubbyRequestError';
  }
}
