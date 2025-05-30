# Testing Guide

## Overview

The Unified Data Ingestion SDK uses a comprehensive testing strategy that includes unit tests, integration tests, and testing utilities. This guide covers the testing approach, how to run tests, and how to contribute test cases.

## Test Architecture

### 1. Testing Layers

```
┌─────────────────────────────────────────┐
│           Integration Tests             │  ← End-to-end scenarios
├─────────────────────────────────────────┤
│             Unit Tests                  │  ← Individual component tests
├─────────────────────────────────────────┤
│         Testing Utilities               │  ← Mocks, fixtures, helpers
├─────────────────────────────────────────┤
│        External Dependencies           │  ← DDC Client, Activity SDK
└─────────────────────────────────────────┘
```

### 2. Testing Strategy

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions and real workflows
- **Mock Strategy**: Mock external dependencies while using real module imports
- **Type Safety**: Maintain TypeScript type safety throughout tests

## Running Tests

### Prerequisites

```bash
# Navigate to the unified package
cd packages/unified

# Install dependencies (if not already installed)
npm install
```

### Run All Tests

```bash
# From the cere-ddc-sdk-js root directory
./node_modules/.bin/jest packages/unified/src/__tests__ --config=packages/unified/jest.config.ts
```

### Run Specific Test Suites

```bash
# Run only RulesInterpreter tests
./node_modules/.bin/jest packages/unified/src/__tests__/RulesInterpreter.test.ts

# Run only Telegram-related tests
./node_modules/.bin/jest packages/unified/src/__tests__ --testNamePattern="Telegram"

# Run with verbose output
./node_modules/.bin/jest packages/unified/src/__tests__ --verbose

# Run with coverage
./node_modules/.bin/jest packages/unified/src/__tests__ --coverage
```

### Development Mode

```bash
# Watch mode for development
./node_modules/.bin/jest packages/unified/src/__tests__ --watch

# Debug mode
./node_modules/.bin/jest packages/unified/src/__tests__ --detectOpenHandles --verbose
```

## Test Structure

### Unit Test Files

```
src/__tests__/
├── RulesInterpreter.test.ts    # Rules validation and extraction
├── Dispatcher.test.ts          # Route planning and action creation
├── Orchestrator.test.ts        # Execution engine tests
├── UnifiedSDK.test.ts          # Main SDK interface tests
├── types.test.ts               # Type validation and schema tests
├── __mocks__/                  # Mock implementations
│   ├── ddc-client.ts
│   ├── activity-events.ts
│   ├── activity-signers.ts
│   └── activity-ciphers.ts
└── setup.ts                    # Test setup configuration
```

### Test Coverage

Current test coverage includes:

- **68 test cases** across 5 test suites
- **100% pass rate** for all implemented functionality
- Coverage includes:
  - Type validation and schema testing
  - Component interaction testing
  - Error handling and edge cases
  - Telegram-specific functionality
  - Fallback mechanisms

## Component Testing Details

### 1. RulesInterpreter Tests

```typescript
describe('RulesInterpreter', () => {
  // Tests metadata validation
  it('should validate correct metadata structure');
  it('should reject invalid metadata');

  // Tests rule extraction
  it('should extract processing rules correctly');
  it('should apply default values');

  // Tests business logic
  it('should require at least one action');
  it('should handle batching decisions');
});
```

**Coverage:**

- Metadata validation with Zod schemas
- Rule extraction logic
- Default value application
- Business rule validation
- Error handling for invalid inputs

### 2. Dispatcher Tests

```typescript
describe('Dispatcher', () => {
  // Tests routing logic
  it('should create DDC-only actions for skip index mode');
  it('should create activity-only actions for viaIndex mode');
  it('should create both actions for direct + realtime mode');

  // Tests execution planning
  it('should determine correct execution modes');
  it('should set priority levels correctly');
  it('should handle encryption options');
});
```

**Coverage:**

- Route planning algorithms
- Action creation logic
- Priority and option handling
- Execution mode determination
- Payload optimization

### 3. Orchestrator Tests

