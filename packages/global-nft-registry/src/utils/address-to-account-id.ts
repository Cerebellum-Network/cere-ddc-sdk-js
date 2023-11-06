import {u8aToHex, hexToU8a} from '@polkadot/util';

/**
 * Format a 20-byte EVM address as a 32-byte Substrate account ID.
 * @param evmAddress - 20-byte EVM address.
 * @returns 32-byte Substrate account ID.
 */
export const addressToAccountId = (evmAddress: string): string => {
    // Remove the "0x" prefix and parse the address into a byte array.
    const addressBytes = hexToU8a(evmAddress);

    // Create a 32-byte array filled with zeros.
    const accountIdBytes = new Uint8Array(32);

    // Copy the EVM address at the end of the AccountId array to keep the original address in the last 20 bytes.
    accountIdBytes.set(addressBytes, 12);

    // Convert the 32-byte array back into a hex string with "0x" prefix.
    const accountId = u8aToHex(accountIdBytes, -1, true);

    return accountId;
};

/**
 * Format a 32-byte Substrate account ID as a 20-byte EVM address.
 * @param accountId - 32-byte Substrate account ID.
 * @returns 20-byte EVM address.
 */
export const accountIdToAddress = (accountId: string): string => {
    // Convert the AccountId into a byte array and extract the last 20 bytes for the EVM address.
    const accountIdBytes = hexToU8a(accountId);
    const evmAddressBytes = accountIdBytes.slice(-20);

    // Convert the 20-byte array back into a hex string with "0x" prefix.
    const evmAddress = u8aToHex(evmAddressBytes, -1, true);

    return evmAddress;
};
