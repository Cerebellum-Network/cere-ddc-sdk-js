import { ClientContext } from '../../packages/client/src/context';

describe('ClientContext', () => {
  it('assigns passed properties and maps agentService -> agent_service', () => {
    const ctx = new ClientContext({ agentService: 'pk', workspace: 'ws', domain: 'example.org' });
    expect(ctx.agent_service).toBe('pk');
    expect(ctx.workspace).toBe('ws');
    expect(ctx.domain).toBe('example.org');
  });
});
