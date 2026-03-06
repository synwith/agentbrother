// 框架配置模块
// 负责处理框架状态管理和启动功能

// 模拟Electron API（当preload.js加载失败时使用）
if (!window.electron) {
  console.warn('Electron API未加载，使用模拟API');
  window.electron = {
    test: () => 'Hello from Mock Electron!',
    startOpenClawGateway: async () => {
      return { success: false, error: 'Electron API未就绪' };
    },
    getFrameworkStatus: async () => {
      return { openclaw: { installed: false, running: false }, zeroclaw: { installed: false, running: false } };
    },
    downloadAndInstallFramework: async () => {
      return { success: false, error: 'Electron API未就绪' };
    },
    selectDirectory: async () => {
      return { success: false, path: '' };
    }
  };
}

// 调试函数：检查Electron API状态
function debugElectronAPI() {
  console.log('=== Electron API 状态检查 ===');
  console.log('window.electron:', window.electron);
  console.log('window.electron存在:', !!window.electron);
  if (window.electron) {
    console.log('startOpenClawGateway方法存在:', typeof window.electron.startOpenClawGateway === 'function');
    console.log('getFrameworkStatus方法存在:', typeof window.electron.getFrameworkStatus === 'function');
    console.log('所有方法:', Object.keys(window.electron));
  }
  console.log('=============================');
}

// 初始化框架配置模块
function initFramework() {
  const startBtn = document.getElementById('openclaw-start-btn');
  if (!startBtn) {
    console.error('启动按钮未找到');
    return;
  }

  // 启动时检查Electron API状态
  debugElectronAPI();

  // 启动OpenClaw Gateway
  startBtn.addEventListener('click', async () => {
    debugElectronAPI(); // 点击时再次检查
    await startOpenClawGateway();
  });

  // 初始化下载和安装功能
  initDownloadAndInstall();

  // 延迟自动检测并启动OpenClaw Gateway，确保Electron API已加载
  setTimeout(() => {
    checkElectronReadyAndStartGateway();
  }, 1000);

  // 更新框架状态显示
  setTimeout(() => {
    updateFrameworkStatusDisplay();
  }, 1500);
}

// 检查Electron API是否就绪，然后启动Gateway
function checkElectronReadyAndStartGateway() {
  if (window.electron && window.electron.startOpenClawGateway) {
    console.log('Electron API就绪，开始自动启动OpenClaw Gateway');
    autoStartOpenClawGateway();
  } else {
    console.log('Electron API未就绪，5秒后重试...');
    // 5秒后再次检查
    setTimeout(() => {
      checkElectronReadyAndStartGateway();
    }, 5000);
  }
}

// 启动OpenClaw Gateway
async function startOpenClawGateway() {
  const startBtn = document.getElementById('openclaw-start-btn');

  // 检查是否在Electron环境中
  if (!window.electron) {
    console.error('Electron API未加载');
    alert('启动失败: 不在Electron环境中');
    return;
  }

  if (!window.electron.startOpenClawGateway) {
    console.error('startOpenClawGateway方法未找到');
    alert('启动失败: 功能未可用');
    return;
  }

  try {
    startBtn.textContent = '启动中...';
    startBtn.disabled = true;

    // 通过IPC调用主进程启动Gateway
    const result = await window.electron.startOpenClawGateway();

    if (result.success) {
      await updateFrameworkStatus();
      alert('OpenClaw Gateway启动成功！');
    } else {
      alert('启动失败: ' + (result.error || '未知错误'));
      await updateFrameworkStatus();
    }
  } catch (error) {
    console.error('启动Gateway失败:', error);
    alert('启动失败: ' + error.message);
    await updateFrameworkStatus();
  } finally {
    startBtn.textContent = '启动Gateway';
    startBtn.disabled = false;
  }
}

