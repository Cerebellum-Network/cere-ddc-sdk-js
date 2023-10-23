export type AccountId = string;
export type TokenId = bigint;
export type ContractAddress = string;
export type ChainId = bigint;
export type Balance = bigint;

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
