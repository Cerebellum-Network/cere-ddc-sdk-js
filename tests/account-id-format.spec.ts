import {EvmAddress, AccountId} from '@cere-ddc-sdk/global-nft-registry/src/types';
import {accountIdToAddress, addressToAccountId} from '@cere-ddc-sdk/global-nft-registry';

const evmAddress: EvmAddress = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
const accountId: AccountId = '0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d';

describe('addressToAccountId', () => {
    it('should convert an EVM address to a Substrate account ID', () => {
        expect(addressToAccountId(evmAddress)).toEqual(accountId);
    });
});

describe('accountIdToAddress', () => {
    it('should convert a Substrate account ID to an EVM address', () => {
        expect(accountIdToAddress(accountId)).toEqual(evmAddress);
    });
});
