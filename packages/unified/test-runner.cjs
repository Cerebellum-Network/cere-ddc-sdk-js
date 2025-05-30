#!/usr/bin/env node

/**
 * Integration Test Runner for Unified SDK
 *
 * This script runs the integration tests to verify that the Activity SDK
 * integration is working correctly without any mocking.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running Unified SDK Integration Tests');
console.log('=====================================');

async function runTests() {
  try {
    // First, compile TypeScript
    console.log('📦 Compiling TypeScript...');
    await runCommand('npx', ['tsc', '--noEmit']);
    console.log('✅ TypeScript compilation successful');

    // Run the specific integration tests
    console.log('\n🔬 Running Activity SDK Component Tests...');
    await runCommand('npx', ['jest', 'src/__tests__/ActivitySDK.integration.test.ts', '--verbose']);

    console.log('\n🔬 Running Unified SDK Integration Tests...');
    await runCommand('npx', ['jest', 'src/__tests__/UnifiedSDK.integration.test.ts', '--verbose']);

    console.log('\n🔬 Running Rules Interpreter Tests...');
    await runCommand('npx', ['jest', 'src/__tests__/RulesInterpreter.test.ts', '--verbose']);

    console.log('\n✅ All integration tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('- Activity SDK Components: UriSigner, NoOpCipher, EventDispatcher, ActivityEvent');
    console.log('- Real network calls to Activity API');
    console.log('- DDC Client integration with testnet');
    console.log('- End-to-end Telegram use cases');
    console.log('- Error handling and fallback mechanisms');
    console.log('- Performance and concurrency testing');
  } catch (error) {
    console.error('❌ Integration tests failed:', error.message);
    process.exit(1);
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}: ${command} ${args.join(' ')}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Manual verification checklist
function printManualVerificationChecklist() {
  console.log('\n📋 Manual Verification Checklist:');
  console.log('================================');
  console.log('');
  console.log('✅ Activity SDK Integration:');
  console.log('   - UriSigner creates real signers from URI/mnemonic');
  console.log('   - NoOpCipher handles encryption/decryption operations');
  console.log('   - EventDispatcher makes real API calls');
  console.log('   - ActivityEvent creates proper event structures');
  console.log('');
  console.log('✅ DDC Client Integration:');
  console.log('   - Creates real DagNode and File objects');
  console.log('   - Connects to testnet blockchain');
  console.log('   - Stores data and returns hashes');
  console.log('');
  console.log('✅ Unified SDK Features:');
  console.log('   - Metadata-driven routing works correctly');
  console.log('   - Telegram-specific methods function properly');
  console.log('   - Error handling and fallbacks operate as expected');
  console.log('   - Batch processing handles multiple events');
  console.log('   - Concurrent requests process correctly');
  console.log('');
  console.log('✅ Real-world Scenarios:');
  console.log('   - User registration flows');
  console.log('   - Gaming sessions with multiple events');
  console.log('   - Quest completion workflows');
  console.log('   - Mini-app interactions');
  console.log('');
  console.log('🚀 To run tests manually:');
  console.log('   npm test                    # Run all tests');
  console.log('   npx jest --verbose         # Run with detailed output');
  console.log('   node test-runner.js        # Run this integration test suite');
}

// Run the tests
if (require.main === module) {
  runTests().finally(() => {
    printManualVerificationChecklist();
  });
}

module.exports = { runTests };
