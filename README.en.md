<p align="center">
  <img src="asset/logo_cool.png" alt="AgentBrother Logo" width="400" height="400">
</p>

**[中文](README.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md)**

# AgentBrother

Cross-platform Agent Management Framework - Unified management of OpenClaw, ZeroClaw and other Agent frameworks, enabling users to create AI digital employees and other agents with a what-you-see-is-what-you-get approach.

## Project Purpose

The core goal of AgentBrother is to provide users with a unified, cross-platform interface for managing and using various AI Agent frameworks, such as OpenClaw and ZeroClaw. With AgentBrother, users can:

- Manage multiple Agent frameworks in one place, no need to switch between different tools
- Create, configure and use AI digital employees with a what-you-see-is-what-you-get approach
- Get a consistent user experience across different platforms (Mac, Windows, Web, mobile devices)
- Simplify the creation and management process of Agents, lowering the barrier to use

## Features

### Core Features
- **Multi-framework support**: Integrates mainstream Agent frameworks like OpenClaw and ZeroClaw
- **Cross-platform compatibility**: Supports Mac, Windows, Web and mobile devices
- **What-you-see-is-what-you-get**: Intuitive interface, easily create and configure AI digital employees
- **Unified management**: Centralized management of all Agents, including status monitoring and configuration
- **Floating input**: Supports global hotkey to bring up floating input window for quick Agent interaction
- **File drag-and-drop**: Supports dragging and uploading txt, doc, docx, pdf files, automatically parses content and integrates into conversations
- **Auto-start**: Automatically detects and starts OpenClaw Gateway after application launch

### Technical Features
- **Electron desktop app**: Provides native desktop experience
- **Web interface**: Supports access through browsers
- **TypeScript**: Type-safe codebase
- **Modular design**: Easy to extend and integrate new Agent frameworks
- **Real-time communication**: Supports real-time interaction with Agents
- **Local file parsing**: Parses file content locally, saving Token consumption

## Quick Start

### Requirements

- Node.js >= 20.0.0
- npm >= 10.0.0

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

#### Desktop App

```bash
npm run dev
```

#### Web App

```bash
npm run start:web
```

### Build Application

```bash
# Compile TypeScript
npm run build

# Package desktop app
npm run dist
```

## Project Structure

