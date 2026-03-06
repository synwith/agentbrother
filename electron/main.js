import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, globalShortcut, dialog } from "electron";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawn } from "child_process";
import { homedir } from "os";
import fs from "fs";
import http from "http";
import https from "https";
import unzipper from 'unzipper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let frameworkStatus = { openclaw: { installed: false, path: "" }, zeroclaw: { installed: false, path: "" } };
let agentBrother = null;
process.env.ARK_API_KEY = "822b7a71-6416-4e4d-80a3-8db47830bbca";

// 禁用GPU加速，解决Mac上的启动问题
app.disableHardwareAcceleration();

// 禁用沙箱，解决Mac上的启动问题
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// 延迟导入AgentBrother，避免模块加载问题
async function initAgentBrother() {
  try {
    // 尝试导入编译后的JavaScript文件（从dist目录）
    // 使用 pathToFileURL 将路径转换为 file:// URL，以支持 Windows 绝对路径
    const modulePath = pathToFileURL(path.join(__dirname, "..", "dist", "index.js")).href;
    const module = await import(modulePath);
    // 使用导出的agentBrother单例
    agentBrother = module.agentBrother || new module.AgentBrother();
    // 检测并连接框架
    await agentBrother.detectFrameworks();
    await agentBrother.connectFramework('openclaw');
    await agentBrother.connectFramework('zeroclaw');
    console.log('AgentBrother initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AgentBrother:', error);
    // 尝试直接使用命令行方式作为回退
    agentBrother = {
      sendMessage: async (framework, agentId, message) => {
        return new Promise((resolve, reject) => {
          try {
            let proc;
            if (framework === "zeroclaw") {
              if (!frameworkStatus.zeroclaw.path || !fs.existsSync(frameworkStatus.zeroclaw.path)) {
                throw new Error("ZeroClaw executable not found. Please check the path in settings.");
              }
              // 使用bash来执行命令
              proc = spawn('bash', ['-c', frameworkStatus.zeroclaw.path + ' agent --message "' + message + '"'], {env: {...process.env, ARK_API_KEY: process.env.ARK_API_KEY}});
            } else {
              const openClawPath = getOpenClawPath();
              proc = spawnOpenClawAgent(message, agentId, openClawPath);
            }
            let out = ""; 
            proc.stdout.on("data", d => out += d); 
            proc.stderr.on("data", d => out += d); 
            proc.on("close", c => c === 0 ? resolve({content: out}) : reject(new Error(out)));
            proc.on("error", (error) => {
              reject(new Error(`Error executing ${framework}: ${error.message}`));
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    };
  }
}

// 获取OpenClaw安装路径（支持跨平台）
function getOpenClawPath() {
  // 优先使用已安装的路径
  if (frameworkStatus.openclaw.path && fs.existsSync(frameworkStatus.openclaw.path)) {
    // 如果路径是目录，返回目录；如果是文件，返回所在目录
    const stats = fs.statSync(frameworkStatus.openclaw.path);
    if (stats.isDirectory()) {
      return frameworkStatus.openclaw.path;
    } else {
      return path.dirname(frameworkStatus.openclaw.path);
    }
  }
  
  // 默认路径
  const home = homedir();
  return path.join(home, 'Documents/trae_projects/openclaw_test');
}

// 启动OpenClaw Gateway（跨平台支持）
async function startOpenClawGateway() {
  const openClawPath = getOpenClawPath();
  
  // 根据平台选择启动方式
  let command;
  let args;
  let cwd = openClawPath;
  
  if (process.platform === 'win32') {
    // Windows平台
    // 1. 优先检查openclaw.bat
    const openclawBat = path.join(openClawPath, 'openclaw.bat');
    if (fs.existsSync(openclawBat)) {
      command = 'cmd.exe';
      args = ['/c', openclawBat, 'gateway', '--port', '18789'];
    } else {
      // 2. 尝试使用Python直接运行
      const mainPy = path.join(openClawPath, 'main.py');
      if (fs.existsSync(mainPy)) {
        command = 'python';
        args = [mainPy, 'gateway', '--port', '18789'];
      } else {
        throw new Error('Windows上找不到OpenClaw启动文件（openclaw.bat 或 main.py）');
      }
    }
  } else {
    // Linux/Mac平台
    // 1. 优先检查openclaw.sh
    const openclawSh = path.join(openClawPath, 'openclaw.sh');
    if (fs.existsSync(openclawSh)) {
      command = 'bash';
      args = [openclawSh, 'gateway', '--port', '18789'];
    } else {
      // 2. 尝试使用Python直接运行
      const mainPy = path.join(openClawPath, 'main.py');
      if (fs.existsSync(mainPy)) {
        command = 'python3';
        args = [mainPy, 'gateway', '--port', '18789'];
      } else {
        throw new Error('Linux/Mac上找不到OpenClaw启动文件（openclaw.sh 或 main.py）');
      }
    }
  }
  
  console.log(`启动OpenClaw Gateway: ${command} ${args.join(' ')}`);
  
  const gatewayProcess = spawn(command, args, {
    cwd: openClawPath,
    detached: true,
    stdio: 'ignore'
  });
  
  // 等待Gateway启动
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 检查Gateway是否运行
  const isRunning = await new Promise((resolve) => {
    const req = http.get('http://localhost:18789/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.end();
  });
  
  return { success: isRunning, process: gatewayProcess };
}

// 执行OpenClaw Agent命令（跨平台支持）
function spawnOpenClawAgent(message, agentId, cwd) {
  let command;
  let args;
  
  if (process.platform === 'win32') {
    // Windows平台
    const openclawBat = path.join(cwd, 'openclaw.bat');
    if (fs.existsSync(openclawBat)) {
      command = 'cmd.exe';
      args = ['/c', openclawBat, 'agent', '-m', message, '--agent', agentId || 'main'];
    } else {
      const mainPy = path.join(cwd, 'main.py');
      if (fs.existsSync(mainPy)) {
        command = 'python';
        args = [mainPy, 'agent', '-m', message, '--agent', agentId || 'main'];
      } else {
        throw new Error('Windows上找不到OpenClaw启动文件');
      }
    }
  } else {
    // Linux/Mac平台
    const openclawSh = path.join(cwd, 'openclaw.sh');
    if (fs.existsSync(openclawSh)) {
      command = 'bash';
      args = [openclawSh, 'agent', '-m', message, '--agent', agentId || 'main'];
    } else {
      const mainPy = path.join(cwd, 'main.py');
      if (fs.existsSync(mainPy)) {
        command = 'python3';
        args = [mainPy, 'agent', '-m', message, '--agent', agentId || 'main'];
      } else {
        throw new Error('Linux/Mac上找不到OpenClaw启动文件');
      }
    }
  }
  
  return spawn(command, args, { cwd, env: { ...process.env } });
}

function createWindow() {
  // 确保preload.cjs路径正确
  const preloadPath = path.resolve(__dirname, "preload.cjs");
  console.log('Preload path:', preloadPath);
  
  mainWindow = new BrowserWindow({ 
    width: 1320, 
    height: 800, 
    minWidth: 990, 
    minHeight: 600, 
    title: "AgentBrother", 
    backgroundColor: "#1a1a2e", 
    webPreferences: { 
      nodeIntegration: false, 
      contextIsolation: true,
      preload: preloadPath,
      sandbox: false
    }, 
    show: false 
  });
  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("close", (event) => { if (!app.isQuitting) { event.preventDefault(); mainWindow.hide(); } });
}

function detectFrameworks() {
  const home = homedir();
  
  // 检测OpenClaw - 优先使用框架状态中保存的路径
  if (frameworkStatus.openclaw.path && fs.existsSync(frameworkStatus.openclaw.path)) {
    frameworkStatus.openclaw.installed = true;
  } else {
    // 回退到默认路径检测
    frameworkStatus.openclaw.installed = fs.existsSync(path.join(home, "Documents/trae_projects/openclaw_test/openclaw.sh"));
  }
  
  // 检测zeroclaw的两种可能路径：release和release-fast
  const zeroclawReleasePath = path.join(home, "Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release/zeroclaw");
  const zeroclawReleaseFastPath = path.join(home, "Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release-fast/zeroclaw");
  
  if (frameworkStatus.zeroclaw.path && fs.existsSync(frameworkStatus.zeroclaw.path)) {
    frameworkStatus.zeroclaw.installed = true;
  } else if (fs.existsSync(zeroclawReleasePath)) {
    frameworkStatus.zeroclaw.installed = true;
    frameworkStatus.zeroclaw.path = zeroclawReleasePath;
  } else if (fs.existsSync(zeroclawReleaseFastPath)) {
    frameworkStatus.zeroclaw.installed = true;
    frameworkStatus.zeroclaw.path = zeroclawReleaseFastPath;
  } else {
    frameworkStatus.zeroclaw.installed = false;
    frameworkStatus.zeroclaw.path = "";
  }
  
  return frameworkStatus;
}

function openFloatInput() {
  spawn("osascript", [path.join(__dirname, "..", "ui", "float-input", "macos", "float-input.applescript")], { env: { ...process.env, ARK_API_KEY: process.env.ARK_API_KEY } });
}

// 注册全局快捷键
function registerGlobalShortcuts() {
  globalShortcut.register('Cmd+Shift+A', () => {
    openFloatInput();
  });
}

ipcMain.handle("get-framework-status", async () => {
  const status = detectFrameworks();
  // 检查OpenClaw Gateway是否运行
  try {
    status.openclaw.running = await new Promise((resolve) => {
      const req = http.get('http://localhost:18789/health', (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => {
        resolve(false);
      });
      req.end();
    });
  } catch (error) {
    status.openclaw.running = false;
  }
  return status;
});
ipcMain.handle("get-agents", async (e, fw) => {
  try {
    if (fw === "openclaw") {
      // 从OpenClaw配置文件中读取代理列表
      // 优先从环境变量读取配置文件路径
      let mainConfigPath = process.env.OPENCLAW_CONFIG_PATH;
      
      if (!mainConfigPath) {
        // 尝试从常见的项目路径读取
        const possiblePaths = [
          '/Users/synwith/Documents/trae_projects/openclaw_test/openclaw-three-agents.json',
          path.join(homedir(), '.openclaw', 'openclaw.json')
        ];
        
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            mainConfigPath = possiblePath;
            break;
          }
        }
      }
      
      if (mainConfigPath && fs.existsSync(mainConfigPath)) {
        const mainConfig = JSON.parse(fs.readFileSync(mainConfigPath, 'utf8'));
        
        // OpenClaw的代理列表在 agents.list 数组中
        if (mainConfig.agents && mainConfig.agents.list && Array.isArray(mainConfig.agents.list)) {
          return mainConfig.agents.list.map(agent => {
            // 提取模型名称
            let modelName = '';
            if (typeof agent.model === 'string') {
              modelName = agent.model;
            } else if (agent.model && agent.model.primary) {
              modelName = agent.model.primary;
            }
            
            // 提取skills信息
            const skills = agent.skills || [];
            
            return {
              id: agent.id,
              name: agent.name || agent.id,
              model: modelName,
              icon: agent.identity?.avatar || '🤖',
              skills: skills
            };
          });
        }
      }
      
      // 如果配置文件不存在，返回默认代理
      return [{id:"main",name:"默认代理"}];
    } else if (fw === "zeroclaw") {
      // ZeroClaw代理列表
      return [{id:"main",name:"ZeroClaw主代理"}];
    }
    
    return [];
  } catch (error) {
    console.error('获取代理列表失败:', error);
    return [];
  }
});
ipcMain.handle("send-message", async (e, {framework, agentId, message}) => {
  try {
    if (framework === "openclaw") {
      const openClawPath = getOpenClawPath();
      
      // 清理环境变量，避免nvm冲突
      const env = { ...process.env };
      delete env.npm_config_prefix;
      
      const proc = spawnOpenClawAgent(message, agentId, openClawPath);
      proc.env = env;
      
      let out = "";
      proc.stdout.on("data", d => out += d);
      proc.stderr.on("data", d => out += d);
      
      return new Promise((resolve, reject) => {
        proc.on("close", c => c === 0 ? resolve(out) : reject(new Error(out)));
        proc.on("error", (error) => {
          reject(new Error(`Error executing OpenClaw: ${error.message}`));
        });
      });
    } else if (framework === "zeroclaw") {
      const home = homedir();
      const zeroClawPath = path.join(home, 'Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release-fast/zeroclaw');
      
      if (!fs.existsSync(zeroClawPath)) {
        throw new Error('ZeroClaw executable not found');
      }
      
      // 清理环境变量，避免nvm冲突
      const env = { ...process.env };
      delete env.npm_config_prefix;
      
      const proc = spawn('bash', ['-c', zeroClawPath + ' agent --message "' + message + '"'], { 
        env: { ...env, ARK_API_KEY: process.env.ARK_API_KEY }
      });
      
      let out = "";
      proc.stdout.on("data", d => out += d);
      proc.stderr.on("data", d => out += d);
      
      return new Promise((resolve, reject) => {
        proc.on("close", c => c === 0 ? resolve(out) : reject(new Error(out)));
        proc.on("error", (error) => {
          reject(new Error(`Error executing ZeroClaw: ${error.message}`));
        });
      });
    } else {
      throw new Error('Unsupported framework: ' + framework);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
});
ipcMain.handle("open-float-input", async () => openFloatInput());
ipcMain.handle("start-openclaw-gateway", async () => {
  try {
    const result = await startOpenClawGateway();
    return { success: result.success };
  } catch (error) {
    console.error('启动Gateway失败:', error);
    return { success: false, error: error.message };
  }
});

// 获取代理详细信息
ipcMain.handle("get-agent-detail", async (e, agentId, framework) => {
  try {
    if (framework === "openclaw") {
      // 读取OpenClaw主配置文件
      // 优先从环境变量读取配置文件路径
      let mainConfigPath = process.env.OPENCLAW_CONFIG_PATH;
      
      if (!mainConfigPath) {
        // 尝试从常见的项目路径读取
        const possiblePaths = [
          '/Users/synwith/Documents/trae_projects/openclaw_test/openclaw-three-agents.json',
          path.join(homedir(), '.openclaw', 'openclaw.json')
        ];
        
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            mainConfigPath = possiblePath;
            break;
          }
        }
      }
      
      if (mainConfigPath && fs.existsSync(mainConfigPath)) {
        const mainConfig = JSON.parse(fs.readFileSync(mainConfigPath, 'utf8'));
        
        // 从agents.list数组中查找对应代理
        if (mainConfig.agents && mainConfig.agents.list && Array.isArray(mainConfig.agents.list)) {
          const agentConfig = mainConfig.agents.list.find(a => a.id === agentId);
          
          if (agentConfig) {
            // 提取模型名称（支持 model.primary 格式）
            let modelName = '';
            if (typeof agentConfig.model === 'string') {
              modelName = agentConfig.model;
            } else if (agentConfig.model && agentConfig.model.primary) {
              modelName = agentConfig.model.primary;
            }
            
            return {
              id: agentId,
              name: agentConfig.name || agentId,
              icon: agentConfig.identity?.avatar || agentConfig.icon || '🤖',
              framework: framework,
              model: modelName,
              prompt: agentConfig.system_prompt || agentConfig.prompt || '',
              skills: agentConfig.skills || ['chat'],
              workspace: agentConfig.workspace || '',
              identity: agentConfig.identity || {},
              // 原始配置用于显示
              rawConfig: agentConfig
            };
          }
        }
      }
      
      // 返回默认配置
      return {
        id: agentId,
        name: agentId === 'main' ? '默认代理' : agentId,
        icon: '🤖',
        framework: framework,
        model: '',
        prompt: '',
        skills: ['chat'],
        workspace: '',
        identity: {},
        rawConfig: {}
      };
    } else if (framework === "zeroclaw") {
      // ZeroClaw配置
      return {
        id: agentId,
        name: agentId === 'main' ? 'ZeroClaw主代理' : agentId,
        icon: '⚡',
        framework: framework,
        model: 'deepseek-chat',
        prompt: '',
        skills: ['chat'],
        workspace: '',
        identity: {},
        rawConfig: {}
      };
    }
    
    return null;
  } catch (error) {
    console.error('获取代理详情失败:', error);
    throw error;
  }
});

// 保存代理
ipcMain.handle("save-agent", async (e, agentData) => {
  try {
    const { id, name, icon, framework, model, prompt, skills, config } = agentData;
    
    if (framework === "openclaw") {
      // 保存到OpenClaw主配置文件
      // 优先从环境变量读取配置文件路径
      let mainConfigPath = process.env.OPENCLAW_CONFIG_PATH;
      
      if (!mainConfigPath) {
        // 尝试从常见的项目路径读取
        const possiblePaths = [
          '/Users/synwith/Documents/trae_projects/openclaw_test/openclaw-three-agents.json',
          path.join(homedir(), '.openclaw', 'openclaw.json')
        ];
        
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            mainConfigPath = possiblePath;
            break;
          }
        }
      }
      
      if (!mainConfigPath) {
        throw new Error('无法找到OpenClaw配置文件');
      }
      
      // 读取现有配置
      let mainConfig = {};
      if (fs.existsSync(mainConfigPath)) {
        mainConfig = JSON.parse(fs.readFileSync(mainConfigPath, 'utf8'));
      }
      
      // 确保agents对象存在，并确保agents.list是数组
      if (!mainConfig.agents) {
        mainConfig.agents = {};
      }
      if (!mainConfig.agents.list || !Array.isArray(mainConfig.agents.list)) {
        mainConfig.agents.list = [];
      }
      
      // 查找现有代理
      const existingIndex = mainConfig.agents.list.findIndex(a => a.id === id);
      
      // 构建workspace路径
      const workspace = path.join(homedir(), '.openclaw', 'workspace', id);
      
      // 构建符合OpenClaw格式的配置对象
      const agentConfig = {
        id: id,
        name: name,
        model: {
          primary: model
        },
        workspace: workspace,
        skills: skills,
        identity: {
          name: id,
          avatar: icon || '🤖'
        }
      };
      
      // 如果有系统提示词，添加到配置中
      if (prompt && prompt.trim()) {
        agentConfig.system_prompt = prompt;
      }
      
      // 如果有额外配置，合并到配置中
      if (config && Object.keys(config).length > 0) {
        Object.assign(agentConfig, config);
      }
      
      // 更新或添加代理
      if (existingIndex >= 0) {
        // 保留原有的一些字段
        const existing = mainConfig.agents.list[existingIndex];
        mainConfig.agents.list[existingIndex] = {
          ...existing,
          ...agentConfig
        };
      } else {
        mainConfig.agents.list.push(agentConfig);
      }
      
      // 确保workspace目录存在
      if (!fs.existsSync(workspace)) {
        fs.mkdirSync(workspace, { recursive: true });
      }
      
      // 更新代理目录下的models.json文件
      const agentDir = path.join(homedir(), '.openclaw', 'agents', id);
      const modelsJsonPath = path.join(agentDir, 'agent', 'models.json');
      
      // 确保代理目录存在
      if (!fs.existsSync(path.join(agentDir, 'agent'))) {
        fs.mkdirSync(path.join(agentDir, 'agent'), { recursive: true });
      }
      
      // 读取或创建models.json文件
      let modelsConfig = {};
      if (fs.existsSync(modelsJsonPath)) {
        modelsConfig = JSON.parse(fs.readFileSync(modelsJsonPath, 'utf8'));
      }
      
      // 添加或更新模型配置
      if (!modelsConfig[model]) {
        modelsConfig[model] = {
          name: model,
          type: 'primary',
          enabled: true
        };
      }
      
      // 写入models.json文件
      fs.writeFileSync(modelsJsonPath, JSON.stringify(modelsConfig, null, 2));
      
      // 写入主配置文件
      fs.writeFileSync(mainConfigPath, JSON.stringify(mainConfig, null, 2));
      
      return { success: true, needRestart: true };
    } else if (framework === "zeroclaw") {
      // ZeroClaw配置保存
      const home = homedir();
      const configDir = path.join(home, '.zeroclaw', 'config');
      const agentsConfigPath = path.join(configDir, 'agents.toml');
      
      // 确保目录存在
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // 读取现有配置
      let agentsConfig = '';
      if (fs.existsSync(agentsConfigPath)) {
        agentsConfig = fs.readFileSync(agentsConfigPath, 'utf8');
      }
      
      // 添加或更新代理配置
      const agentToml = `
[agents.${id}]
name = "${name}"
model = "${model}"
system_prompt = """${prompt}"""
skills = [${skills.map(s => `"${s}"`).join(', ')}]
`;
      
      // 简单追加（实际应该解析和更新TOML）
      fs.writeFileSync(agentsConfigPath, agentsConfig + agentToml);
      
      return { success: true, needRestart: true };
    }
    
    return { success: false, error: '不支持的框架: ' + framework };
  } catch (error) {
    console.error('保存代理失败:', error);
    return { success: false, error: error.message };
  }
});

// 删除代理
ipcMain.handle("delete-agent", async (e, agentId, framework) => {
  try {
    if (framework === "openclaw") {
      const home = homedir();
      const agentDir = path.join(home, '.openclaw', 'agents', agentId);
      
      // 删除代理目录
      if (fs.existsSync(agentDir)) {
        fs.rmSync(agentDir, { recursive: true });
      }
      
      // 更新主配置文件
      const mainConfigPath = path.join(home, '.openclaw', 'openclaw.json');
      if (fs.existsSync(mainConfigPath)) {
        const mainConfig = JSON.parse(fs.readFileSync(mainConfigPath, 'utf8'));
        if (mainConfig.agents && mainConfig.agents[agentId]) {
          delete mainConfig.agents[agentId];
          fs.writeFileSync(mainConfigPath, JSON.stringify(mainConfig, null, 2));
        }
      }
      
      return { success: true, needRestart: true };
    } else if (framework === "zeroclaw") {
      // ZeroClaw删除逻辑
      return { success: true, needRestart: false };
    }
    
    return { success: false, error: '不支持的框架: ' + framework };
  } catch (error) {
    console.error('删除代理失败:', error);
    return { success: false, error: error.message };
  }
});

// 重启框架
ipcMain.handle("restart-framework", async (e, framework) => {
  try {
    if (framework === "openclaw") {
      // 停止现有的Gateway
      // 这里需要实现停止逻辑
      
      // 使用跨平台函数重新启动Gateway
      const result = await startOpenClawGateway();
      return { success: result.success };
    } else if (framework === "zeroclaw") {
      // ZeroClaw重启逻辑
      return { success: true };
    }
    
    return { success: false, error: '不支持的框架: ' + framework };
  } catch (error) {
    console.error('重启框架失败:', error);
    return { success: false, error: error.message };
  }
});

// 项目数据持久化
const projectsDataPath = path.join(homedir(), '.agentbrother', 'projects.json');

// 确保目录存在
function ensureProjectsDir() {
  const dir = path.dirname(projectsDataPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 保存项目数据到文件
ipcMain.handle('save-projects', async (e, projects) => {
  try {
    ensureProjectsDir();
    fs.writeFileSync(projectsDataPath, JSON.stringify(projects, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('保存项目数据失败:', error);
    return { success: false, error: error.message };
  }
});

// 从文件加载项目数据
ipcMain.handle('load-projects', async () => {
  try {
    if (!fs.existsSync(projectsDataPath)) {
      return { success: true, projects: [] };
    }
    const data = fs.readFileSync(projectsDataPath, 'utf-8');
    const projects = JSON.parse(data);
    return { success: true, projects };
  } catch (error) {
    console.error('加载项目数据失败:', error);
    return { success: false, error: error.message, projects: [] };
  }
});

// 任务数据持久化
const tasksDataPath = path.join(homedir(), '.agentbrother', 'tasks.json');

// 确保任务目录存在
function ensureTasksDir() {
  const dir = path.dirname(tasksDataPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 保存任务数据到文件
ipcMain.handle('save-tasks', async (e, tasks) => {
  try {
    ensureTasksDir();
    fs.writeFileSync(tasksDataPath, JSON.stringify(tasks, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('保存任务数据失败:', error);
    return { success: false, error: error.message };
  }
});

// 从文件加载任务数据
ipcMain.handle('load-tasks', async () => {
  try {
    if (!fs.existsSync(tasksDataPath)) {
      return { success: true, tasks: [] };
    }
    const data = fs.readFileSync(tasksDataPath, 'utf-8');
    const tasks = JSON.parse(data);
    return { success: true, tasks };
  } catch (error) {
    console.error('加载任务数据失败:', error);
    return { success: false, error: error.message, tasks: [] };
  }
});

// 执行任务
ipcMain.handle('execute-task', async (e, task) => {
  try {
    const { framework, agentId, content } = task;
    
    if (framework === 'openclaw') {
      const openClawPath = getOpenClawPath();
      
      const env = { ...process.env };
      delete env.npm_config_prefix;
      
      const proc = spawnOpenClawAgent(content, agentId, openClawPath);
      proc.env = env;
      
      let out = "";
      proc.stdout.on("data", d => {
        out += d;
        // 实时发送执行输出
        e.sender.send('task-execution-update', {
          taskId: task.id,
          output: d.toString(),
          status: 'running'
        });
      });
      proc.stderr.on("data", d => {
        out += d;
        // 实时发送错误输出
        e.sender.send('task-execution-update', {
          taskId: task.id,
          output: d.toString(),
          status: 'running'
        });
      });
      
      return new Promise((resolve, reject) => {
        proc.on("close", c => {
          if (c === 0) {
            resolve({ success: true, result: out });
          } else {
            reject(new Error(out));
          }
        });
        proc.on("error", (error) => {
          reject(new Error(`Error executing OpenClaw: ${error.message}`));
        });
      });
    } else if (framework === 'zeroclaw') {
      const home = homedir();
      const zeroClawPath = path.join(home, 'Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release-fast/zeroclaw');
      
      if (!fs.existsSync(zeroClawPath)) {
        throw new Error('ZeroClaw executable not found');
      }
      
      const env = { ...process.env };
      delete env.npm_config_prefix;
      
      const proc = spawn('bash', ['-c', zeroClawPath + ' agent --message "' + content + '"'], { 
        env: { ...env, ARK_API_KEY: process.env.ARK_API_KEY }
      });
      
      let out = "";
      proc.stdout.on("data", d => {
        out += d;
        // 实时发送执行输出
        e.sender.send('task-execution-update', {
          taskId: task.id,
          output: d.toString(),
          status: 'running'
        });
      });
      proc.stderr.on("data", d => {
        out += d;
        // 实时发送错误输出
        e.sender.send('task-execution-update', {
          taskId: task.id,
          output: d.toString(),
          status: 'running'
        });
      });
      
      return new Promise((resolve, reject) => {
        proc.on("close", c => c === 0 ? resolve({ success: true, result: out }) : reject(new Error(out)));
        proc.on("error", (error) => {
          reject(new Error(`Error executing ZeroClaw: ${error.message}`));
        });
      });
    } else {
      throw new Error('Unsupported framework: ' + framework);
    }
  } catch (error) {
    console.error('执行任务失败:', error);
    return { success: false, error: error.message };
  }
});

// 判断目录是否是框架源码目录
function isFrameworkSourceDirectory(dirPath, framework) {
  try {
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      return false;
    }

    // 检查框架特定的文件
    if (framework === 'zeroclaw') {
      // Rust项目通常有Cargo.toml
      const cargoToml = path.join(dirPath, 'Cargo.toml');
      if (fs.existsSync(cargoToml)) {
        // 验证Cargo.toml内容是否包含zeroclaw
        try {
          const content = fs.readFileSync(cargoToml, 'utf-8');
          return content.includes('zeroclaw') || content.includes('name = "zeroclaw"');
        } catch (e) {
          return false;
        }
      }
    } else if (framework === 'openclaw') {
      // OpenClaw是Python项目，检查特征文件
      // 1. 检查openclaw目录或main.py
      const openclawDir = path.join(dirPath, 'openclaw');
      const mainPy = path.join(dirPath, 'main.py');
      const requirementsTxt = path.join(dirPath, 'requirements.txt');
      const setupPy = path.join(dirPath, 'setup.py');
      const pyprojectToml = path.join(dirPath, 'pyproject.toml');
      
      // 检查是否有Python项目特征文件
      const hasPythonProject = fs.existsSync(mainPy) || 
                               fs.existsSync(requirementsTxt) || 
                               fs.existsSync(setupPy) || 
                               fs.existsSync(pyprojectToml) ||
                               fs.existsSync(openclawDir);
      
      if (hasPythonProject) {
        // 进一步验证：检查目录名或文件内容是否包含openclaw
        const dirName = path.basename(dirPath).toLowerCase();
        if (dirName.includes('openclaw')) {
          return true;
        }
        
        // 检查main.py或README是否包含openclaw
        try {
          const readmePath = path.join(dirPath, 'README.md');
          if (fs.existsSync(readmePath)) {
            const readmeContent = fs.readFileSync(readmePath, 'utf-8').toLowerCase();
            if (readmeContent.includes('openclaw')) {
              return true;
            }
          }
          
          if (fs.existsSync(mainPy)) {
            const mainContent = fs.readFileSync(mainPy, 'utf-8').toLowerCase();
            if (mainContent.includes('openclaw')) {
              return true;
            }
          }
        } catch (e) {
          // 读取失败，继续其他检查
        }
      }
      
      // 2. 检查openclaw.bat（Windows脚本）
      if (process.platform === 'win32') {
        const openclawBat = path.join(dirPath, 'openclaw.bat');
        if (fs.existsSync(openclawBat)) {
          return true;
        }
      }
      
      // 3. 检查openclaw.sh（Linux/Mac脚本）
      const openclawSh = path.join(dirPath, 'openclaw.sh');
      if (fs.existsSync(openclawSh)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`检查源码目录失败: ${dirPath}`, error);
    return false;
  }
}

// 检查cargo是否可用
async function checkCargoAvailable() {
  return new Promise((resolve) => {
    const cargoProcess = spawn('cargo', ['--version'], {
      env: { ...process.env }
    });

    let output = '';
    
    cargoProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    cargoProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    cargoProcess.on('close', (code) => {
      if (code === 0 && output.includes('cargo')) {
        console.log('Cargo可用:', output.trim());
        resolve(true);
      } else {
        console.log('Cargo不可用');
        resolve(false);
      }
    });

    cargoProcess.on('error', (err) => {
      console.log('Cargo检查出错:', err.message);
      resolve(false);
    });
  });
}

// 选择目录
ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: '选择下载路径'
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, path: '' };
  }

  return { success: true, path: result.filePaths[0] };
});

// 下载并安装框架（一键安装）
ipcMain.handle("download-and-install-framework", async (event, { framework, downloadPath }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const downloadUrls = {
        openclaw: 'https://github.com/synwith/openclaw/archive/refs/heads/main.zip',
        zeroclaw: 'https://github.com/synwith/zeroclaw/archive/refs/heads/main.zip'
      };

      const url = downloadUrls[framework];
      if (!url) {
        reject(new Error(`不支持的框架: ${framework}`));
        return;
      }

      const fileName = `${framework}.zip`;
      const filePath = path.join(downloadPath, fileName);
      
      // 检查源码是否已经存在
      // 支持两种情况：
      // 1. 用户直接选择了源码目录（如 ~/Documents/zeroclaw）
      // 2. 用户选择了包含源码目录的父目录（如 ~/Documents，下面有 zeroclaw 子目录）
      let sourceCodePath = null;
      
      // 检查用户选择的路径本身是否就是源码目录
      const isSourceCodeDir = isFrameworkSourceDirectory(downloadPath, framework);
      
      if (isSourceCodeDir) {
        // 用户直接选择了源码目录
        sourceCodePath = downloadPath;
        console.log(`${framework} 检测到用户直接选择了源码目录: ${sourceCodePath}`);
      } else {
        // 检查用户选择的路径下是否有framework子目录
        const frameworkSubDir = path.join(downloadPath, framework);
        if (fs.existsSync(frameworkSubDir) && fs.statSync(frameworkSubDir).isDirectory()) {
          const isSubDirSourceCode = isFrameworkSourceDirectory(frameworkSubDir, framework);
          if (isSubDirSourceCode) {
            sourceCodePath = frameworkSubDir;
            console.log(`${framework} 检测到源码子目录: ${sourceCodePath}`);
          }
        }
      }
      
      if (sourceCodePath) {
        console.log(`${framework} 源码已存在，跳过下载: ${sourceCodePath}`);
        event.sender.send('install-progress', { framework, progress: 10, status: '检测到源码，准备编译...' });
        
        // 直接进入编译阶段
        const targetFolder = sourceCodePath;
        
        // 对于zeroclaw，需要编译
        if (framework === 'zeroclaw') {
          // 检查cargo是否可用
          const cargoAvailable = await checkCargoAvailable();
          if (!cargoAvailable) {
            throw new Error('未检测到Rust/Cargo环境。请先安装Rust：\n\n1. 访问 https://rustup.rs/ 下载安装\n2. 或在终端运行: curl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh\n3. 安装完成后重启应用');
          }
          
          event.sender.send('install-progress', { framework, progress: 20, status: '编译中...' });
          
          await new Promise((resolveCompile, rejectCompile) => {
            const compileCommand = process.platform === 'win32' ? 'cargo' : 'cargo';
            const compileArgs = ['build', '--release'];
            
            console.log(`开始编译 ${framework}...`);
            
            const compileProcess = spawn(compileCommand, compileArgs, {
              cwd: targetFolder,
              env: { ...process.env }
            });

            let compileOutput = '';
            
            compileProcess.stdout.on('data', (data) => {
              compileOutput += data.toString();
              console.log(`编译输出: ${data.toString().trim()}`);
            });

            compileProcess.stderr.on('data', (data) => {
              compileOutput += data.toString();
              console.error(`编译错误: ${data.toString().trim()}`);
            });

            compileProcess.on('close', (code) => {
              if (code === 0) {
                console.log(`${framework} 编译完成`);
                resolveCompile();
              } else {
                const error = new Error(`编译失败，退出码: ${code}`);
                error.output = compileOutput;
                rejectCompile(error);
              }
            });

            compileProcess.on('error', (err) => {
              console.error(`${framework} 编译过程出错:`, err);
              rejectCompile(err);
            });
          });

          event.sender.send('install-progress', { framework, progress: 80, status: '配置中...' });
        } else if (framework === 'openclaw') {
          // OpenClaw不需要编译，直接配置
          event.sender.send('install-progress', { framework, progress: 50, status: '配置中...' });
        }

        // 设置执行权限（Linux/Mac）
        if (process.platform !== 'win32') {
          if (framework === 'openclaw') {
            const openclawScript = path.join(targetFolder, 'openclaw.sh');
            if (fs.existsSync(openclawScript)) {
              fs.chmodSync(openclawScript, '755');
            }
          } else if (framework === 'zeroclaw') {
            const zeroclawBinary = path.join(targetFolder, 'target', 'release', 'zeroclaw');
            if (fs.existsSync(zeroclawBinary)) {
              fs.chmodSync(zeroclawBinary, '755');
            }
          }
        }

        // 更新框架状态
        if (framework === 'zeroclaw') {
          const zeroclawBinary = path.join(targetFolder, 'target', 'release', 'zeroclaw');
          if (fs.existsSync(zeroclawBinary)) {
            frameworkStatus.zeroclaw.installed = true;
            frameworkStatus.zeroclaw.path = zeroclawBinary;
            console.log(`ZeroClaw 安装成功，路径: ${zeroclawBinary}`);
          } else {
            console.warn(`ZeroClaw 编译完成，但找不到可执行文件: ${zeroclawBinary}`);
          }
        } else if (framework === 'openclaw') {
          // OpenClaw是Python项目，不需要编译
          // 尝试多种方式找到可执行脚本或入口文件
          let openclawPath = null;
          
          // 1. 优先检查openclaw.bat (Windows)
          if (process.platform === 'win32') {
            const openclawBat = path.join(targetFolder, 'openclaw.bat');
            if (fs.existsSync(openclawBat)) {
              openclawPath = openclawBat;
            }
          }
          
          // 2. 检查openclaw.sh (Linux/Mac)
          if (!openclawPath) {
            const openclawSh = path.join(targetFolder, 'openclaw.sh');
            if (fs.existsSync(openclawSh)) {
              openclawPath = openclawSh;
            }
          }
          
          // 3. 如果没有启动脚本，使用源码目录本身
          // Python项目可以直接通过 python main.py 运行
          if (!openclawPath) {
            const mainPy = path.join(targetFolder, 'main.py');
            if (fs.existsSync(mainPy)) {
              openclawPath = targetFolder;  // 使用目录路径
            } else {
              // 如果没有main.py，也标记为已安装，使用目录路径
              openclawPath = targetFolder;
            }
          }
          
          if (openclawPath) {
            frameworkStatus.openclaw.installed = true;
            frameworkStatus.openclaw.path = openclawPath;
            frameworkStatus.openclaw.version = '1.0.0';  // 设置版本号
            console.log(`OpenClaw 安装成功，路径: ${openclawPath}`);
          }
        }

        event.sender.send('install-progress', { framework, progress: 100, status: '安装完成' });
        console.log(`${framework} 安装完成: ${targetFolder}`);
        resolve({ success: true, installPath: targetFolder });
        return;
      }

      // 源码不存在，执行下载流程
      console.log(`开始下载 ${framework} 到: ${filePath}`);

      // 确保下载目录存在
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
      }

      // 第一步：下载（带重试机制）
      const maxRetries = 3;
      let downloadSuccess = false;
      let lastError = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`下载尝试 ${attempt}/${maxRetries}: ${url}`);
          event.sender.send('install-progress', { framework, progress: 0, status: `下载中... (尝试 ${attempt}/${maxRetries})` });

          await new Promise((resolveDownload, rejectDownload) => {
            const file = fs.createWriteStream(filePath);
            let downloadedBytes = 0;
            let totalBytes = 0;
            let downloadTimeout = null;

            const cleanup = () => {
              if (downloadTimeout) {
                clearTimeout(downloadTimeout);
                downloadTimeout = null;
              }
              if (file) {
                file.destroy();
              }
            };

            const req = https.get(url, (response) => {
              // 检查HTTP响应状态
              if (response.statusCode !== 200) {
                const error = new Error(`下载失败: HTTP ${response.statusCode}`);
                cleanup();
                fs.unlink(filePath, () => {});
                rejectDownload(error);
                return;
              }

              totalBytes = parseInt(response.headers['content-length'], 10) || 0;

              response.pipe(file);

              response.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                const progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 50) : 0;
                event.sender.send('install-progress', { framework, progress, status: `下载中... (尝试 ${attempt}/${maxRetries})` });
              });

              file.on('finish', () => {
                cleanup();
                // 确保文件完全关闭
                file.close((err) => {
                  if (err) {
                    console.error(`关闭文件失败:`, err);
                    fs.unlink(filePath, () => {});
                    rejectDownload(err);
                    return;
                  }
                  console.log(`${framework} 下载完成: ${filePath}`);
                  // 验证文件大小
                  const stats = fs.statSync(filePath);
                  if (totalBytes > 0 && stats.size !== totalBytes) {
                    const error = new Error(`下载文件不完整: 期望 ${totalBytes} 字节，实际 ${stats.size} 字节`);
                    fs.unlink(filePath, () => {});
                    rejectDownload(error);
                    return;
                  }
                  resolveDownload();
                });
              });
            }).on('error', (err) => {
              cleanup();
              fs.unlink(filePath, () => {});
              console.error(`${framework} 下载失败 (尝试 ${attempt}):`, err);
              rejectDownload(err);
            });

            // 设置超时（60秒）
            downloadTimeout = setTimeout(() => {
              cleanup();
              fs.unlink(filePath, () => {});
              const error = new Error(`下载超时 (60秒)`);
              console.error(`${framework} 下载超时 (尝试 ${attempt})`);
              rejectDownload(error);
            }, 60000);
          });

          downloadSuccess = true;
          break;
        } catch (error) {
          lastError = error;
          console.error(`下载尝试 ${attempt} 失败:`, error);
          
          if (attempt < maxRetries) {
            // 等待2秒后重试
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      if (!downloadSuccess) {
        throw new Error(`下载失败，已尝试 ${maxRetries} 次。最后错误: ${lastError.message}`);
      }

      // 第二步：解压安装
      event.sender.send('install-progress', { framework, progress: 50, status: '解压中...' });

      await new Promise((resolveExtract, rejectExtract) => {
        try {
          const readStream = fs.createReadStream(filePath);
          const extractStream = unzipper.Extract({ path: downloadPath });

          readStream.pipe(extractStream)
            .on('close', () => {
              console.log(`${framework} 解压完成`);
              resolveExtract();
            })
            .on('error', (err) => {
              console.error(`${framework} 解压失败:`, err);
              rejectExtract(err);
            });
        } catch (err) {
          console.error(`${framework} 解压过程出错:`, err);
          rejectExtract(err);
        }
      });

      event.sender.send('install-progress', { framework, progress: 80, status: '配置中...' });

      // 重命名解压后的文件夹
      const extractedFolder = path.join(downloadPath, `${framework}-main`);
      const targetFolder = path.join(downloadPath, framework);

      if (fs.existsSync(extractedFolder)) {
        if (fs.existsSync(targetFolder)) {
          fs.rmSync(targetFolder, { recursive: true, force: true });
        }
        fs.renameSync(extractedFolder, targetFolder);
      } else {
        // 检查是否有其他格式的解压文件夹
        const files = fs.readdirSync(downloadPath);
        const possibleFolder = files.find(file => 
          file.startsWith(framework) && 
          fs.statSync(path.join(downloadPath, file)).isDirectory()
        );
        
        if (possibleFolder) {
          const possibleFolderPath = path.join(downloadPath, possibleFolder);
          if (fs.existsSync(targetFolder)) {
            fs.rmSync(targetFolder, { recursive: true, force: true });
          }
          fs.renameSync(possibleFolderPath, targetFolder);
        }
      }

      // 对于zeroclaw，需要编译
      if (framework === 'zeroclaw') {
        // 检查cargo是否可用
        const cargoAvailable = await checkCargoAvailable();
        if (!cargoAvailable) {
          throw new Error('未检测到Rust/Cargo环境。请先安装Rust：\n\n1. 访问 https://rustup.rs/ 下载安装\n2. 或在终端运行: curl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh\n3. 安装完成后重启应用');
        }
        
        event.sender.send('install-progress', { framework, progress: 60, status: '编译中...' });
        
        await new Promise((resolveCompile, rejectCompile) => {
          const compileCommand = process.platform === 'win32' ? 'cargo' : 'cargo';
          const compileArgs = ['build', '--release'];
          
          console.log(`开始编译 ${framework}...`);
          
          const compileProcess = spawn(compileCommand, compileArgs, {
            cwd: targetFolder,
            env: { ...process.env }
          });

          let compileOutput = '';
          
          compileProcess.stdout.on('data', (data) => {
            compileOutput += data.toString();
            console.log(`编译输出: ${data.toString().trim()}`);
          });

          compileProcess.stderr.on('data', (data) => {
            compileOutput += data.toString();
            console.error(`编译错误: ${data.toString().trim()}`);
          });

          compileProcess.on('close', (code) => {
            if (code === 0) {
              console.log(`${framework} 编译完成`);
              resolveCompile();
            } else {
              const error = new Error(`编译失败，退出码: ${code}`);
              error.output = compileOutput;
              rejectCompile(error);
            }
          });

          compileProcess.on('error', (err) => {
            console.error(`${framework} 编译过程出错:`, err);
            rejectCompile(err);
          });
        });

        event.sender.send('install-progress', { framework, progress: 80, status: '配置中...' });
      } else if (framework === 'openclaw') {
        // OpenClaw不需要编译，直接配置
        event.sender.send('install-progress', { framework, progress: 80, status: '配置中...' });
      }

      // 设置执行权限（Linux/Mac）
      if (process.platform !== 'win32') {
        if (framework === 'openclaw') {
          const openclawScript = path.join(targetFolder, 'openclaw.sh');
          if (fs.existsSync(openclawScript)) {
            fs.chmodSync(openclawScript, '755');
          }
        } else if (framework === 'zeroclaw') {
          const zeroclawBinary = path.join(targetFolder, 'target', 'release', 'zeroclaw');
          if (fs.existsSync(zeroclawBinary)) {
            fs.chmodSync(zeroclawBinary, '755');
          }
        }
      }

      // 删除下载的zip文件
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // 更新框架状态
      if (framework === 'zeroclaw') {
        const zeroclawBinary = path.join(targetFolder, 'target', 'release', 'zeroclaw');
        if (fs.existsSync(zeroclawBinary)) {
          frameworkStatus.zeroclaw.installed = true;
          frameworkStatus.zeroclaw.path = zeroclawBinary;
          console.log(`ZeroClaw 安装成功，路径: ${zeroclawBinary}`);
        } else {
          console.warn(`ZeroClaw 编译完成，但找不到可执行文件: ${zeroclawBinary}`);
        }
      } else if (framework === 'openclaw') {
        // Windows下检查openclaw.bat，Linux/Mac检查openclaw.sh
        const openclawScript = process.platform === 'win32' 
          ? path.join(targetFolder, 'openclaw.bat')
          : path.join(targetFolder, 'openclaw.sh');
        if (fs.existsSync(openclawScript)) {
          frameworkStatus.openclaw.installed = true;
          frameworkStatus.openclaw.path = openclawScript;
          console.log(`OpenClaw 安装成功，路径: ${openclawScript}`);
        } else {
          // 回退检查openclaw.sh（兼容旧版本）
          const fallbackScript = path.join(targetFolder, 'openclaw.sh');
          if (fs.existsSync(fallbackScript)) {
            frameworkStatus.openclaw.installed = true;
            frameworkStatus.openclaw.path = fallbackScript;
            console.log(`OpenClaw 安装成功，路径: ${fallbackScript}`);
          }
        }
      }

      event.sender.send('install-progress', { framework, progress: 100, status: '安装完成' });

      console.log(`${framework} 安装完成: ${targetFolder}`);
      resolve({ success: true, installPath: targetFolder });
    } catch (error) {
      console.error('下载安装框架失败:', error);
      // 清理临时文件
      const fileName = `${framework}.zip`;
      const filePath = path.join(downloadPath, fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('清理临时文件失败:', e);
        }
      }
      reject(error);
    }
  });
});

app.whenReady().then(async () => { 
  detectFrameworks(); 
  await initAgentBrother();
  createWindow();
  registerGlobalShortcuts();
});
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
app.on('will-quit', async () => {
  // 注销全局快捷键
  globalShortcut.unregisterAll();
  
  // 断开框架连接
  if (agentBrother) {
    await agentBrother.disconnectFramework('openclaw');
    await agentBrother.disconnectFramework('zeroclaw');
  }
});
