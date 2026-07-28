// Node WebSocket provider. polkadot-api 2.x's `getWsProvider` defaults to the
// global `WebSocket`, which does not exist before Node 21, so we inject the `ws`
// package's implementation to keep `@cere-ddc-sdk/blockchain` working on this
// repo's Node floor. Browser bundlers resolve the `browser` condition of the
// package `#ws-provider` imports map to `ws-provider.web.ts` instead, which uses
// the global `WebSocket` and never pulls the Node `ws` package (or its net/tls/
// crypto builtins).
import { getWsProvider as base, type WebSocketClass } from '@polkadot-api/ws-provider';
import { WebSocket } from 'ws';

export function getWsProvider(endpoints: string | string[]) {
  return base(endpoints, { websocketClass: WebSocket as unknown as WebSocketClass });
}
