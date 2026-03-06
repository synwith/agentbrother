// preload.js
import { contextBridge, ipcRenderer } from 'electron';

// 向渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electron', {
  // 测试方法
  test: () => {
    return 'Hello from Electron!';
  },
  
  // 启动OpenClaw Gateway
  startOpenClawGateway: () => {
    return ipcRenderer.invoke('start-openclaw-gateway');
  },
  
  // 获取框架状态
  getFrameworkStatus: () => {
    return ipcRenderer.invoke('get-framework-status');
  },

  // 下载并安装框架（一键安装）
  downloadAndInstallFramework: (params) => {
    return ipcRenderer.invoke('download-and-install-framework', params);
  },

  // 选择目录
  selectDirectory: () => {
    return ipcRenderer.invoke('select-directory');
  },

  // 监听下载进度
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', callback);
  },

  // 监听安装进度
  onInstallProgress: (callback) => {
    ipcRenderer.on('install-progress', callback);
  },

  // 移除监听器
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('download-progress');
    ipcRenderer.removeAllListeners('install-progress');
  }
});