```
agentbrother/
├── docs/                   # Documentation
├── electron/               # Electron main process code
│   ├── main.js            # Main process entry
│   ├── preload.js         # Preload script
│   └── renderer/          # Renderer process code
│       ├── index.html     # Main interface
│       ├── styles.css     # Style files
│       ├── main.js        # Renderer main logic
│       ├── framework.js   # Framework management module
│       ├── agents.js      # Agent management module
│       ├── floatInput.js  # Floating input module
│       └── settings.js    # Settings module
├── src/                    # Core code
│   ├── core/              # Core functionality
│   │   ├── bridges/       # Framework bridges (OpenClaw, ZeroClaw)
│   │   └── types.ts       # Type definitions
│   ├── web/               # Web server
│   └── index.ts           # Main entry
├── ui/                     # User interface
│   └── float-input/       # Floating input component
├── dist/                   # TypeScript compilation output
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## Usage Guide

### Creating AI Digital Employees

1. Open AgentBrother application
2. Click "Agents" in the left sidebar
3. Select an Agent framework (OpenClaw or ZeroClaw)
4. Click "Create New Agent" button
5. Fill in agent name, select icon, configure model parameters
6. Click "Save" button to complete creation

### Interacting with Agents

1. Click "Floating Input" in the left sidebar
2. Select the Agent to chat with
3. Type message in the input box or drag files to the input area
4. Click send button or press Enter key
5. Wait for Agent response

### Using Floating Input

1. Press global hotkey (default `Cmd+Shift+A`)
2. Type message in the floating window
3. Press Enter key to send message
4. View Agent response

### File Drag-and-Drop Feature

Supports dragging the following file formats to the chat area:
- **.txt** - Plain text files, read content directly
- **.doc/.docx** - Word documents, use mammoth.js to extract text
- **.pdf** - PDF files, use pdf-parse to extract text

File size limit: 100KB

### Configuration Management

1. Click "Configuration" in the left sidebar
2. View OpenClaw and ZeroClaw framework status
3. Click "Start Gateway" to manually start OpenClaw Gateway
4. Application will automatically detect and start OpenClaw Gateway on startup (if installed)

## Supported Platforms

- **Mac**: Via Electron app (main supported platform)
- **Windows**: Via Electron app
- **Web**: Via browser access
- **Mobile devices**: Via Web interface

## Configuration

### Framework Configuration

AgentBrother automatically detects OpenClaw and ZeroClaw frameworks installed in the system:

- **OpenClaw**: Detects path `~/Documents/trae_projects/openclaw_test/openclaw.sh`
- **ZeroClaw**: Detects path `~/Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release-fast/zeroclaw`

### Floating Input Configuration

You can configure floating input in settings:
- Enable/disable status
- Global hotkey (default `Cmd+Shift+A`)
- Position (top-left, top-right, bottom-left, bottom-right, center)
- Transparency
- Always on top

### Environment Variables

- `ARK_API_KEY` - Volcano Engine API key
- `OPENCLAW_CONFIG_PATH` - OpenClaw configuration file path (optional)

## Extension

### Adding New Agent Frameworks

To add a new Agent framework, you need to:

1. Create a new bridge class in `src/core/bridges/` directory, inheriting from `FrameworkBridge`
2. Implement all abstract methods (detect, connect, disconnect, getAgents, sendMessage, etc.)
3. Register the new bridge class in `src/index.ts`
4. Add framework-specific configuration UI in `electron/renderer/agents.js`

### Supported Agent Types

AgentBrother supports multiple Agent types:
- **chat** - Chat-type Agent
- **code** - Code-type Agent
- **image** - Image-type Agent
- **video** - Video-type Agent
- **audio** - Audio-type Agent
- **custom** - Custom-type Agent

## Development Guide

### Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Desktop**: Electron 33+
- **Backend**: Node.js, Express
- **Types**: TypeScript 5+
- **Build**: electron-builder

### File Parsing Dependencies

- **mammoth** (^1.11.0) - Parse .docx files
- **pdf-parse** (^2.4.5) - Parse .pdf files

### Development Notes

1. **TypeScript compilation**: After modifying files in `src/` directory, run `npm run build` to compile
2. **Electron main process**: After modifying `electron/main.js`, restart the application
3. **Renderer process**: After modifying files in `electron/renderer/`, refresh the page
4. **File parsing**: File parsing functionality depends on Node.js environment, only available in Electron

## FAQ

### Q: "Electron API not ready" on startup
A: This is a normal initialization sequence issue, the application will automatically retry after 1 second. If it persists, check if Electron is loaded correctly.

### Q: OpenClaw Gateway cannot start automatically
A: Please check:
1. Whether OpenClaw is installed in the default path
2. Whether `openclaw.sh` script has execute permission
3. Whether port 18789 is occupied

### Q: File drag-and-drop feature not available
A: File drag-and-drop feature is only available in Electron desktop app, not in Web version.

### Q: Type errors during compilation
A: Please ensure you are using Node.js 20+ version and run `npm install` to install all dependencies.

## Contributing

Contributions are welcome! Feel free to contribute code, report issues or suggest improvements!

### Submitting Issues

Please describe:
- Issue phenomenon
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment information (OS, Node.js version, etc.)

### Submitting PRs

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

## License

MIT License

## Changelog

### v1.0.0
- Initial release
- Support for OpenClaw and ZeroClaw frameworks
- Implement floating input feature
- Support file drag-and-drop parsing (txt, doc, docx, pdf)
- Auto-start OpenClaw Gateway
- Cross-platform support (Mac, Windows, Web)
