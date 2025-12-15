/**
 * SIS TypeScript SDK - Wire Protocol Helpers
 *
 * This module implements the SIS wire protocol for serialization and deserialization.
 * Use these helpers when implementing custom transport layers or SDK ports.
 *
 * Wire Formats:
 * - Handshake: [4 bytes: json_len][json_payload]
 * - Packet: [4 bytes: packet_size][8 bytes: seq_num][4 bytes: headers_len][headers_json][payload]
 * - ACK: [8 bytes: seq_num][8 bytes: timestamp]
 */

import {
  HandshakeRequest,
  Ack,
  HANDSHAKE_VERSION,
  MAX_HANDSHAKE_SIZE,
  MAX_PACKET_SIZE,
  MAX_HEADERS_SIZE,
  MAX_STREAM_ID_LENGTH,
  SISError,
} from './types';

// =============================================================================
// Binary Helpers
// =============================================================================

/**
 * Creates a DataView from a Uint8Array
 */
function toDataView(arr: Uint8Array): DataView {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}

/**
 * Encodes a string to UTF-8 bytes
 */
function encodeString(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Decodes UTF-8 bytes to string
 */
function decodeString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Concatenates multiple Uint8Arrays
 */
function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Writes a uint32 in big-endian format
 */
function writeUint32BE(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  new DataView(buf.buffer).setUint32(0, value, false);
  return buf;
}

/**
 * Writes a uint64 in big-endian format
 * Note: JavaScript numbers are 64-bit floats, safe for integers up to 2^53-1
 */
function writeUint64BE(value: number): Uint8Array {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  // Split into high and low 32-bit parts
  const high = Math.floor(value / 0x100000000);
  const low = value >>> 0;
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);
  return buf;
}

/**
 * Reads a uint32 in big-endian format
 */
function readUint32BE(data: Uint8Array, offset: number): number {
  return toDataView(data).getUint32(offset, false);
}

/**
 * Reads a uint64 in big-endian format
 */
function readUint64BE(data: Uint8Array, offset: number): number {
  const view = toDataView(data);
  const high = view.getUint32(offset, false);
  const low = view.getUint32(offset + 4, false);
  return high * 0x100000000 + low;
}

/**
 * Reads a int64 in big-endian format (for timestamps)
 */
function readInt64BE(data: Uint8Array, offset: number): number {
  const view = toDataView(data);
  const high = view.getInt32(offset, false); // Signed for negative values
  const low = view.getUint32(offset + 4, false);
  return high * 0x100000000 + low;
}

// =============================================================================
// Handshake Serialization
// =============================================================================

/**
 * Serializes a handshake request for establishing a QUIC stream.
 * Wire Format: [4 bytes: json_len (big-endian uint32)][json_payload]
 *
 * @param req - Handshake request
 * @returns Serialized handshake bytes
 * @throws SISError if validation fails
 */
export function serializeHandshake(req: HandshakeRequest): Uint8Array {
  // Validate stream ID
  if (!req.stream_id || req.stream_id.length === 0) {
    throw new SISError('Stream ID is required', 'PROTOCOL_STREAM_ID_REQUIRED');
  }
  if (req.stream_id.length > MAX_STREAM_ID_LENGTH) {
    throw new SISError(
      `Stream ID too long: ${req.stream_id.length} bytes (max ${MAX_STREAM_ID_LENGTH})`,
      'PROTOCOL_STREAM_ID_TOO_LONG',
    );
  }

  // Set default version
  const handshake: HandshakeRequest = {
    ...req,
    version: req.version || HANDSHAKE_VERSION,
  };

  // Serialize to JSON
  const jsonBytes = encodeString(JSON.stringify(handshake));

  // Validate size
  if (jsonBytes.length > MAX_HANDSHAKE_SIZE) {
    throw new SISError(
      `Handshake too large: ${jsonBytes.length} bytes (max ${MAX_HANDSHAKE_SIZE})`,
      'PROTOCOL_HANDSHAKE_TOO_LARGE',
    );
  }

  // Build: [Len:4][JSON:n]
  return concat(writeUint32BE(jsonBytes.length), jsonBytes);
}

/**
 * Deserializes a handshake request from bytes.
 * Wire Format: [4 bytes: json_len (big-endian uint32)][json_payload]
 *
 * @param data - Raw handshake bytes
 * @returns Parsed handshake request
 * @throws SISError if parsing fails
 */