```typescript
describe('Orchestrator', () => {
  // Tests initialization
  it('should initialize DDC client successfully');
  it('should initialize Activity SDK when config provided');
  it('should handle initialization failures gracefully');

  // Tests execution strategies
  it('should execute sequential actions');
  it('should execute parallel actions');
  it('should handle mixed success/failure scenarios');

  // Tests fallback mechanisms
  it('should fallback to DDC when Activity SDK fails');
});
```

**Coverage:**

- Component initialization
- Sequential and parallel execution
- Error handling and recovery
- Fallback mechanisms
- Resource management

### 4. UnifiedSDK Tests

```typescript
describe('UnifiedSDK', () => {
  // Tests public API
  it('should write Telegram events successfully');
  it('should write Telegram messages successfully');
  it('should handle generic data writing');

  // Tests lifecycle management
  it('should provide status information');
  it('should handle cleanup properly');

  // Tests error scenarios
  it('should handle initialization failures');
  it('should provide meaningful error messages');
});
```

**Coverage:**

- Public API functionality
- Telegram-specific methods
- Status and health checking
- Error propagation
- Configuration validation

### 5. Types and Schema Tests

```typescript
describe('Types and Schemas', () => {
  // Tests schema validation
  it('should validate correct write modes');
  it('should reject invalid configurations');

  // Tests type inference
  it('should infer correct TypeScript types');
  it('should provide helpful error messages');

  // Tests business rules
  it('should enforce business logic constraints');
});
```

**Coverage:**

- Zod schema validation
- TypeScript type safety
- Business rule enforcement
- Error message quality
- Edge case handling

## Mocking Strategy

### External Dependencies

The SDK mocks external dependencies while maintaining type safety:

```typescript
// Mock DDC Client
jest.mock('@cere-ddc-sdk/ddc-client', () => ({
  DdcClient: {
    create: jest.fn(),
  },
  DagNode: jest.fn(),
  File: jest.fn(),
}));

// Mock Activity SDK
jest.mock('@cere-activity-sdk/events', () => ({
  EventDispatcher: jest.fn(),
  ActivityEvent: jest.fn(),
}));
```

### Mock Configuration

```typescript
// Jest configuration uses moduleNameMapper
moduleNameMapper: {
  '@cere-ddc-sdk/ddc-client': '<rootDir>/src/__tests__/__mocks__/ddc-client.ts',
  '@cere-activity-sdk/events': '<rootDir>/src/__tests__/__mocks__/activity-events.ts',
  // ... other mappings
}
```

### Mock Implementation Example

```typescript
// __mocks__/ddc-client.ts
export const DdcClient = {
  create: jest.fn(),
};

export const DagNode = jest.fn();
export const File = jest.fn();
```

## Integration Testing

### Manual Integration Tests

For testing with real services:

```typescript
// Create test configuration
const realConfig = {
  ddcConfig: {
    signer: '//Alice',
    bucketId: BigInt(12345),
    network: 'testnet' as const,
  },
  activityConfig: {
    keyringUri: '//Alice',
    appId: 'test-unified-sdk',
    endpoint: 'https://api.stats.testnet.cere.network',
    appPubKey: 'test-key',
    dataServicePubKey: 'test-service-key',
  },
};

// Test real integration
const sdk = new UnifiedSDK(realConfig);
await sdk.initialize();

const response = await sdk.writeTelegramEvent({
  eventType: 'test_event',
  userId: 'test_user',
  eventData: { test: true },
  timestamp: new Date(),
});

console.log('Integration test result:', response);
```

### Test Data Management

```typescript
// Test fixtures
const testTelegramEvent: TelegramEventData = {
  eventType: 'quest_completed',
  userId: 'test_user_123',
  chatId: 'test_chat_456',
  eventData: {
    questId: 'daily_checkin',
    points: 100,
    completed: true,
  },
  timestamp: new Date('2024-01-01T12:00:00Z'),
};

const testTelegramMessage: TelegramMessageData = {
  messageId: 'msg_123',
  chatId: 'chat_456',
  userId: 'user_789',
  messageText: 'Hello, world!',
  messageType: 'text',
  timestamp: new Date('2024-01-01T12:00:00Z'),
};
```

## Test Utilities

### Custom Matchers