// 自动检测并启动OpenClaw Gateway
async function autoStartOpenClawGateway() {
  // 检查是否在Electron环境中
  if (!window.electron) {
    console.log('window.electron未定义，跳过自动启动');
    return;
  }
  
  if (!window.electron.getFrameworkStatus) {
    console.log('getFrameworkStatus方法未找到，跳过自动启动');
    return;
  }
  
  if (!window.electron.startOpenClawGateway) {
    console.log('startOpenClawGateway方法未找到，跳过自动启动');
    return;
  }

  try {
    // 获取框架状态
    const status = await window.electron.getFrameworkStatus();

    // 如果OpenClaw已安装但未运行，自动启动
    if (status.openclaw.installed && !status.openclaw.running) {
      console.log('OpenClaw已安装但未运行，正在自动启动...');
      await startOpenClawGateway();
    } else {
      console.log('OpenClaw状态:', status.openclaw.installed ? '已运行' : '未安装');
    }
  } catch (error) {
    console.error('自动启动OpenClaw Gateway失败:', error);
  }
}

// 更新框架状态
async function updateFrameworkStatus() {
  try {
    // 检查Electron API是否可用
    if (!window.electron || !window.electron.getFrameworkStatus) {
      console.error('Electron API未加载，无法获取框架状态');
      return;
    }

    const status = await window.electron.getFrameworkStatus();

    // 更新OpenClaw状态
    const openclawStatus = document.getElementById('openclaw-status');
    const openclawGatewayStatus = document.getElementById('openclaw-gateway-status');
    if (openclawStatus) openclawStatus.textContent = status.openclaw.installed ? '已安装' : '未安装';
    if (openclawGatewayStatus) openclawGatewayStatus.textContent = status.openclaw.running ? '运行中' : '未运行';

    // 更新ZeroClaw状态
    const zeroclawStatus = document.getElementById('zeroclaw-status');
    if (zeroclawStatus) zeroclawStatus.textContent = status.zeroclaw.installed ? '已安装' : '未安装';

    // 更新浮点输入页面的框架状态
    if (typeof updateFloatInputFrameworkStatus === 'function') {
      await updateFloatInputFrameworkStatus();
    }
  } catch (error) {
    console.error('获取框架状态失败:', error);
  }
}

// 更新浮点输入页面的框架状态
async function updateFloatInputFrameworkStatus() {
  try {
    const status = await window.electron.getFrameworkStatus();
    const frameworkSelect = document.getElementById('framework-select');
    const selectedFramework = frameworkSelect.value;
    const statusIndicator = document.getElementById('framework-status-indicator');
    const statusText = document.getElementById('framework-status-text');
    
    if (selectedFramework === 'openclaw') {
      if (status.openclaw.running) {
        statusIndicator.className = 'status-indicator status-active';
        statusText.textContent = '已启动';
        statusText.style.color = '#4cc9f0';
      } else {
        statusIndicator.className = 'status-indicator status-inactive';
        statusText.textContent = '未启动';
        statusText.style.color = '#f72585';
      }
    } else if (selectedFramework === 'zeroclaw') {
      // ZeroClaw没有Gateway，只要安装了就显示为已启动
      if (status.zeroclaw.installed) {
        statusIndicator.className = 'status-indicator status-active';
        statusText.textContent = '已启动';
        statusText.style.color = '#4cc9f0';
      } else {
        statusIndicator.className = 'status-indicator status-inactive';
        statusText.textContent = '未启动';
        statusText.style.color = '#f72585';
      }
    }
  } catch (error) {
    console.error('更新浮点输入框架状态失败:', error);
  }
}

// 初始化下载和安装功能
function initDownloadAndInstall() {
  // OpenClaw 一键安装
  const openclawInstallBtn = document.getElementById('openclaw-install-btn');
  const openclawBrowseBtn = document.getElementById('openclaw-browse-path');

  if (openclawInstallBtn) {
    openclawInstallBtn.addEventListener('click', () => downloadAndInstallFramework('openclaw'));
  }

  if (openclawBrowseBtn) {
    openclawBrowseBtn.addEventListener('click', () => selectDownloadPath('openclaw'));
  }

  // ZeroClaw 一键安装
  const zeroclawInstallBtn = document.getElementById('zeroclaw-install-btn');
  const zeroclawBrowseBtn = document.getElementById('zeroclaw-browse-path');

  if (zeroclawInstallBtn) {
    zeroclawInstallBtn.addEventListener('click', () => downloadAndInstallFramework('zeroclaw'));
  }

  if (zeroclawBrowseBtn) {
    zeroclawBrowseBtn.addEventListener('click', () => selectDownloadPath('zeroclaw'));
  }

  // 监听安装进度
  if (window.electron && window.electron.onInstallProgress) {
    window.electron.onInstallProgress((event, data) => {
      updateInstallProgress(data.framework, data.progress, data.status);
    });
  }
}

