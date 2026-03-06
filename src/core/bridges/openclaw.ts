// OpenClaw 框架桥接实现
import { FrameworkType, FrameworkInfo, Agent, Message, BridgeMessage, BridgeResponse, AgentType, AgentStatus } from '../types.js';
import { FrameworkBridge } from './base.js';
import { spawn, ChildProcess } from 'child_process';
import { homedir } from 'os';
import path from 'path';
import http from 'http';
import https from 'https';

export class OpenClawBridge extends FrameworkBridge {
  private gatewayProcess: ChildProcess | null = null;
  private gatewayPort: number = 18789;
  private gatewayUrl: string = `http://localhost:${18789}`;

  constructor() {
    super(FrameworkType.OPENCLAW);
  }

  async detect(): Promise<boolean> {
    const home = homedir();
    const openClawPath = path.join(home, 'Documents/trae_projects/openclaw_test/openclaw.sh');
    const fs = await import('fs/promises');
    
    try {
      await fs.access(openClawPath);
      this.info = {
        type: FrameworkType.OPENCLAW,
        name: 'OpenClaw',
        version: '1.0.0',
        installed: true,
        running: false,
        agents: []
      };
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
      // 检查Gateway是否运行
      if (!await this.isGatewayRunning()) {
        // 启动Gateway服务
        await this.startGateway();
      }
      
      this.connected = true;
      this.info.running = true;
      return true;
    }

    return false;
  }

  async disconnect(): Promise<void> {
    if (this.gatewayProcess) {
      this.gatewayProcess.kill();
      this.gatewayProcess = null;
    }
    this.connected = false;
    if (this.info) {
      this.info.running = false;
    }
  }

  private async isGatewayRunning(): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get(`${this.gatewayUrl}/health`, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => {
        resolve(false);
      });
      req.end();
    });
  }

  private async startGateway(): Promise<void> {
    const home = homedir();
    const openClawPath = path.join(home, 'Documents/trae_projects/openclaw_test');
    
    return new Promise((resolve, reject) => {
      this.gatewayProcess = spawn('./openclaw.sh', ['gateway', '--port', this.gatewayPort.toString()], {
        cwd: openClawPath,
        env: { ...process.env, ARK_API_KEY: process.env.ARK_API_KEY },
        detached: true,
        stdio: 'ignore'
      });

      this.gatewayProcess.on('error', (error) => {
        reject(error);
      });

      this.gatewayProcess.on('exit', (code) => {
        if (code !== null && code !== 0) {
          reject(new Error(`Gateway exited with code ${code}`));
        }
      });

      // 等待Gateway启动
      setTimeout(async () => {
        if (await this.isGatewayRunning()) {
          resolve();
        } else {
          reject(new Error('Failed to start Gateway'));
        }
      }, 3000);
    });
  }

  async getAgents(): Promise<Agent[]> {
    if (!this.connected) {
      await this.connect();
    }

    // 模拟返回 Agent 列表
    return [
      {
        id: 'main',
        name: '默认代理',
        type: AgentType.CHAT,
        status: AgentStatus.ACTIVE,
        config: {},
        framework: FrameworkType.OPENCLAW,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'film-director',
        name: 'AI电影导演',
        type: AgentType.VIDEO,
        status: AgentStatus.ACTIVE,
        config: {},
        framework: FrameworkType.OPENCLAW,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'video-editor',
        name: 'AI剪辑师',
        type: AgentType.VIDEO,
        status: AgentStatus.ACTIVE,
        config: {},
        framework: FrameworkType.OPENCLAW,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'media-creator',
        name: 'AI生图',
        type: AgentType.IMAGE,
        status: AgentStatus.ACTIVE,
        config: {},
        framework: FrameworkType.OPENCLAW,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async sendMessage(agentId: string, message: string): Promise<Message> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      // 使用HTTP API发送消息
      const response = await this.httpPost(`${this.gatewayUrl}/hooks/agent`, {
        agent: agentId || 'main',
        message: message
      });

      const responseMessage: Message = {
        id: Date.now().toString(),
        agentId: agentId || 'main',
        role: 'assistant',
        content: response.response || response,
        timestamp: new Date()
      };
      return responseMessage;
    } catch (error) {
      // 如果HTTP API失败，回退到命令行方式
      return this.sendMessageViaCommandLine(agentId, message);
    }
  }

  private async httpPost(url: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  private async sendMessageViaCommandLine(agentId: string, message: string): Promise<Message> {
    const home = homedir();
    const openClawPath = path.join(home, 'Documents/trae_projects/openclaw_test');

    return new Promise((resolve, reject) => {
      const proc = spawn('./openclaw.sh', ['agent', '-m', message, '--agent', agentId || 'main'], {
        cwd: openClawPath,
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
      name: config.name || `New Agent ${Date.now()}`,
      description: config.description,
      type: config.type || AgentType.CHAT,
      status: AgentStatus.ACTIVE,
      config: config,
      framework: FrameworkType.OPENCLAW,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return newAgent;
  }

  async updateAgent(agentId: string, config: any): Promise<Agent> {
    // 模拟更新 Agent
    return {
      id: agentId,
      name: config.name || 'Updated Agent',
      description: config.description,
      type: config.type || AgentType.CHAT,
      status: AgentStatus.ACTIVE,
      config: config,
      framework: FrameworkType.OPENCLAW,
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
