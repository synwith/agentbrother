// preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electron', {
  // 测试方法
  test: () => {
    return 'Hello from Electron!';
  },
  
  // 打开浮点输入
  openFloatInput: () => {
    return ipcRenderer.invoke('open-float-input');
  },
  
  // 获取框架状态
  getFrameworkStatus: () => {
    return ipcRenderer.invoke('get-framework-status');
  },
  
  // 获取代理列表
  getAgents: (framework) => {
    return ipcRenderer.invoke('get-agents', framework);
  },
  
  // 发送消息
  sendMessage: (data) => {
    return ipcRenderer.invoke('send-message', data);
  },
  
  // 启动OpenClaw Gateway
  startOpenClawGateway: () => {
    return ipcRenderer.invoke('start-openclaw-gateway');
  },
  
  // 获取代理详细信息
  getAgentDetail: (agentId, framework) => {
    return ipcRenderer.invoke('get-agent-detail', agentId, framework);
  },
  
  // 保存代理
  saveAgent: (agentData) => {
    return ipcRenderer.invoke('save-agent', agentData);
  },
  
  // 删除代理
  deleteAgent: (agentId, framework) => {
    return ipcRenderer.invoke('delete-agent', agentId, framework);
  },
  
  // 重启框架
  restartFramework: (framework) => {
    return ipcRenderer.invoke('restart-framework', framework);
  },
  
  // 项目数据持久化
  saveProjects: (projects) => {
    return ipcRenderer.invoke('save-projects', projects);
  },
  
  loadProjects: () => {
    return ipcRenderer.invoke('load-projects');
  },
  
  // 任务数据持久化
  saveTasks: (tasks) => {
    return ipcRenderer.invoke('save-tasks', tasks);
  },
  
  loadTasks: () => {
    return ipcRenderer.invoke('load-tasks');
  },
  
  // 执行任务
  executeTask: (task) => {
    return ipcRenderer.invoke('execute-task', task);
  },
  
  // 监听任务执行更新
  onTaskExecutionUpdate: (callback) => {
    ipcRenderer.on('task-execution-update', (event, data) => {
      callback(data);
    });
  },

  // 下载并安装框架（一键安装）
  downloadAndInstallFramework: (params) => {
    return ipcRenderer.invoke('download-and-install-framework', params);
  },
  
  // 选择目录
  selectDirectory: () => {
    return ipcRenderer.invoke('select-directory');
  },
  
  // 监听安装进度
  onInstallProgress: (callback) => {
    ipcRenderer.on('install-progress', callback);
  },
  
  // 移除监听器
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('install-progress');
  }
});
