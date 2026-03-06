# AgentBrother 项目功能详解

## 1. 项目概述

AgentBrother 是一个跨平台的 Agent 管理框架，旨在统一管理 OpenClaw、ZeroClaw 等多种 Agent 框架，提供直观的用户界面和强大的管理功能。

- **统一管理**：通过一个界面管理多种 Agent 框架
- **跨平台支持**：基于 Electron 构建，支持 Windows、macOS、Linux
- **项目协作**：支持多角色协作聊天，@提及功能
- **浮动输入**：全局快捷键触发的浮动输入框，提高使用效率
- **框架集成**：深度集成 OpenClaw 和 ZeroClaw 框架

## 2. 系统架构

### 2.1 整体架构

AgentBrother 采用分层架构设计，主要包含以下层次：

- **表现层**：Electron 渲染进程，负责 UI 展示和用户交互
- **业务逻辑层**：Electron 主进程，处理核心业务逻辑
- **框架桥接层**：统一的框架桥接接口，适配不同的 Agent 框架
- **底层框架**：OpenClaw、ZeroClaw 等 Agent 框架

### 2.2 核心模块

| 模块 | 主要职责 | 文件位置 |
|------|---------|----------|
| 主进程 | 应用入口，框架管理，IPC 通信 | electron/main.js |
| 渲染进程 | UI 展示，用户交互 | electron/renderer/ |
| 核心模块 | 框架桥接，类型定义 | src/core/ |
| 项目管理 | 项目创建，角色管理，聊天功能 | electron/renderer/projects.js |
| 代理管理 | Agent 创建，配置，管理 | electron/renderer/agents.js |
| 浮点输入 | 全局浮动输入框 | electron/renderer/floatInput.js |
| 配置管理 | 框架配置，软件设置 | electron/renderer/settings.js |

## 3. 核心功能

### 3.1 框架管理

- **框架检测**：自动检测系统中安装的 OpenClaw 和 ZeroClaw 框架
- **框架连接**：建立与各框架的连接，确保通信正常
- **Gateway 管理**：启动和监控 OpenClaw Gateway 服务
- **框架状态监控**：实时显示框架的运行状态

### 3.2 Agent 管理

- **Agent 列表**：展示所有可用的 Agent
- **Agent 创建**：创建新的 Agent，支持自定义配置
- **Agent 编辑**：修改 Agent 的配置，包括模型、提示词等
- **Agent 删除**：删除不需要的 Agent
- **Agent 详情**：查看 Agent 的详细信息和配置

### 3.3 项目管理

- **项目创建**：创建新的项目，设置项目名称和描述
- **角色管理**：为项目添加角色，每个角色可以绑定一个 Agent
- **多角色协作**：支持多个角色在项目中协作
- **项目聊天**：项目内的聊天功能，支持@提及功能
- **文件上传**：支持上传文档并解析内容

### 3.4 浮点输入

- **全局快捷键**：通过 Cmd+Shift+A 触发浮动输入框
- **快速输入**：无需打开主应用即可快速与 Agent 交互
- **多框架支持**：可以选择不同的框架和 Agent 进行交互

### 3.5 配置管理

- **框架配置**：管理各框架的配置参数
- **软件设置**：设置软件的主题、语言等
- **快捷键设置**：自定义全局快捷键

## 4. 技术实现

### 4.1 框架桥接

AgentBrother 通过抽象的框架桥接层，实现了对不同 Agent 框架的统一管理。桥接层定义了标准的接口，各框架实现自己的桥接类。

```typescript
// 框架桥接基类
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

  // ...
}
```

### 4.2 IPC 通信

Electron 主进程和渲染进程之间通过 IPC 通信进行数据交换：

- **主进程**：负责框架管理、Agent 操作、文件系统访问等
- **渲染进程**：负责 UI 展示和用户交互
- **IPC 通道**：通过 `ipcMain` 和 `ipcRenderer` 进行通信

### 4.3 数据持久化

- **项目数据**：存储在 `~/.agentbrother/projects.json` 文件中
- **框架配置**：存储在各框架的配置文件中
- **软件设置**：存储在本地配置文件中

### 4.4 文件上传与解析

- **支持的文件类型**：文本文件、PDF、Word 文档等
- **解析方式**：使用 `mammoth` 解析 Word 文档，使用 `pdf-parse` 解析 PDF 文件
- **拖拽上传**：支持通过拖拽方式上传文件

## 5. 核心 API

### 5.1 AgentBrother 核心类

```typescript
class AgentBrother {
  // 检测所有框架
  async detectFrameworks(): Promise<Map<FrameworkType, FrameworkInfo>>
  
  // 连接框架
  async connectFramework(type: FrameworkType): Promise<boolean>
  
  // 断开框架连接
  async disconnectFramework(type: FrameworkType): Promise<void>
  
  // 获取指定框架的 Agent 列表
  async getAgents(type: FrameworkType): Promise<Agent[]>
  
  // 发送消息给 Agent
  async sendMessage(type: FrameworkType, agentId: string, message: string): Promise<any>
  
  // 创建 Agent
  async createAgent(type: FrameworkType, config: any): Promise<Agent>
  
  // 更新 Agent
  async updateAgent(type: FrameworkType, agentId: string, config: any): Promise<Agent>
  
  // 删除 Agent
  async deleteAgent(type: FrameworkType, agentId: string): Promise<boolean>
  
  // 事件监听
  on(event: AgentBrotherEvent, listener: (data: any) => void): void
  
  // 移除事件监听
  off(event: AgentBrotherEvent, listener: (data: any) => void): void
  
  // 获取配置
  getConfig(): AgentBrotherConfig
  
  // 更新配置
  updateConfig(config: Partial<AgentBrotherConfig>): void
}
```

