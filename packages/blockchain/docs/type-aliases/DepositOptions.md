[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / DepositOptions

# Type Alias: DepositOptions

> **DepositOptions** = `object`

Options common to the deposit/withdraw builders.

## Properties

### from?

> `optional` **from?**: `AccountId`

The account that will sign the resulting extrinsic. Supplying it lets the
contract-path dry run be priced against the real, funded caller, which
yields precise gas and a correctly sized `storage_deposit_limit`. Without
it, sizing falls back to conservative ceilings — which still works, but
over-provisions gas and can misjudge the storage limit.
