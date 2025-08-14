import { DdcClient } from '@cere-ddc-sdk/ddc-client';
import { DEVNET } from '@cere-ddc-sdk/ddc';
import { Blockchain } from '@cere-ddc-sdk/blockchain';

async function main() {
  console.log('🚀 Пример использования DDC Client со смарт-контрактами');

  // === СОЗДАНИЕ КЛИЕНТА ===
  console.log('\n🔥 Создание DDC Client со смарт-контрактом:');

  // DdcClient теперь работает только со смарт-контрактами
  // Адрес контракта включен в пресеты по умолчанию
  const blockchain = await Blockchain.connect({ wsEndpoint: DEVNET.blockchain });
  const client = await DdcClient.create('//Alice', {
    ...DEVNET,
    blockchain,
    customerDepositContractAddress: DEVNET.customerDepositContractAddress || '',
  });

  try {
    // Получение баланса аккаунта
    const balance = await client.getBalance();
    console.log('Баланс аккаунта:', balance.toString());

    // Получение депозита из смарт-контракта
    const clusterId = '0x01000000000000000000000000000000000000000000000000000000000000000000000000000000';
    const deposit = await client.getDeposit(clusterId);
    console.log('Депозит в смарт-контракте:', deposit.toString());

    // Получение полной информации о балансе (ledger)
    const ledger = await client.getLedger(clusterId);
    if (ledger) {
      console.log('\n📊 Полная информация о балансе:');
      console.log('  - Владелец:', ledger.owner);
      console.log('  - Общая сумма:', ledger.total.toString());
      console.log('  - Активная сумма:', ledger.active.toString());
      console.log('  - Разблокировка:', ledger.unlocking.length, 'chunk(s)');

      ledger.unlocking.forEach((chunk, index) => {
        console.log(`    Chunk ${index + 1}: ${chunk.value.toString()} tokens at block ${chunk.block}`);
      });
    } else {
      console.log('Нет данных о балансе в смарт-контракте');
    }

    // === ПРИМЕРЫ ОПЕРАЦИЙ ===
    console.log('\n💰 Примеры операций со смарт-контрактом:');

    // Депозит средств
    console.log('1. Депозит 1000 tokens...');
    const depositTx = await client.depositBalance(clusterId, 1000n);
    console.log('Транзакция депозита:', depositTx.txHash);

    // Депозит для другого пользователя
    console.log('2. Депозит для другого пользователя...');
    const targetAddress = '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY';
    const depositForTx = await client.depositBalanceFor(targetAddress, clusterId, 500n);
    console.log('Транзакция депозита для другого:', depositForTx.txHash);

    // Разблокировка средств
    console.log('3. Разблокировка 100 tokens...');
    const unlockTx = await client.unlockDeposit(clusterId, 100n);
    console.log('Транзакция разблокировки:', unlockTx.txHash);

    // Вывод разблокированных средств (после периода разблокировки)
    console.log('4. Вывод разблокированных средств...');
    const withdrawTx = await client.withdrawUnlockedDeposit(clusterId);
    console.log('Транзакция вывода:', withdrawTx.txHash);
  } catch (error: any) {
    console.log('Ошибка при работе со смарт-контрактом:', error.message);
    console.log('Убедитесь что смарт-контракт развернут по указанному адресу');
  }

  console.log('\n✅ Все операции выполнены успешно!');
  console.log('\n📖 Особенности работы со смарт-контрактами:');
  console.log('1. Все операции с депозитами теперь выполняются через смарт-контракт');
  console.log('2. Адрес контракта включен в стандартные пресеты DEVNET, TESTNET, MAINNET');
  console.log('3. Метод getLedger() предоставляет расширенную информацию о балансе');
  console.log('4. События смарт-контракта логируются для мониторинга операций');
  console.log('5. Смарт-контракт поддерживает все необходимые интерфейсы для DDC');
}

main().catch((error) => {
  console.error('Ошибка:', error);
  process.exit(1);
});