### 5.2 IPC 接口

| 接口名称 | 功能描述 | 参数 | 返回值 |
|---------|---------|------|--------|
| get-framework-status | 获取框架状态 | 无 | 框架状态对象 |
| get-agents | 获取代理列表 | framework: string | 代理列表 |
| send-message | 发送消息给代理 | {framework, agentId, message} | 消息响应 |
| open-float-input | 打开浮点输入 | 无 | 无 |
| start-openclaw-gateway | 启动 OpenClaw Gateway | 无 | 启动结果 |
| get-agent-detail | 获取代理详情 | agentId: string, framework: string | 代理详情 |
| save-agent | 保存代理配置 | agentData: object | 保存结果 |
| delete-agent | 删除代理 | agentId: string, framework: string | 删除结果 |
| restart-framework | 重启框架 | framework: string | 重启结果 |
| save-projects | 保存项目数据 | projects: array | 保存结果 |
| load-projects | 加载项目数据 | 无 | 项目数据 |

## 6. 项目结构

```
agentbrother/
├── dist/              # 编译后的 JavaScript 文件
│   ├── core/          # 核心模块
│   │   └── bridges/   # 框架桥接实现
├── docs/              # 文档
├── electron/          # Electron 应用代码
│   ├── renderer/      # 渲染进程代码
│   │   ├── index.html # 主界面
│   │   ├── main.js    # 渲染进程入口
│   │   ├── projects.js # 项目管理
│   │   ├── agents.js  # 代理管理
│   │   ├── floatInput.js # 浮点输入
│   │   ├── settings.js # 配置管理
│   │   └── styles.css # 样式文件
│   ├── main.js        # 主进程入口
│   └── preload.cjs    # 预加载脚本
├── src/               # 源代码（TypeScript）
│   ├── core/          # 核心模块
│   │   ├── bridges/   # 框架桥接
│   │   └── types.ts   # 类型定义
│   ├── web/           # Web 版本
│   └── index.ts       # 主入口
├── ui/                # 用户界面相关文件
│   └── float-input/   # 浮点输入相关
├── test-files/        # 测试文件
├── README.md          # 项目说明
├── package.json       # 项目配置
└── tsconfig.json      # TypeScript 配置
```

## 7. 配置与部署

### 7.1 开发环境

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **编译 TypeScript**：
   ```bash
   npm run build
   ```

3. **启动开发服务器**：
   ```bash
   npm run dev
   ```

### 7.2 生产部署

1. **构建应用**：
   ```bash
   npm run dist
   ```

2. **部署到不同平台**：
   - macOS：生成 `.dmg` 文件
   - Windows：生成 `.exe` 安装包
   - Linux：生成 `.AppImage` 文件

## 8. 扩展与定制

### 8.1 添加新的框架支持

1. **创建新的桥接类**：继承 `FrameworkBridge` 基类
2. **实现必要的方法**：`detect()`, `connect()`, `getAgents()` 等
3. **注册到 AgentBrother**：在 `initializeBridges()` 方法中添加

### 8.2 自定义主题

1. **修改样式文件**：`electron/renderer/styles.css`
2. **更新配置**：在 `AgentBrotherConfig` 中添加主题设置

### 8.3 添加新功能

1. **创建新的渲染进程模块**：如 `new-feature.js`
2. **添加 IPC 接口**：在 `electron/main.js` 中添加
3. **更新 UI**：在 `index.html` 中添加相应的页面

## 9. 最佳实践

### 9.1 项目管理

- **角色设计**：为每个项目创建明确的角色，每个角色绑定一个 Agent
- **权限管理**：合理设置角色权限，确保项目安全
- **文件组织**：使用文件夹组织项目文件，保持结构清晰

### 9.2 Agent 配置

- **模型选择**：根据任务类型选择合适的模型
- **提示词优化**：精心设计系统提示词，提高 Agent 性能
- **参数调优**：根据具体场景调整温度、最大令牌数等参数

### 9.3 性能优化

- **框架选择**：根据任务需求选择合适的框架
- **资源管理**：合理分配系统资源，避免过度消耗
- **缓存策略**：使用缓存减少重复计算

## 10. 未来规划

### 10.1 功能扩展

- **支持更多框架**：添加对其他 Agent 框架的支持
- **云服务集成**：集成云服务，实现远程 Agent 管理
- **AI 辅助功能**：添加 AI 辅助配置、优化等功能
- **插件系统**：支持插件扩展，增强功能

### 10.2 性能优化

- **资源使用优化**：减少内存和 CPU 消耗
- **响应速度提升**：优化消息处理和 UI 渲染
- **并行处理**：支持多 Agent 并行处理任务

### 10.3 用户体验

- **界面优化**：改进 UI 设计，提升用户体验
- **交互增强**：添加更多交互方式，如语音输入
- **个性化设置**：支持更多个性化配置选项

## 11. 总结

AgentBrother 是一个功能强大、架构清晰的 Agent 管理框架，通过统一的界面和标准化的接口，简化了多框架 Agent 的管理和使用。它不仅提供了丰富的功能，还具有良好的扩展性和定制性，为开发者和用户提供了一个高效、便捷的 Agent 管理解决方案。

通过持续的开发和改进，AgentBrother 有望成为 Agent 管理领域的标准工具，为 AI 应用的开发和部署提供有力支持。