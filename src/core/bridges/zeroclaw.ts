// ZeroClaw 框架桥接实现
import { FrameworkType, FrameworkInfo, Agent, Message, BridgeMessage, BridgeResponse, AgentType, AgentStatus } from '../types.js';
import { FrameworkBridge } from './base.js';
import { spawn } from 'child_process';
import { homedir } from 'os';
import path from 'path';

export class ZeroClawBridge extends FrameworkBridge {
  constructor() {
    super(FrameworkType.ZEROCLAW);
  }

  async detect(): Promise<boolean> {
    const home = homedir();
    const zeroClawPath = path.join(home, 'Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release-fast/zeroclaw');
    const fs = await import('fs/promises');
    
    try {
      await fs.access(zeroClawPath);
      this.info = {
        type: FrameworkType.ZEROCLAW,
        name: 'ZeroClaw',
        version: '1.0.0',
        installed: true,
        running: false,
        agents: []
      };
      // 存储路径到实例变量
      (this as any).zeroClawPath = zeroClawPath;
      return true;
    } catch {
      return false;
    }
  }

  async connect(): Promise<boolean> {
    if (!this.info) {
      await this.detect();
    }

    if (this.info && this.info.installed) {
      this.connected = true;
      this.info.running = true;
      return true;
    }

    return false;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    if (this.info) {
      this.info.running = false;
    }
  }

  async getAgents(): Promise<Agent[]> {
    if (!this.connected) {
      await this.connect();
    }

    // 模拟返回 Agent 列表
    return [
      {
        id: 'main',
        name: 'ZeroClaw主代理',
        type: AgentType.CHAT,
        status: AgentStatus.ACTIVE,
        config: {},
        framework: FrameworkType.ZEROCLAW,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async sendMessage(agentId: string, message: string): Promise<Message> {
    if (!this.connected) {
      await this.connect();
    }

    const zeroClawPath = (this as any).zeroClawPath;
    if (!zeroClawPath) {
      throw new Error('ZeroClaw path not found');
    }

    return new Promise((resolve, reject) => {
      const proc = spawn(zeroClawPath, ['agent', '--message', message], {
        env: { ...process.env, ARK_API_KEY: process.env.ARK_API_KEY }
      });

      let output = '';
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr.on('data', (data) => {
        output += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          const responseMessage: Message = {
            id: Date.now().toString(),
            agentId,
            role: 'assistant',
            content: output,
            timestamp: new Date()
          };
          resolve(responseMessage);
        } else {
          reject(new Error(output));
        }
      });
    });
  }

  async createAgent(config: any): Promise<Agent> {
    // 模拟创建 Agent
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: config.name || `New ZeroClaw Agent ${Date.now()}`,
      description: config.description,
      type: config.type || AgentType.CHAT,
      status: AgentStatus.ACTIVE,
      config: config,
      framework: FrameworkType.ZEROCLAW,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return newAgent;
  }

  async updateAgent(agentId: string, config: any): Promise<Agent> {
    // 模拟更新 Agent
    return {
      id: agentId,
      name: config.name || 'Updated ZeroClaw Agent',
      description: config.description,
      type: config.type || AgentType.CHAT,
      status: AgentStatus.ACTIVE,
      config: config,
      framework: FrameworkType.ZEROCLAW,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    // 模拟删除 Agent
    return true;
  }

  protected async handleMessage(message: BridgeMessage): Promise<BridgeResponse> {
    // 处理桥接消息
    return {
      success: true,
      data: {},
      error: null
    };
  }
}
