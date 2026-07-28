// Browser/isomorphic WebSocket provider. polkadot-api 2.x's `getWsProvider`
// uses the global `WebSocket` by default, so this path pulls no Node `ws`
// package (or its net/tls/crypto builtins) and bundles cleanly for the browser.
// Resolved via the `browser` condition of the package `#ws-provider` imports
// map; Node consumers get `ws-provider.ts` (the `ws`-backed provider) instead.
export { getWsProvider } from '@polkadot-api/ws-provider';
