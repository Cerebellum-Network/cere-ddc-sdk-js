# Testing Guide: Unified Data Ingestion SDK

## Overview

This guide provides comprehensive instructions for testing the `@cere-ddc-sdk/unified` package, including unit tests, integration tests, and real-world testing with credentials.

## Table of Contents

1. [Quick Start Testing](#quick-start-testing)
2. [Unit Tests](#unit-tests)
3. [Integration Testing](#integration-testing)
4. [Real-world Testing with Credentials](#real-world-testing-with-credentials)
5. [Test Environment Setup](#test-environment-setup)
6. [Common Test Scenarios](#common-test-scenarios)
7. [Troubleshooting Tests](#troubleshooting-tests)
8. [Continuous Integration](#continuous-integration)

## Quick Start Testing

### Prerequisites

```bash
# Install dependencies
npm install

# Install global testing tools (if needed)
npm install -g jest npm-run-all microbundle
```

### Run All Tests

```bash
# Run unit tests
npm test

# Build the package
npm run build

# Run integration tests (requires credentials)
node test-credentials.js
```

## Unit Tests

### Test Structure

The package includes comprehensive unit tests covering all components:

```
src/__tests__/
├── UnifiedSDK.test.ts          # Main SDK functionality (18 tests)
├── RulesInterpreter.test.ts    # Metadata validation (8 tests)
├── Dispatcher.test.ts          # Action routing (14 tests)
├── Orchestrator.test.ts        # Execution engine (14 tests)
├── types.test.ts              # Schema validation (14 tests)
├── setup.ts                   # Test configuration
└── __mocks__/                 # Mock dependencies
    ├── ddc-client.ts
    ├── activity-events.ts
    ├── activity-signers.ts
    └── activity-ciphers.ts
```

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- UnifiedSDK.test.ts

# Run tests with verbose output
npm test -- --verbose
```

### Unit Test Examples

#### Testing UnifiedSDK

```typescript
describe('UnifiedSDK', () => {
  test('should initialize successfully', async () => {
    const sdk = new UnifiedSDK(mockConfig);
    await sdk.initialize();
    expect(sdk.getStatus().initialized).toBe(true);
  });

  test('should process data successfully', async () => {
    const sdk = new UnifiedSDK(mockConfig);
    await sdk.initialize();

    const result = await sdk.writeData(
      { test: 'data' },
      { processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'realtime' } },
    );

    expect(result.status).toBe('success');
    expect(result.transactionId).toBeDefined();
  });
});
```

#### Testing RulesInterpreter

```typescript
describe('RulesInterpreter', () => {
  test('should validate metadata correctly', () => {
    const interpreter = new RulesInterpreter();
    const metadata = {
      processing: {
        dataCloudWriteMode: 'viaIndex',
        indexWriteMode: 'realtime',
      },
    };

    expect(() => interpreter.validateMetadata(metadata)).not.toThrow();
  });

  test('should extract processing rules', () => {
    const interpreter = new RulesInterpreter();
    const rules = interpreter.extractProcessingRules(validMetadata);

    expect(rules.dataCloudAction).toBe('write_via_index');
    expect(rules.indexAction).toBe('write_realtime');
  });
});
```

### Test Configuration

The Jest configuration includes:

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30_000,
  moduleNameMapping: {
    '@cere-ddc-sdk/ddc-client': '<rootDir>/src/__tests__/__mocks__/ddc-client.ts',
    '@cere-activity-sdk/events': '<rootDir>/src/__tests__/__mocks__/activity-events.ts',
    // ... other mocks
  },
};
```

## Integration Testing

### Integration Test Setup

Integration tests verify the SDK works with real external services but use mocked dependencies to ensure reliability.

### Mocked Dependencies

The test suite uses comprehensive mocks:

```typescript
// __mocks__/ddc-client.ts
export const mockDdcClient = {
  store: jest.fn().mockResolvedValue(mockCid),
  disconnect: jest.fn().mockResolvedValue(undefined),
};

// __mocks__/activity-events.ts
export const mockActivityEvent = {
  id: 'test-event-id',
  dispatchEvent: jest.fn().mockResolvedValue(true),
};
```

### Integration Test Examples

```typescript
describe('Integration Tests', () => {
  test('should handle DDC and Activity SDK together', async () => {
    const sdk = new UnifiedSDK(testConfig);
    await sdk.initialize();

    const result = await sdk.writeData(testPayload, {
      processing: {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
      },
    });

    expect(result.status).toBe('success');
    expect(result.dataCloudHash).toBeDefined();
    expect(result.indexId).toBeDefined();
  });
});
```

## Real-world Testing with Credentials

### Credentials Setup

1. **Copy the test template:**

```bash
cp test-credentials.js my-test-credentials.js
```

2. **Replace placeholders with your credentials:**

```javascript
const config = {
  ddcConfig: {
    signer: 'your twelve word mnemonic phrase here',
    bucketId: BigInt(573409), // Your bucket ID
    clusterId: BigInt('0x825c4b2352850de9986d9d28568db6f0c023a1e3'), // Your cluster ID
    network: 'testnet',
  },
  activityConfig: {
    endpoint: 'https://ai-event.stage.cere.io', // Your endpoint
    keyringUri: 'your twelve word mnemonic phrase here', // Same as signer
    appId: '2621', // Your app ID
    appPubKey: '0x367bd16b9fa69acc8d769add1652799683d68273eae126d2d4bae4d7b8e75bb6',
    dataServicePubKey: '0x8225bda7fc68c17407e933ba8a44a3cbb31ce933ef002fb60337ff63c952b932',
  },
  // ... rest of config
};
```

### Credential Sources

**DDC Access:**

- Mnemonic: Your 12-word recovery phrase
- Bucket ID: Provided by Cere team
- Cluster ID: Provided by Cere team
- Network: `'testnet'` for testing

**Activity SDK Access:**

- App ID: Provided by Cere team
- Endpoint: Activity service URL
- Public Keys: App and data service keys

### Running Real-world Tests

```bash
# Build first
npm run build

# Run with your credentials
node my-test-credentials.js

# Expected output:
# 🚀 Testing Unified SDK with testnet credentials
# 📋 Initializing SDK...
# ✅ SDK initialized successfully
# 📝 Test 1: Simple data ingestion to DDC
# ✅ Test 1 Result: { transactionId: 'txn_...', status: 'success', ... }
# ...
# 🎉 All tests completed successfully!
```

## Test Environment Setup

### Development Environment

```bash
# Clone repository
git clone <repository-url>
cd cere-ddc-sdk-js/packages/unified

# Install dependencies
npm install

# Run tests
npm test
```

### CI/CD Environment

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
```

### Docker Environment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
RUN npm test

CMD ["node", "test-credentials.js"]
```

## Common Test Scenarios

### 1. Basic Data Ingestion

```typescript
const testBasicIngestion = async () => {
  const sdk = new UnifiedSDK(config);
  await sdk.initialize();

  const result = await sdk.writeData(
    { userId: 'test-123', action: 'click' },
    {
      processing: {
        dataCloudWriteMode: 'direct',
        indexWriteMode: 'realtime',
      },
    },
  );

  console.log('Result:', result);
};
```

### 2. Telegram Event Processing

```typescript
const testTelegramEvent = async () => {
  const sdk = new UnifiedSDK(config);
  await sdk.initialize();

  const event = {
    eventType: 'quest_completed',
    userId: 'telegram-user-123',
    chatId: 'chat-456',
    eventData: { questId: 'daily-login', points: 100 },
    timestamp: new Date(),
  };

  const result = await sdk.writeTelegramEvent(event, {
    priority: 'high',
    writeMode: 'realtime',
  });

  console.log('Telegram event result:', result);
};
```

### 3. Error Handling

```typescript
const testErrorHandling = async () => {
  const sdk = new UnifiedSDK(invalidConfig);

  try {
    await sdk.initialize();
  } catch (error) {
    console.log('Expected initialization error:', error.code);
  }
};
```

### 4. Fallback Scenarios

```typescript
const testFallback = async () => {
  // Test with Activity SDK disabled
  const config = {
    ...baseConfig,
    activityConfig: undefined, // This will trigger fallback mode
  };

  const sdk = new UnifiedSDK(config);
  await sdk.initialize();

  const result = await sdk.writeData(testData, metadata);
  console.log('Fallback result:', result);
};
```

## Troubleshooting Tests

### Common Test Issues

#### 1. Module Resolution Errors

**Error:** `Cannot find module '@cere-ddc-sdk/ddc-client'`

**Solution:**

```bash
# Install missing dependencies
npm install

# Check if dependencies are built
cd ../ddc-client && npm run build
cd ../unified
```

#### 2. Network Connection Issues

**Error:** `Failed to connect to testnet`

**Solution:**

```javascript
// Check network connectivity
const testConnection = async () => {
  try {
    const response = await fetch('https://rpc.testnet.cere.network/health');
    console.log('Network accessible:', response.ok);
  } catch (error) {
    console.log('Network issue:', error.message);
  }
};
```

#### 3. Credential Issues

**Error:** `Invalid signer or authentication failed`

**Solution:**

```javascript
// Validate credentials format
const validateCredentials = (config) => {
  console.log('Signer format:', typeof config.ddcConfig.signer);
  console.log('Bucket ID type:', typeof config.ddcConfig.bucketId);
  console.log('Cluster ID type:', typeof config.ddcConfig.clusterId);
};
```

#### 4. Test Timeout Issues

**Error:** `Test exceeded 30000ms timeout`

**Solution:**

```javascript
// Increase timeout for network operations
jest.setTimeout(60000);

// Or use async/await properly
test('long running test', async () => {
  const result = await longRunningOperation();
  expect(result).toBeDefined();
}, 60000); // 60 second timeout
```

### Debug Mode

Enable debug logging:

```javascript
const config = {
  // ... other config
  logging: {
    level: 'debug',
    enableMetrics: true,
  },
};
```

### Test Data Cleanup

```javascript
afterEach(async () => {
  // Cleanup test data
  if (sdk) {
    await sdk.cleanup();
  }
});
```

## Continuous Integration

### GitHub Actions

```yaml
name: Unified SDK Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm test

      - name: Build package
        run: npm run build

      - name: Run integration tests
        run: npm run test:integration
        env:
          TEST_MNEMONIC: ${{ secrets.TEST_MNEMONIC }}
          TEST_BUCKET_ID: ${{ secrets.TEST_BUCKET_ID }}
```

### Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "node test-credentials.js",
    "test:ci": "npm run lint && npm test && npm run build"
  }
}
```

## Performance Testing

### Load Testing

```javascript
const loadTest = async () => {
  const sdk = new UnifiedSDK(config);
  await sdk.initialize();

  const startTime = Date.now();
  const promises = [];

  // Send 100 concurrent requests
  for (let i = 0; i < 100; i++) {
    promises.push(
      sdk.writeData(
        { testId: i, timestamp: Date.now() },
        { processing: { dataCloudWriteMode: 'direct', indexWriteMode: 'skip' } },
      ),
    );
  }

  const results = await Promise.allSettled(promises);
  const endTime = Date.now();

  console.log(`Processed ${results.length} requests in ${endTime - startTime}ms`);
  console.log(`Success rate: ${(results.filter((r) => r.status === 'fulfilled').length / results.length) * 100}%`);
};
```

### Memory Usage Testing

```javascript
const memoryTest = async () => {
  const memoryBefore = process.memoryUsage();

  const sdk = new UnifiedSDK(config);
  await sdk.initialize();

  // Process multiple requests
  for (let i = 0; i < 1000; i++) {
    await sdk.writeData({ data: `test-${i}` }, metadata);
  }

  await sdk.cleanup();

  const memoryAfter = process.memoryUsage();
  console.log('Memory usage delta:', {
    heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
    external: memoryAfter.external - memoryBefore.external,
  });
};
```

## Test Metrics and Reporting

### Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Test Results

Current test metrics:

- **Total Tests:** 68
- **Pass Rate:** 100%
- **Coverage:** >90% (estimated)
- **Test Files:** 5
- **Average Execution Time:** ~14 seconds

## Best Practices

### Writing Tests

1. **Use descriptive test names**
2. **Test both success and failure scenarios**
3. **Mock external dependencies**
4. **Clean up resources after tests**
5. **Use proper async/await patterns**

### Test Organization

1. **Group related tests in describe blocks**
2. **Use setup and teardown hooks**
3. **Keep tests isolated and independent**
4. **Use meaningful test data**

### Debugging Tests

1. **Use console.log for debugging**
2. **Run tests in isolation**
3. **Check network connectivity**
4. **Validate configuration**
5. **Monitor resource usage**

## Conclusion

This testing guide provides comprehensive coverage for testing the Unified Data Ingestion SDK. Follow the unit tests for development, integration tests for component verification, and real-world tests for end-to-end validation.

For questions or issues, refer to the troubleshooting section or consult the main documentation.