// 选择下载路径
async function selectDownloadPath(framework) {
  try {
    if (!window.electron || !window.electron.selectDirectory) {
      alert('选择目录功能不可用');
      return;
    }

    const result = await window.electron.selectDirectory();
    if (result.success && result.path) {
      const pathInput = document.getElementById(`${framework}-download-path`);
      if (pathInput) {
        pathInput.value = result.path;
      }
    }
  } catch (error) {
    console.error('选择目录失败:', error);
    alert('选择目录失败: ' + error.message);
  }
}

// 一键下载并安装框架
async function downloadAndInstallFramework(framework) {
  const downloadPathInput = document.getElementById(`${framework}-download-path`);
  const downloadPath = downloadPathInput.value.trim();

  if (!downloadPath) {
    alert('请先选择安装路径');
    return;
  }

  try {
    if (!window.electron || !window.electron.downloadAndInstallFramework) {
      alert('安装功能不可用');
      return;
    }

    const installBtn = document.getElementById(`${framework}-install-btn`);
    installBtn.disabled = true;
    installBtn.textContent = '安装中...';

    // 显示进度条
    const progressDiv = document.getElementById(`${framework}-progress`);
    if (progressDiv) {
      progressDiv.style.display = 'block';
    }

    const result = await window.electron.downloadAndInstallFramework({ framework, downloadPath });

    if (result.success) {
      alert(`${framework} 安装完成！`);
      // 更新框架状态
      await updateFrameworkStatus();
      await updateFrameworkStatusDisplay();
    } else {
      let errorMessage = result.error || '未知错误';
      
      // 提供更友好的错误提示
      if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('超时')) {
        errorMessage = '网络连接超时，请检查网络连接后重试。如果问题持续，可以尝试使用代理或更换网络环境。';
      } else if (errorMessage.includes('connect')) {
        errorMessage = '网络连接失败，请检查网络连接后重试。';
      } else if (errorMessage.includes('Rust') || errorMessage.includes('Cargo') || errorMessage.includes('cargo')) {
        // 已经是详细的安装指导，直接使用
        errorMessage = errorMessage;
      } else if (errorMessage.includes('重试')) {
        errorMessage = `安装失败：${errorMessage}\n\n建议：\n1. 检查网络连接\n2. 稍后重试\n3. 如果源码已下载，可以直接选择源码路径进行编译`;
      }
      
      alert(`安装失败: ${errorMessage}`);
    }
  } catch (error) {
    console.error('安装框架失败:', error);
    let errorMessage = error.message;
    
    // 提供更友好的错误提示
    if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('超时')) {
      errorMessage = '网络连接超时，请检查网络连接后重试。如果问题持续，可以尝试使用代理或更换网络环境。';
    } else if (errorMessage.includes('connect')) {
      errorMessage = '网络连接失败，请检查网络连接后重试。';
    } else if (errorMessage.includes('Rust') || errorMessage.includes('Cargo') || errorMessage.includes('cargo')) {
      // 已经是详细的安装指导，直接使用
      errorMessage = errorMessage;
    } else if (errorMessage.includes('重试')) {
      errorMessage = `安装失败：${errorMessage}\n\n建议：\n1. 检查网络连接\n2. 稍后重试\n3. 如果源码已下载，可以直接选择源码路径进行编译`;
    }
    
    alert('安装失败: ' + errorMessage);
  } finally {
    const installBtn = document.getElementById(`${framework}-install-btn`);
    installBtn.disabled = false;
    installBtn.textContent = '一键安装';
    
    // 隐藏进度条
    const progressDiv = document.getElementById(`${framework}-progress`);
    if (progressDiv) {
      progressDiv.style.display = 'none';
    }
  }
}

