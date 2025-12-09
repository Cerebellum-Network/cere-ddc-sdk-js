import { ContextInterface, ContextInput } from './types';

export class ClientContext implements ContextInterface {
  public agent_service: string;
  public workspace: string;
  public domain?: string;

  constructor(props: ContextInput) {
    this.agent_service = props.agentService;
    this.workspace = props.workspace;
    this.domain = props.domain;
  }
}

export default ClientContext;
