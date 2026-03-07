<p align="center">
  <img src="asset/logo_cool.png" alt="AgentBrother Logo" width="400" height="400">
</p>

**[中文](README.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md)**

# 龙哥（AgentBrother）

跨平台 Agent 管理框架 - 统一管理 OpenClaw、ZeroClaw 等 Agent 框架，方便用户所见即所得创建 AI 数字员工等智能体。

## 项目目的

龙哥的核心目标是为用户提供一个统一的、跨平台的界面，用于管理和使用各种 AI Agent 框架，如 OpenClaw 和 ZeroClaw。通过龙哥，用户可以：

- 统一管理多个 Agent 框架，无需在不同工具之间切换
- 所见即所得地创建、配置和使用 AI 数字员工
- 在不同平台（Mac、Windows、Web、手机）上获得一致的使用体验
- 简化 Agent 的创建和管理流程，降低使用门槛

龙哥不只是为了管理龙虾和螃蟹，更是为了让普通用户轻松创作出好玩、有趣、有用的 AI 代理数字人、数字宠物等。我们给每个 Agent 赋予独特的情感和个性，让它们成为你生活中的得力助手和伙伴！

## 功能特性

### 核心功能
- **多框架支持**：集成 OpenClaw、ZeroClaw 等主流 Agent 框架
- **跨平台兼容**：支持 Mac、Windows、Web 和移动设备
- **所见即所得**：直观的界面，轻松创建和配置 AI 数字员工
- **统一管理**：集中管理所有 Agent，包括状态监控和配置
- **浮点输入**：支持全局快捷方式调出浮点输入窗口，快速与 Agent 交互
- **文件拖拽**：支持拖拽上传 txt、doc、docx、pdf 文件，自动解析内容并整合到对话中
- **自动启动**：启动应用后自动检测并启动 OpenClaw Gateway

### 技术特性
- **Electron 桌面应用**：提供原生桌面体验
- **Web 界面**：支持通过浏览器访问
- **TypeScript**：类型安全的代码库
- **模块化设计**：易于扩展和集成新的 Agent 框架
- **实时通信**：支持与 Agent 的实时交互
- **本地文件解析**：在本地解析文件内容，节省 Token 消耗

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- npm >= 10.0.0

### 安装依赖

```bash
npm install
```

### 开发模式运行

#### 桌面应用

```bash
npm run dev
```

#### Web 应用

```bash
npm run start:web
```

### 构建应用

```bash
# 编译 TypeScript
npm run build

# 打包桌面应用
npm run dist
```

## 项目结构

```
agentbrother/
├── docs/                   # 文档
├── electron/               # Electron 主进程代码
│   ├── main.js            # 主进程入口
│   ├── preload.js         # 预加载脚本
│   └── renderer/          # 渲染进程代码
│       ├── index.html     # 主界面
│       ├── styles.css     # 样式文件
│       ├── main.js        # 渲染进程主逻辑
│       ├── framework.js   # 框架管理模块
│       ├── agents.js      # 代理管理模块
│       ├── floatInput.js  # 浮点输入模块
│       └── settings.js    # 设置模块
├── src/                    # 核心代码
│   ├── core/              # 核心功能
│   │   ├── bridges/       # 框架桥接（OpenClaw、ZeroClaw）
│   │   └── types.ts       # 类型定义
│   ├── web/               # Web 服务器
│   └── index.ts           # 主入口
├── ui/                     # 用户界面
│   └── float-input/       # 浮点输入组件
├── dist/                   # TypeScript 编译输出
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
└── README.md              # 项目说明
```

## 使用指南

### 创建 AI 数字员工

1. 打开 AgentBrother 应用
2. 在左侧导航栏点击「代理」
3. 选择一个 Agent 框架（OpenClaw 或 ZeroClaw）
4. 点击「创建新代理」按钮
5. 填写代理名称、选择图标、配置模型参数
6. 点击「保存」按钮完成创建

### 与 Agent 交互

1. 在左侧导航栏点击「浮点输入」
2. 选择要对话的 Agent
3. 在输入框中输入消息或拖拽文件到输入区域
4. 点击发送按钮或按 Enter 键
5. 等待 Agent 回复

### 使用浮点输入

1. 按下全局快捷方式（默认为 `Cmd+Shift+A`）
2. 在弹出的浮点窗口中输入消息
3. 按 Enter 键发送消息
4. 查看 Agent 回复