export function deserializeHandshake(data: Uint8Array): HandshakeRequest {
  if (data.length < 4) {
    throw new SISError('Handshake too short: missing length prefix', 'PROTOCOL_HANDSHAKE_TOO_SHORT');
  }

  const jsonLen = readUint32BE(data, 0);
  if (jsonLen === 0 || jsonLen > MAX_HANDSHAKE_SIZE) {
    throw new SISError(`Invalid handshake length: ${jsonLen}`, 'PROTOCOL_HANDSHAKE_LENGTH_INVALID');
  }

  if (data.length < 4 + jsonLen) {
    throw new SISError(
      `Incomplete handshake: expected ${4 + jsonLen} bytes, got ${data.length}`,
      'PROTOCOL_HANDSHAKE_INCOMPLETE',
    );
  }

  const jsonBytes = data.slice(4, 4 + jsonLen);
  const jsonStr = decodeString(jsonBytes);

  try {
    const req = JSON.parse(jsonStr) as HandshakeRequest;

    // Validate required fields
    if (!req.stream_id || req.stream_id.length === 0 || req.stream_id.length > MAX_STREAM_ID_LENGTH) {
      throw new SISError(
        `Invalid stream ID length: ${req.stream_id?.length ?? 0}`,
        'PROTOCOL_STREAM_ID_LENGTH_INVALID',
      );
    }

    return req;
  } catch (e) {
    if (e instanceof SISError) throw e;
    throw new SISError(`Failed to parse handshake: ${e}`, 'PROTOCOL_HANDSHAKE_PARSE_ERROR');
  }
}

// =============================================================================
// Packet Serialization
// =============================================================================

/**
 * Serializes a packet in the SIS wire format.
 * Wire Format: [4 bytes: packet_size][8 bytes: seq_num][4 bytes: headers_len][headers_json][payload]
 *
 * @param seqNum - Sequence number
 * @param headers - Optional packet headers
 * @param payload - Packet payload
 * @returns Serialized packet bytes
 * @throws SISError if validation fails
 */
export function serializePacket(
  seqNum: number,
  headers: Record<string, string> | null | undefined,
  payload: Uint8Array,
): Uint8Array {
  // Serialize headers
  const headersJson =
    headers && Object.keys(headers).length > 0 ? encodeString(JSON.stringify(headers)) : new Uint8Array(0);

  if (headersJson.length > MAX_HEADERS_SIZE) {
    throw new SISError(
      `Headers too large: ${headersJson.length} bytes (max ${MAX_HEADERS_SIZE})`,
      'PROTOCOL_HEADERS_TOO_LARGE',
    );
  }

  // Calculate packet size: seq(8) + headersLen(4) + headers + payload
  const packetSize = 8 + 4 + headersJson.length + payload.length;

  if (packetSize > MAX_PACKET_SIZE) {
    throw new SISError(
      `Packet too large: ${packetSize} bytes (max ${MAX_PACKET_SIZE})`,
      'PROTOCOL_PACKET_TOO_LARGE',
    );
  }

  // Build packet: [PacketSize:4][SeqNum:8][HeadersLen:4][Headers:n][Payload:m]
  return concat(
    writeUint32BE(packetSize),
    writeUint64BE(seqNum),
    writeUint32BE(headersJson.length),
    headersJson,
    payload,
  );
}

/**
 * Result of deserializing a packet
 */
export interface DeserializedPacket {
  seqNum: number;
  headers: Record<string, string>;
  payload: Uint8Array;
  bytesConsumed: number;
}

/**
 * Deserializes a packet from the SIS wire format.
 * Wire Format: [4 bytes: packet_size][8 bytes: seq_num][4 bytes: headers_len][headers_json][payload]
 *
 * @param data - Raw packet bytes (may contain more data after the packet)
 * @returns Parsed packet with sequence number, headers, payload, and bytes consumed
 * @throws SISError if parsing fails
 */
export function deserializePacket(data: Uint8Array): DeserializedPacket {
  if (data.length < 4) {
    throw new SISError('Packet too short: missing size prefix', 'PROTOCOL_PACKET_TOO_SHORT');
  }

  const packetSize = readUint32BE(data, 0);
  if (packetSize === 0 || packetSize > MAX_PACKET_SIZE) {
    throw new SISError(`Invalid packet size: ${packetSize}`, 'PROTOCOL_PACKET_SIZE_INVALID');
  }

  const totalSize = 4 + packetSize;
  if (data.length < totalSize) {
    throw new SISError(
      `Incomplete packet: expected ${totalSize} bytes, got ${data.length}`,
      'PROTOCOL_PACKET_INCOMPLETE',
    );
  }

  let offset = 4;

  // Read sequence number
  const seqNum = readUint64BE(data, offset);
  offset += 8;

  // Read headers length
  const headersLen = readUint32BE(data, offset);
  offset += 4;

  if (headersLen > MAX_HEADERS_SIZE) {
    throw new SISError(`Headers too large: ${headersLen}`, 'PROTOCOL_HEADERS_TOO_LARGE');
  }

  // Read headers
  let headers: Record<string, string> = {};
  if (headersLen > 0) {
    const headersBytes = data.slice(offset, offset + headersLen);
    const headersStr = decodeString(headersBytes);
    try {
      headers = JSON.parse(headersStr);
    } catch {
      throw new SISError('Failed to parse headers JSON', 'PROTOCOL_HEADERS_PARSE_ERROR');
    }
    offset += headersLen;
  }

  // Read payload (rest of packet data)
  const payloadEnd = 4 + packetSize;
  const payload = data.slice(offset, payloadEnd);

  return {
    seqNum,
    headers,
    payload,
    bytesConsumed: totalSize,
  };
}

