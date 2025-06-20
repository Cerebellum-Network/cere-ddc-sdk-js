// Jest setup file for unified package tests
import { TextEncoder, TextDecoder } from 'util';

// Setup global polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Global test timeout for async operations
jest.setTimeout(30000);

// Setup global mock reset
beforeEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
