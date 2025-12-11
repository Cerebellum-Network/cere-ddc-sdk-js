import { Packet } from './sis/types';

export const parsePacket = (packet: Packet) => {
  const headers = packet.headers;
  const contentType = headers?.['content-type'] || '';
  let data: any;

  if (contentType.includes('application/json')) {
    const text = new TextDecoder().decode(packet.payload);
    data = JSON.parse(text);
  } else if (contentType.includes('text/')) {
    data = new TextDecoder().decode(packet.payload);
  } else if (contentType.includes('application/octet-stream') || !contentType) {
    try {
      const text = new TextDecoder().decode(packet.payload);
      data = JSON.parse(text);
    } catch {
      data = packet.payload;
    }
  } else {
    data = packet.payload;
  }
  return data;
};
