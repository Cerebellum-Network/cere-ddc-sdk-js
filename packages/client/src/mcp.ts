import { v4 as uuid } from 'uuid';

type EventOptions = {
  id?: string;
  timestamp?: Date;
};

export type ActivityEventPayload = Record<string, any>;

class MCP {
  readonly id: string;
  readonly alias: string;
  constructor(
    alias: string,
    readonly payload: ActivityEventPayload = {},
    options: EventOptions = {},
  ) {
    this.id = options.id ?? uuid();
    this.payload = payload;
    this.alias = alias;
  }
  get body() {
    return {
      jsonrpc: '2.0',
      id: this.id,
      method: 'tools/call',
      params: {
        name: this.alias,
        arguments: {
          ...this.payload,
        },
      },
    };
  }
}
export default MCP;
