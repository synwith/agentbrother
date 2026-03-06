// AgentBrother 主入口
import { Agent, FrameworkType, FrameworkInfo, AgentBrotherConfig, AgentBrotherEvent } from './core/types.js';
import { FrameworkBridge } from './core/bridges/base.js';

// 框架桥接实现
import { OpenClawBridge } from './core/bridges/openclaw.js';
import { ZeroClawBridge } from './core/bridges/zeroclaw.js';

class AgentBrother {
  private bridges: Map<FrameworkType, FrameworkBridge> = new Map();
  private config: AgentBrotherConfig;
  private eventListeners: Map<AgentBrotherEvent, Array<(data: any) => void>> = new Map();

  constructor(config?: Partial<AgentBrotherConfig>) {
    // 默认配置
    this.config = {
      floatInput: {
        enabled: true,
        shortcut: 'Cmd+Shift+A',
        position: 'top-right',
        opacity: 0.9,
        alwaysOnTop: true
      },
      frameworks: [
        { type: FrameworkType.OPENCLAW, enabled: true, autoDetect: true },
        { type: FrameworkType.ZEROCLAW, enabled: true, autoDetect: true }
      ],
      theme: 'dark',
      language: 'zh-CN',
      ...config
    };

    // 初始化框架桥接
    this.initializeBridges();
  }

  private initializeBridges() {
    // 添加 OpenClaw 桥接
    const openClawBridge = new OpenClawBridge();
    this.bridges.set(FrameworkType.OPENCLAW, openClawBridge);

    // 添加 ZeroClaw 桥接
    const zeroClawBridge = new ZeroClawBridge();
    this.bridges.set(FrameworkType.ZEROCLAW, zeroClawBridge);
  }

  // 检测所有框架
  async detectFrameworks(): Promise<Map<FrameworkType, FrameworkInfo>> {
    const results = new Map<FrameworkType, FrameworkInfo>();
    
    for (const [type, bridge] of this.bridges) {
      const detected = await bridge.detect();
      if (detected) {
        const info = bridge.getInfo();
        if (info) {
          results.set(type, info);
          this.emit(AgentBrotherEvent.FRAMEWORK_DETECTED, info);
        }
      }
    }
    
    return results;
  }

  // 连接框架
  async connectFramework(type: FrameworkType): Promise<boolean> {
    const bridge = this.bridges.get(type);
    if (!bridge) {
      return false;
    }

    const connected = await bridge.connect();
    if (connected) {
      this.emit(AgentBrotherEvent.FRAMEWORK_CONNECTED, { type });
    }
    
    return connected;
  }

  // 断开框架连接
  async disconnectFramework(type: FrameworkType): Promise<void> {
    const bridge = this.bridges.get(type);
    if (bridge) {
      await bridge.disconnect();
      this.emit(AgentBrotherEvent.FRAMEWORK_DISCONNECTED, { type });
    }
  }

  // 获取所有框架
  getFrameworks(): Array<{ type: FrameworkType; bridge: FrameworkBridge }> {
    return Array.from(this.bridges.entries()).map(([type, bridge]) => ({ type, bridge }));
  }

  // 获取指定框架的 Agent 列表
  async getAgents(type: FrameworkType): Promise<Agent[]> {
    const bridge = this.bridges.get(type);
    if (!bridge) {
      return [];
    }

    return await bridge.getAgents();
  }

  // 发送消息给 Agent
  async sendMessage(type: FrameworkType, agentId: string, message: string): Promise<any> {
    const bridge = this.bridges.get(type);
    if (!bridge) {
      throw new Error(`Framework ${type} not found`);
    }

    const result = await bridge.sendMessage(agentId, message);
    this.emit(AgentBrotherEvent.MESSAGE_SENT, { type, agentId, message });
    this.emit(AgentBrotherEvent.MESSAGE_RECEIVED, result);
    
    return result;
  }

  // 创建 Agent
  async createAgent(type: FrameworkType, config: any): Promise<Agent> {
    const bridge = this.bridges.get(type);
    if (!bridge) {
      throw new Error(`Framework ${type} not found`);
    }

    const agent = await bridge.createAgent(config);
    this.emit(AgentBrotherEvent.AGENT_CREATED, agent);
    
    return agent;
  }

  // 更新 Agent
  async updateAgent(type: FrameworkType, agentId: string, config: any): Promise<Agent> {
    const bridge = this.bridges.get(type);
    if (!bridge) {
      throw new Error(`Framework ${type} not found`);
    }

    const agent = await bridge.updateAgent(agentId, config);
    this.emit(AgentBrotherEvent.AGENT_UPDATED, agent);
    
    return agent;
  }

  // 删除 Agent
  async deleteAgent(type: FrameworkType, agentId: string): Promise<boolean> {
    const bridge = this.bridges.get(type);
    if (!bridge) {
      throw new Error(`Framework ${type} not found`);
    }

    const result = await bridge.deleteAgent(agentId);
    if (result) {
      this.emit(AgentBrotherEvent.AGENT_DELETED, { type, agentId });
    }
    
    return result;
  }

  // 事件监听
  on(event: AgentBrotherEvent, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  // 移除事件监听
  off(event: AgentBrotherEvent, listener: (data: any) => void): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 触发事件
  private emit(event: AgentBrotherEvent, data: any): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)!;
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      }
    }
  }

  // 获取配置
  getConfig(): AgentBrotherConfig {
    return this.config;
  }

  // 更新配置
  updateConfig(config: Partial<AgentBrotherConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// 导出单例实例
export const agentBrother = new AgentBrother();
export default AgentBrother;
