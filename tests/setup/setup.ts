beforeAll(async () => {
  /**
   * Emulate browser environment
   */
  globalThis.self = globalThis as any;
  globalThis.WebSocket = require('ws').WebSocket;
});

afterAll(async () => {});