```typescript
// Jest custom matchers for better assertions
expect.extend({
  toBeValidUnifiedResponse(received) {
    const pass =
      received.success !== undefined && received.transactionId && Array.isArray(received.results) && received.metadata;

    return {
      message: () => `Expected ${received} to be a valid UnifiedResponse`,
      pass,
    };
  },
});

// Usage
expect(response).toBeValidUnifiedResponse();
```

### Helper Functions

```typescript
// Test helpers
function createMockSDK(overrides: Partial<UnifiedSDKConfig> = {}) {
  const defaultConfig: UnifiedSDKConfig = {
    ddcConfig: {
      signer: '//Alice',
      bucketId: BigInt(12345),
      network: 'testnet',
    },
    ...overrides,
  };

  return new UnifiedSDK(defaultConfig);
}

function createTestLogger() {
  return jest.fn();
}
```

## Testing Best Practices

### 1. Test Organization

```typescript
describe('Component', () => {
  let component: Component;
  let mockDependency: jest.Mock;

  beforeEach(() => {
    mockDependency = jest.fn();
    component = new Component(mockDependency);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('method', () => {
    it('should handle normal case', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```

### 2. Async Testing

```typescript
it('should handle async operations', async () => {
  const promise = sdk.writeTelegramEvent(eventData);

  // Test promise state
  expect(promise).toBeInstanceOf(Promise);

  // Test resolved value
  const result = await promise;
  expect(result.success).toBe(true);
});
```

### 3. Error Testing

```typescript
it('should throw meaningful errors', async () => {
  const invalidData = {
    /* invalid structure */
  };

  await expect(sdk.writeTelegramEvent(invalidData)).rejects.toThrow(UnifiedSDKError);

  await expect(sdk.writeTelegramEvent(invalidData)).rejects.toMatchObject({
    code: 'VALIDATION_FAILED',
    component: 'RulesInterpreter',
  });
});
```

### 4. Mock Verification

```typescript
it('should call external dependencies correctly', async () => {
  await sdk.writeTelegramEvent(eventData);

  expect(mockEventDispatcher.dispatchEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'telegram.event',
      data: expect.any(Object),
    }),
  );

  expect(mockEventDispatcher.dispatchEvent).toHaveBeenCalledTimes(1);
});
```

## Continuous Testing

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Unified SDK
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: ./node_modules/.bin/jest packages/unified/src/__tests__ --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

### Local Testing Automation

```bash
#!/bin/bash
# scripts/test-unified.sh

echo "Running Unified SDK tests..."

# Run linting
npx eslint packages/unified/src/**/*.ts

# Run type checking
npx tsc --noEmit --project packages/unified/tsconfig.json

# Run unit tests
./node_modules/.bin/jest packages/unified/src/__tests__ --coverage

echo "All tests completed!"
```

## Adding New Tests

### 1. Component Tests

When adding a new component:

1. Create a new test file: `src/__tests__/NewComponent.test.ts`
2. Follow the existing test structure
3. Mock external dependencies
4. Test public interface thoroughly
5. Include error scenarios

### 2. Integration Tests

When adding integration tests:

1. Use real configuration (but safe test data)
2. Test actual SDK workflows
3. Verify external service interactions
4. Include cleanup procedures

### 3. Test Documentation

For each test:

1. Use descriptive test names
2. Include comments for complex scenarios
3. Document expected behaviors
4. Reference related components

## Debugging Tests

### Common Issues

1. **Mock not working**: Check moduleNameMapper configuration
2. **TypeScript errors**: Ensure mock types match real interfaces
3. **Async issues**: Use `await` or return promises properly
4. **Test isolation**: Clear mocks between tests

### Debug Commands

```bash
# Run with debug output
node --inspect-brk ./node_modules/.bin/jest packages/unified/src/__tests__

# Run single test with verbose output
./node_modules/.bin/jest --testNamePattern="specific test" --verbose

# Check test coverage
./node_modules/.bin/jest packages/unified/src/__tests__ --coverage --collectCoverageFrom="src/**/*.ts"
```

This testing guide provides comprehensive coverage of the testing approach, utilities, and best practices for the Unified Data Ingestion SDK.
