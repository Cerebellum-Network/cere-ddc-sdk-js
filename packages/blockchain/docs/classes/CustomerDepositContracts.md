[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / CustomerDepositContracts

# Class: CustomerDepositContracts

Resolves and caches the customer-deposit ink! contract per cluster.

## Methods

### estimateGas()

> `static` **estimateGas**(`contract`, `message`, `caller`, `value`, `args`): `Promise`\<`WeightV2`\>

Dry-run the message to obtain the required WeightV2 (replaces gasLimit: -1).

#### Parameters

##### contract

`ContractPromise`

##### message

`string`

##### caller

`string`

##### value

`bigint`

##### args

`unknown`[]

#### Returns

`Promise`\<`WeightV2`\>

***

### readBalance()

> `static` **readBalance**(`contract`, `owner`): `Promise`\<`StakingInfo` \| `undefined`\>

Read a customer balance via the (camelCased) DdcBalancesFetcher::getBalance message.

#### Parameters

##### contract

`ContractPromise`

##### owner

`string`

#### Returns

`Promise`\<`StakingInfo` \| `undefined`\>
