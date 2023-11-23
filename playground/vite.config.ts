import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

/**
 * https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  define: {
    'process.env.BC_ENDPOINT': JSON.stringify('ws://localhost:9944'),
  },
});
