# DDC Client со смарт-контрактами

Этот пример демонстрирует использование DDC Client с новой архитектурой на основе смарт-контрактов customer deposit.

## Обзор изменений

### Что изменилось

1. **Смарт-контракты вместо палетов**: Все операции с депозитами выполняются через смарт-контракт
2. **Встроенные адреса контрактов**: Адреса включены в стандартные пресеты (DEVNET, TESTNET, MAINNET)
3. **Новый метод**: `getLedger()` для получения расширенной информации о балансе
4. **Улучшенные события**: Смарт-контракт эмитирует детализированные события

### Что НЕ изменилось

- Все публичные методы DdcClient остались неизменными
- Сигнатуры методов не изменились  
- Существующий код работает без изменений (если использует стандартные пресеты)

## Использование

### Создание клиента

```typescript
import { DdcClient } from '@cere-ddc-sdk/ddc-client';
import { DEVNET } from '@cere-ddc-sdk/ddc';

// Создание клиента со встроенным адресом смарт-контракта
const client = await DdcClient.create('//Alice', DEVNET);
```

### Кастомная конфигурация

```typescript
// Если нужен собственный адрес смарт-контракта
const client = await DdcClient.create('//Alice', {
  ...DEVNET,
  customerDepositContractAddress: 'CUSTOM_CONTRACT_ADDRESS'
});
```

### Использование расширенных возможностей

```typescript
// Новый метод для получения полной информации о балансе
const ledger = await client.getLedger();
if (ledger) {
  console.log('Active balance:', ledger.active);
  console.log('Total balance:', ledger.total);
  console.log('Unlocking chunks:', ledger.unlocking);
}
```

## Примеры операций

### Базовые операции с депозитами

```typescript
const clusterId = '0x01...'; // ID кластера
const amount = 1000n; // Сумма в tokens

// Депозит средств
await client.depositBalance(clusterId, amount);

// Депозит для другого пользователя
await client.depositBalanceFor(targetAddress, clusterId, amount);

// Получение текущего депозита
const deposit = await client.getDeposit(clusterId);

// Разблокировка средств
await client.unlockDeposit(clusterId, amount);

// Вывод разблокированных средств
await client.withdrawUnlockedDeposit(clusterId);
```

### Расширенная информация о балансе

```typescript
// Получение полной информации о депозите
const ledger = await client.getLedger();
if (ledger) {
  console.log('Owner:', ledger.owner);
  console.log('Total balance:', ledger.total);
  console.log('Active balance:', ledger.active);
  console.log('Unlocking chunks:', ledger.unlocking);
}
```

## События смарт-контракта

Смарт-контракт customer deposit эмитирует следующие события для мониторинга операций:

| Событие | Описание | Поля |
|---------|----------|------|
| `DdcBalanceDeposited` | Депозит средств | `cluster_id`, `owner_id`, `amount` |
| `DdcBalanceUnlocked` | Разблокировка средств | `cluster_id`, `owner_id`, `amount` |
| `DdcBalanceWithdrawn` | Вывод средств | `cluster_id`, `owner_id`, `amount` |
| `DdcBalanceCharged` | Списание (DAC payouts) | `cluster_id`, `owner_id`, `charged`, `expected` |

### Интерфейсы смарт-контракта

- **DdcBalancesFetcher**: Получение информации о балансах
- **DdcBalancesDepositor**: Операции с депозитами
- **DdcPayoutsPayer**: Списания для DAC payouts

## Запуск примера

```bash
cd examples/node/smart-contract-usage
npm install
npm start
```

## Тестирование

Пример демонстрирует работу DDC Client с архитектурой смарт-контрактов. При отсутствии развернутого контракта по указанному адресу, будут показаны соответствующие ошибки.

## Развертывание на продакшн

1. Убедитесь что смарт-контракт customer deposit развернут в вашей сети
2. Получите адрес контракта для каждого кластера
3. Обновите конфигурацию DdcClient (если используете кастомный адрес)
4. Протестируйте все операции с депозитами
5. Настройте мониторинг событий смарт-контракта

## Кастомные смарт-контракты

Если вы используете собственный адрес смарт-контракта:

```typescript
const client = await DdcClient.create('//Alice', {
  ...DEVNET,
  customerDepositContractAddress: 'YOUR_CUSTOM_CONTRACT_ADDRESS'
});
```

Убедитесь, что контракт реализует все необходимые интерфейсы (`DdcBalancesFetcher`, `DdcBalancesDepositor`, `DdcPayoutsPayer`).