// =============================================================================
// ACK Serialization
// =============================================================================

/**
 * ACK Format: [8 bytes: seq_num][8 bytes: timestamp]
 */
export const ACK_SIZE = 16;

/**
 * Deserializes an ACK from the server.
 * ACK Format: [8 bytes: seq_num][8 bytes: timestamp]
 *
 * @param data - 16-byte ACK data
 * @returns Parsed ACK with sequence number and timestamp
 * @throws SISError if parsing fails
 */
export function deserializeAck(data: Uint8Array): Ack {
  if (data.length !== ACK_SIZE) {
    throw new SISError(
      `Invalid ACK size: expected ${ACK_SIZE} bytes, got ${data.length}`,
      'PROTOCOL_ACK_SIZE_INVALID',
    );
  }

  return {
    sequenceNum: readUint64BE(data, 0),
    timestamp: readInt64BE(data, 8),
  };
}

/**
 * Serializes an ACK (for server implementations or testing).
 * ACK Format: [8 bytes: seq_num][8 bytes: timestamp]
 *
 * @param seqNum - Sequence number
 * @param timestamp - Timestamp in nanoseconds
 * @returns Serialized ACK bytes
 */
export function serializeAck(seqNum: number, timestamp: number): Uint8Array {
  return concat(writeUint64BE(seqNum), writeUint64BE(timestamp));
}

// =============================================================================
// Stream Reader Helper
// =============================================================================

/**
 * BufferedReader helps read exact amounts of data from a stream.
 * Useful for implementing packet deserialization from streaming sources.
 */
export class BufferedReader {
  private buffer: Uint8Array = new Uint8Array(0);
  private closed = false;

  /**
   * Appends data to the internal buffer
   */
  append(data: Uint8Array): void {
    if (this.closed) return;
    this.buffer = concat(this.buffer, data);
  }

  /**
   * Marks the reader as closed (no more data will be appended)
   */
  close(): void {
    this.closed = true;
  }

  /**
   * Returns true if the reader is closed and buffer is empty
   */
  get isDone(): boolean {
    return this.closed && this.buffer.length === 0;
  }

  /**
   * Returns the current buffer length
   */
  get available(): number {
    return this.buffer.length;
  }

  /**
   * Reads exactly n bytes from the buffer.
   * Returns null if not enough data is available.
   */
  read(n: number): Uint8Array | null {
    if (this.buffer.length < n) {
      return null;
    }
    const result = this.buffer.slice(0, n);
    this.buffer = this.buffer.slice(n);
    return result;
  }

  /**
   * Peeks at the first n bytes without consuming them.
   * Returns null if not enough data is available.
   */
  peek(n: number): Uint8Array | null {
    if (this.buffer.length < n) {
      return null;
    }
    return this.buffer.slice(0, n);
  }

  /**
   * Tries to read a complete packet from the buffer.
   * Returns null if not enough data is available.
   */
  readPacket(): DeserializedPacket | null {
    // Need at least 4 bytes for size
    if (this.buffer.length < 4) {
      return null;
    }

    const packetSize = readUint32BE(this.buffer, 0);
    const totalSize = 4 + packetSize;

    if (this.buffer.length < totalSize) {
      return null;
    }

    const packetData = this.buffer.slice(0, totalSize);
    this.buffer = this.buffer.slice(totalSize);
    return deserializePacket(packetData);
  }

  /**
   * Tries to read an ACK from the buffer.
   * Returns null if not enough data is available.
   */
  readAck(): Ack | null {
    if (this.buffer.length < ACK_SIZE) {
      return null;
    }
    const ackData = this.buffer.slice(0, ACK_SIZE);
    this.buffer = this.buffer.slice(ACK_SIZE);
    return deserializeAck(ackData);
  }
}
