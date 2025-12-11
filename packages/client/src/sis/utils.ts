/**
 * Normalize various inputs to a proper SIS WebTransport URL.
 * Accepts:
 *  - host:port (e.g., "localhost:4433")
 *  - https URL with or without path (e.g., "https://localhost:4433" or "https://localhost:4433/some")
 * Returns:
 *  - https://host:port/sis (always)
 */

import { WebTransportConstructor } from './types';

export function normalizeSisUrl(input: string): string {
  try {
    if (input.startsWith('https://')) {
      const u = new URL(input);
      return `${u.origin}/sis`;
    }
    // Strip any protocol if mistakenly provided and enforce https
    const trimmed = input.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return `https://${trimmed}/sis`;
  } catch {
    // Fallback: best-effort normalization
    const trimmed = String(input || '')
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');
    return `https://${trimmed}/sis`;
  }
}

/**
 * Converts a base64 string to Uint8Array
 */
export function base64ToBytes(base64: string): Uint8Array {
  // Handle both browser and Node.js
  if (typeof atob !== 'undefined') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } else {
    // Node.js
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
}

export async function universalTransport() {
  if (typeof globalThis !== 'undefined' && 'WebTransport' in globalThis) {
    return (globalThis as Record<string, unknown>)['WebTransport'] as WebTransportConstructor;
  } else if (
    typeof process !== 'undefined' &&
    (process as any).versions != null &&
    (process as any).versions.node != null
  ) {
    // Node.js environment
    try {
      // Dynamically import the WebTransport polyfill
      // @ts-ignore - @fails-components/webtransport is an optional Node.js dependency
      const { WebTransport, quicheLoaded } = await import('@fails-components/webtransport');
      await quicheLoaded;
      return WebTransport;
    } catch (e) {
      return undefined;
    }
  }
}

export const determineContentType = (message: unknown): string => {
  if (message === null || message === undefined) {
    return 'application/octet-stream';
  }

  if (message instanceof Uint8Array || message instanceof ArrayBuffer) {
    return 'application/octet-stream';
  }

  if (typeof message === 'string') {
    try {
      JSON.parse(message);
      return 'application/json';
    } catch {
      return 'text/plain';
    }
  }

  if (typeof message === 'object') {
    return 'application/json';
  }

  return 'text/plain';
};