// 更新安装进度
function updateInstallProgress(framework, progress, status) {
  const statusSpan = document.getElementById(`${framework}-progress-status`);
  const percentSpan = document.getElementById(`${framework}-progress-percent`);
  const progressBar = document.getElementById(`${framework}-progress-bar`);

  if (statusSpan) {
    statusSpan.textContent = status;
  }

  if (percentSpan) {
    percentSpan.textContent = `${progress}%`;
  }

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}

// 更新框架状态显示（根据安装状态显示/隐藏下载区域）
async function updateFrameworkStatusDisplay() {
  try {
    const status = await window.electron.getFrameworkStatus();

    // 更新OpenClaw
    const openclawStatusIndicator = document.getElementById('openclaw-status-indicator');
    const openclawStatus = document.getElementById('openclaw-status');
    const openclawDownloadSection = document.getElementById('openclaw-download-section');
    const openclawConfigSection = document.getElementById('openclaw-config-section');
    const openclawPathDisplay = document.getElementById('openclaw-path-display');

    if (openclawStatusIndicator) {
      openclawStatusIndicator.className = status.openclaw.installed ? 'status-indicator status-active' : 'status-indicator status-inactive';
    }
    if (openclawStatus) {
      openclawStatus.textContent = status.openclaw.installed ? '已安装' : '未安装';
    }
    if (openclawPathDisplay && status.openclaw.path) {
      // 将绝对路径转换为相对路径显示
      let displayPath = status.openclaw.path;
      // 使用简单的路径转换，假设用户目录以用户名开头
      const homeMatch = displayPath.match(/\/Users\/[^\/]+|\/home\/[^\/]+|C:\\Users\\[^\\/]+/);
      if (homeMatch) {
        displayPath = displayPath.replace(homeMatch[0], '~');
      }
      openclawPathDisplay.textContent = displayPath;
    }
    if (openclawDownloadSection) {
      openclawDownloadSection.style.display = status.openclaw.installed ? 'none' : 'block';
    }
    if (openclawConfigSection) {
      openclawConfigSection.style.display = status.openclaw.installed ? 'block' : 'none';
    }

    // 更新ZeroClaw
    const zeroclawStatusIndicator = document.getElementById('zeroclaw-status-indicator');
    const zeroclawStatus = document.getElementById('zeroclaw-status');
    const zeroclawDownloadSection = document.getElementById('zeroclaw-download-section');
    const zeroclawConfigSection = document.getElementById('zeroclaw-config-section');
    const zeroclawPathDisplay = document.getElementById('zeroclaw-path-display');

    if (zeroclawStatusIndicator) {
      zeroclawStatusIndicator.className = status.zeroclaw.installed ? 'status-indicator status-active' : 'status-indicator status-inactive';
    }
    if (zeroclawStatus) {
      zeroclawStatus.textContent = status.zeroclaw.installed ? '已安装' : '未安装';
    }
    if (zeroclawPathDisplay && status.zeroclaw.path) {
      // 将绝对路径转换为相对路径显示
      let displayPath = status.zeroclaw.path;
      // 使用简单的路径转换，假设用户目录以用户名开头
      const homeMatch = displayPath.match(/\/Users\/[^\/]+|\/home\/[^\/]+|C:\\Users\\[^\\/]+/);
      if (homeMatch) {
        displayPath = displayPath.replace(homeMatch[0], '~');
      }
      zeroclawPathDisplay.textContent = displayPath;
    }
    if (zeroclawDownloadSection) {
      zeroclawDownloadSection.style.display = status.zeroclaw.installed ? 'none' : 'block';
    }
    if (zeroclawConfigSection) {
      zeroclawConfigSection.style.display = status.zeroclaw.installed ? 'block' : 'none';
    }
  } catch (error) {
    console.error('更新框架状态显示失败:', error);
  }
}