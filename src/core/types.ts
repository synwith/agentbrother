// AgentBrother - 核心类型定义

export interface Agent {
  id: string;
  name: string;
  description?: string;
  type: AgentType;
  status: AgentStatus;
  config: AgentConfig;
  framework: FrameworkType;
  createdAt: Date;
  updatedAt: Date;
}

export enum AgentType {
  CHAT = 'chat',
  CODE = 'code',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  CUSTOM = 'custom'
}

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  LOADING = 'loading'
}

export interface AgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  customParams?: Record<string, any>;
}

export enum FrameworkType {
  OPENCLAW = 'openclaw',
  ZEROCLAW = 'zeroclaw',
  CUSTOM = 'custom'
}

export interface FrameworkInfo {
  type: FrameworkType;
  name: string;
  version?: string;
  installed: boolean;
  running: boolean;
  port?: number;
  configPath?: string;
  agents: Agent[];
}

export interface Message {
  id: string;
  agentId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface FloatInputConfig {
  enabled: boolean;
  shortcut: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  alwaysOnTop: boolean;
}

export interface AgentBrotherConfig {
  floatInput: FloatInputConfig;
  frameworks: FrameworkConfig[];
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface FrameworkConfig {
  type: FrameworkType;
  enabled: boolean;
  autoDetect: boolean;
  customPath?: string;
}

// 桥接消息类型
export interface BridgeMessage {
  type: string;
  data: any;
  id?: string;
  timestamp?: Date;
}

export interface BridgeResponse {
  success: boolean;
  data?: any;
  error?: string | null;
  id?: string;
}

// 事件类型
export enum AgentBrotherEvent {
  AGENT_CREATED = 'agent:created',
  AGENT_UPDATED = 'agent:updated',
  AGENT_DELETED = 'agent:deleted',
  AGENT_STATUS_CHANGED = 'agent:status_changed',
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_SENT = 'message:sent',
  FRAMEWORK_DETECTED = 'framework:detected',
  FRAMEWORK_CONNECTED = 'framework:connected',
  FRAMEWORK_DISCONNECTED = 'framework:disconnected',
  FLOAT_INPUT_SHOW = 'float-input:show',
  FLOAT_INPUT_HIDE = 'float-input:hide'
}
