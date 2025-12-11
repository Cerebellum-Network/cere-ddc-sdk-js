import { ClientContext } from '../../../packages/client/src/context';

describe('ClientContext', () => {
  it('assigns passed properties and maps agentService -> agent_service', () => {
    const ctx = new ClientContext({ agentService: 'pk', workspace: 'ws', stream: 'stream-1' });
    expect(ctx.agent_service).toBe('pk');
    expect(ctx.workspace).toBe('ws');
    expect(ctx.stream).toBe('stream-1');
  });
});
