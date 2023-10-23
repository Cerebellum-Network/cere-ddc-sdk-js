import {AccountId, Role} from './contract-types';

export interface GlobalNftRegistryInterface {
    connect(): Promise<this>;
    disconnect(): Promise<void>;

    /**
     * - Requires TrustedService role
     * - Emits RegistryUpdated event
     * - Updates the balance of an owner in the registry directly, without transferring the token. This will override any existing balances
     * @param chainId The chain ID of the chain on which the token exists
     * @param tokenContract The address of the token contract
     * @param tokenId The ID of the token
     * @param owner The address of the owner
     * @param balance The new balance of the owner
     */
    updateRegistry(
        chainId: bigint,
        tokenContract: string,
        tokenId: bigint,
        owner: string,
        balance: bigint,
    ): Promise<void>;

    /**
     * - Requires TrustedService role
     * - Emits RegistryUpdated event for each of the from and to addresses
     * - Transfers a token to a new owner
     * - Supports Mint events (from the zero address) and Burn events (to the zero address)
     * @param chainId The chain ID of the chain on which the token exists
     * @param tokenContract The address of the token contract
     * @param tokenId The ID of the token
     * @param from The address of the current owner
     * @param to The address of the new owner
     * @param amount The amount to transfer
     */
    transfer(
        chainId: bigint,
        tokenContract: string,
        tokenId: bigint,
        from: AccountId,
        to: string,
        amount: bigint,
    ): Promise<void>;

    /**
     * Check the balance of an owner in the registry
     * @param chainId The chain ID of the chain on which the token exists
     * @param tokenContract The address of the token contract
     * @param tokenId The ID of the token
     * @param owner The address of the owner
     * @returns The balance of the owner
     */
    getBalance(chainId: bigint, tokenContract: string, tokenId: bigint, owner: AccountId): Promise<bigint>;

    /**
     * Check if an account is the owner of a token
     * @param chainId The chain ID of the chain on which the token exists
     * @param tokenContract The address of the token contract
     * @param tokenId The ID of the token
     * @param owner The address of the owner
     * @returns True if the account is the owner, false otherwise
     */
    isOwner(chainId: bigint, tokenContract: string, tokenId: bigint, owner: AccountId): Promise<boolean>;

    /**
     * - Requires being called by the contract owner/administrator
     * - Emits RoleGranted event
     * - Grants a new role to an account
     * @param role The role to grant
     * @param account The address of the account to grant the role to
     */
    grantRole(role: Role, account: AccountId): Promise<void>;

    /**
     * - Requires being called by the contract owner/administrator
     * - Emits RoleRevoked event
     * - Revokes a role from an account
     * @param role The role to revoke
     * @param account The address of the account to revoke the role from
     */
    revokeRole(role: Role, account: AccountId): Promise<void>;

    /**
     * Check if an account has a role
     * @param role The role to check
     * @param account The address of the account to check
     * @returns True if the account has the role, false otherwise
     */
    hasRole(role: Role, account: AccountId): Promise<boolean>;
}
