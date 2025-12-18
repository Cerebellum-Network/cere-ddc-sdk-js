import { Packet } from './sis/types';

export const parsePacket = (packet: Packet) => {
  const headers = packet.headers;
  const contentType = headers?.['content-type'] || '';

  if (contentType.includes('text/')) {
    return new TextDecoder().decode(packet.payload);
  }

  const isJson = contentType.includes('application/json');
  const isUnknown = contentType.includes('application/octet-stream') || !contentType;

  if (isJson || isUnknown) {
    try {
      const text = new TextDecoder().decode(packet.payload);
      return JSON.parse(text);
    } catch (e) {
      if (isJson) {
        throw new Error('Invalid JSON payload for application/json content type');
      }
    }
  }

  return packet.payload;
};
