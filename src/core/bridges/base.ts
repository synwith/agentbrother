// 框架桥接基类
import { FrameworkType, FrameworkInfo, Agent, Message, BridgeMessage, BridgeResponse } from '../types.js';

export abstract class FrameworkBridge {
  protected type: FrameworkType;
  protected info: FrameworkInfo | null = null;
  protected connected = false;

  constructor(type: FrameworkType) {
    this.type = type;
  }

  abstract detect(): Promise<boolean>;
  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  abstract getAgents(): Promise<Agent[]>;
  abstract sendMessage(agentId: string, message: string): Promise<Message>;
  abstract createAgent(config: any): Promise<Agent>;
  abstract updateAgent(agentId: string, config: any): Promise<Agent>;
  abstract deleteAgent(agentId: string): Promise<boolean>;

  getType(): FrameworkType {
    return this.type;
  }

  getInfo(): FrameworkInfo | null {
    return this.info;
  }

  isConnected(): boolean {
    return this.connected;
  }

  protected abstract handleMessage(message: BridgeMessage): Promise<BridgeResponse>;
}