### 文件拖拽功能

支持拖拽以下格式文件到聊天区域：
- **.txt** - 纯文本文件，直接读取内容
- **.doc/.docx** - Word 文档，使用 mammoth.js 提取文本
- **.pdf** - PDF 文件，使用 pdf-parse 提取文本

文件大小限制：100KB

### 配置消耗管理

1. 在左侧导航栏点击「配置消耗」
2. 查看 OpenClaw 和 ZeroClaw 框架状态
3. 点击「启动 Gateway」手动启动 OpenClaw Gateway
4. 应用启动时会自动检测并启动 OpenClaw Gateway（如果已安装）

## 支持的平台

- **Mac**：通过 Electron 应用（主要支持平台）
- **Windows**：通过 Electron 应用
- **Web**：通过浏览器访问
- **移动设备**：通过 Web 界面

## 配置

### 框架配置

AgentBrother 会自动检测系统中安装的 OpenClaw 和 ZeroClaw 框架：

- **OpenClaw**：检测路径 `~/Documents/trae_projects/openclaw_test/openclaw.sh`
- **ZeroClaw**：检测路径 `~/Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release-fast/zeroclaw`

### 浮点输入配置

可以在设置中配置浮点输入的：
- 启用/禁用状态
- 全局快捷方式（默认 `Cmd+Shift+A`）
- 位置（左上角、右上角、左下角、右下角、中心）
- 透明度
- 是否始终置顶

### 环境变量

- `ARK_API_KEY` - 火山引擎 API 密钥
- `OPENCLAW_CONFIG_PATH` - OpenClaw 配置文件路径（可选）

## 扩展

### 添加新的 Agent 框架

要添加新的 Agent 框架，需要：

1. 在 `src/core/bridges/` 目录下创建一个新的桥接类，继承自 `FrameworkBridge`
2. 实现所有抽象方法（detect、connect、disconnect、getAgents、sendMessage 等）
3. 在 `src/index.ts` 中注册新的桥接类
4. 在 `electron/renderer/agents.js` 中添加框架特定的配置 UI

### 支持的 Agent 类型

AgentBrother 支持多种 Agent 类型：
- **chat** - 聊天型 Agent
- **code** - 代码型 Agent
- **image** - 图像型 Agent
- **video** - 视频型 Agent
- **audio** - 音频型 Agent
- **custom** - 自定义型 Agent

## 开发指南

### 技术栈

- **前端**：HTML5、CSS3、JavaScript (ES6+)
- **桌面**：Electron 33+
- **后端**：Node.js、Express
- **类型**：TypeScript 5+
- **构建**：electron-builder

### 文件解析依赖

- **mammoth** (^1.11.0) - 解析 .docx 文件
- **pdf-parse** (^2.4.5) - 解析 .pdf 文件

### 开发注意事项

1. **TypeScript 编译**：修改 `src/` 目录下的文件后需要运行 `npm run build` 编译
2. **Electron 主进程**：修改 `electron/main.js` 后需要重启应用
3. **渲染进程**：修改 `electron/renderer/` 下的文件后刷新页面即可
4. **文件解析**：文件解析功能依赖 Node.js 环境，仅在 Electron 中可用

## 常见问题

### Q: 启动时提示 "Electron API 未就绪"
A: 这是正常的初始化顺序问题，应用会在 1 秒后自动重试。如果持续出现，请检查 Electron 是否正确加载。

### Q: OpenClaw Gateway 无法自动启动
A: 请检查：
1. OpenClaw 是否已安装在默认路径
2. `openclaw.sh` 脚本是否有执行权限
3. 端口 18789 是否被占用

### Q: 文件拖拽功能不可用
A: 文件拖拽功能仅在 Electron 桌面应用中可用，Web 版本不支持。

### Q: 编译时出现类型错误
A: 请确保使用 Node.js 20+ 版本，并运行 `npm install` 安装所有依赖。

## 贡献

欢迎贡献代码、报告问题或提出建议！

### 提交 Issue

请描述：
- 问题现象
- 复现步骤
- 期望行为
- 实际行为
- 环境信息（操作系统、Node.js 版本等）

### 提交 PR

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 OpenClaw 和 ZeroClaw 框架
- 实现浮点输入功能
- 支持文件拖拽解析（txt、doc、docx、pdf）
- 自动启动 OpenClaw Gateway
- 跨平台支持（Mac、Windows、Web）
