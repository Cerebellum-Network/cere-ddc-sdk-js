import {Codec} from '@polkadot/types/types';

export type AccountId = string;
export type TokenId = bigint;
export type ContractAddress = string;
export type ChainId = bigint;
export type Balance = bigint;
export type Offset = bigint;

export enum Role {
    TrustedService,
}

export interface AccessControl {
    account: AccountId;
    role: Role;
}

export interface TokenOwner {
    chainId: ChainId;
    tokenContract: ContractAddress;
    tokenId: TokenId;
    owner: AccountId;
}

/**
 * Converts Codec instance to primitive js representation
 *
 * TODO: figure out how to auto-map u64 to bigint instead of hex string
 */
export const toJs = (codec: Codec) => {
    return codec.toJSON();
};
