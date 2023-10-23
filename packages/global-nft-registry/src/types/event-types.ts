import {AccountId, Balance, ChainId, ContractAddress, TokenId} from './contract-types';

export type ContractEventArgsMap = {
    RoleGranted: {
        account: AccountId;
        role: string;
    };
    RoleRevoked: {
        account: AccountId;
        role: string;
    };
    RegistryUpdated: {
        chainId: ChainId;
        tokenContract: ContractAddress;
        tokenId: TokenId;
        owner: AccountId;
        balance: Balance;
    };
};

export type ContractEvent = keyof ContractEventArgsMap;
export type ContractEventArgs<T extends ContractEvent> = ContractEventArgsMap[T];
