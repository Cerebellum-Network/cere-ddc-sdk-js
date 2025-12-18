/* eslint-disable @typescript-eslint/no-explicit-any */
import { parsePacket } from '../../../packages/client/src/utils';

const enc = new TextEncoder();

describe('utils.parsePacket', () => {
  it('parses application/json payloads', () => {
    const payload = enc.encode(JSON.stringify({ a: 1, b: 'x' }));
    const packet: any = {
      headers: { 'content-type': 'application/json; charset=utf-8' },
      payload,
    };
    const res = parsePacket(packet);
    expect(res).toEqual({ a: 1, b: 'x' });
  });

  it('decodes text/* payloads as string', () => {
    const payload = enc.encode('hello world');
    const packet: any = {
      headers: { 'content-type': 'text/plain' },
      payload,
    };
    const res = parsePacket(packet);
    expect(res).toBe('hello world');
  });

  it('attempts to parse application/octet-stream as JSON first, then falls back to bytes', () => {
    // JSON under octet-stream
    const jsonPayload = enc.encode('{"ok":true}');
    const jsonPacket: any = {
      headers: { 'content-type': 'application/octet-stream' },
      payload: jsonPayload,
    };
    expect(parsePacket(jsonPacket)).toEqual({ ok: true });

    // Non-JSON under octet-stream -> returns original bytes
    const bin = new Uint8Array([1, 2, 3, 4]);
    const binPacket: any = {
      headers: { 'content-type': 'application/octet-stream' },
      payload: bin,
    };
    const res = parsePacket(binPacket);
    expect(res).toBeInstanceOf(Uint8Array);
    expect(Array.from(res as Uint8Array)).toEqual([1, 2, 3, 4]);
  });

  it('treats missing content-type like octet-stream (try JSON then bytes)', () => {
    const jsonPayload = enc.encode('[1,2,3]');
    const packet1: any = { headers: {}, payload: jsonPayload };
    expect(parsePacket(packet1)).toEqual([1, 2, 3]);

    const bin = new Uint8Array([9, 9, 9]);
    const packet2: any = { headers: {}, payload: bin };
    const res = parsePacket(packet2);
    expect(res).toBeInstanceOf(Uint8Array);
    expect(Array.from(res as Uint8Array)).toEqual([9, 9, 9]);
  });

  it('returns raw bytes for unsupported content types', () => {
    const bin = new Uint8Array([255, 0, 1]);
    const packet: any = {
      headers: { 'content-type': 'image/png' },
      payload: bin,
    };
    const res = parsePacket(packet);
    expect(res).toBeInstanceOf(Uint8Array);
    expect(Array.from(res as Uint8Array)).toEqual([255, 0, 1]);
  });

  it('throws error for invalid JSON when content-type is application/json', () => {
    const payload = enc.encode('{ invalid json }');
    const packet: any = {
      headers: { 'content-type': 'application/json' },
      payload,
    };
    expect(() => parsePacket(packet)).toThrow('Invalid JSON payload for application/json content type');
  });

  it('returns raw bytes for application/octet-stream if not valid JSON', () => {
    const bin = new Uint8Array([1, 2, 3]);
    const packet: any = {
      headers: { 'content-type': 'application/octet-stream' },
      payload: bin,
    };
    const res = parsePacket(packet);
    expect(res).toBeInstanceOf(Uint8Array);
    expect(Array.from(res as Uint8Array)).toEqual([1, 2, 3]);
  });
});
