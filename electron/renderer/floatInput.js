// 浮点输入模块
// 负责处理浮点输入功能，包括消息发送、聊天界面管理等

// 当前上传的文件内容
let currentFileContent = null;
let currentFileName = null;

// 初始化浮点输入模块
function initFloatInput() {
  // 发送按钮点击事件
  document.getElementById('send-button').addEventListener('click', sendMessage);
  
  // 输入框回车事件
  document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // 框架选择变化
  document.getElementById('framework-select').addEventListener('change', async (e) => {
    const framework = e.target.value;
    await loadAgentSelect(framework);
    await updateFloatInputFrameworkStatus();
  });
  
  // 测试浮点输入
  document.getElementById('test-float-input').addEventListener('click', () => {
    if (window.electron) {
      window.electron.openFloatInput();
    } else {
      alert('请在桌面应用中测试浮点输入功能。');
    }
  });
  
  // 显示浮点框按钮
  document.getElementById('float-input-btn').addEventListener('click', () => {
    if (window.electron) {
      window.electron.openFloatInput();
    } else {
      alert('请在桌面应用中使用此功能。');
    }
  });
  
  // 初始化文件拖拽功能
  initFileDragDrop();
  
  // 初始化代理选择
  loadAgentSelect('openclaw');
}

// 发送消息
async function sendMessage() {
  const messageInput = document.getElementById('message-input');
  let message = messageInput.value.trim();
  const framework = document.getElementById('framework-select').value;
  const agentId = document.getElementById('agent-select').value;

  if (!message && !currentFileContent) return;

  // 如果有文件内容，整合到消息中
  let displayMessage = message;
  let fullMessage = message;
  
  if (currentFileContent) {
    // 构建包含文件内容的完整消息
    fullMessage = `[文件: ${currentFileName}]\n\n${currentFileContent}\n\n用户问题: ${message || '请分析以上文件内容'}`;
    
    // 显示给用户的消息（简化版）
    displayMessage = message 
      ? `[📎 ${currentFileName}] ${message}`
      : `[📎 ${currentFileName}] 请分析以上文件内容`;
  }

  // 获取当前框架和代理信息
  const currentFramework = framework;
  const currentAgent = agentId;

  // 添加用户消息（带来源标识）
  addMessage('user', displayMessage, currentFramework, currentAgent);
  messageInput.value = '';

  // 显示加载状态
  const loadingMessage = addMessage('assistant', '<i class="fas fa-spinner fa-spin"></i> 正在处理...', currentFramework, currentAgent);

  try {
    if (window.electron) {
      // 通过IPC发送消息到主进程
      const response = await window.electron.sendMessage({ framework, agentId, message: fullMessage });
      // 移除加载状态
      loadingMessage.remove();
      // 过滤掉系统信息，只保留实际回答内容
      const filteredResponse = filterSystemInfo(response);
      // 如果过滤后内容为空，显示提示信息
      const finalResponse = filteredResponse.trim() || '（代理返回内容为空）';
      // 添加AI回复（带来源标识）
      addMessage('assistant', finalResponse, currentFramework, currentAgent);
    } else {
      // 模拟回复
      setTimeout(() => {
        loadingMessage.remove();
        addMessage('assistant', `这是模拟的${framework} ${agentId}代理的回复: ${displayMessage}`, currentFramework, currentAgent);
      }, 1000);
    }
  } catch (error) {
    loadingMessage.remove();
    // 显示友好的错误消息
    let errorMessage = error.message || '发送消息失败';
    
    // 处理常见错误
    if (errorMessage.includes('not installed')) {
      errorMessage = 'OpenClaw 未安装，请先安装 OpenClaw';
    } else if (errorMessage.includes('Failed to start OpenClaw Gateway')) {
      errorMessage = '无法启动 OpenClaw Gateway，请检查 OpenClaw 安装';
    } else if (errorMessage.includes('Agent not found')) {
      errorMessage = '找不到指定的代理，请检查代理配置';
    }
    
    addMessage('assistant', `错误: ${errorMessage}`, currentFramework, currentAgent);
  }
  
  // 发送完成后清除文件内容
  if (currentFileContent) {
    clearUploadedFile();
  }
}

// 添加消息到聊天界面
function addMessage(role, content, framework = null, agentId = null) {
  const chatMessages = document.getElementById('chat-messages');
  
  // 清空欢迎信息
  if (chatMessages.querySelector('.fa-comment-dots')) {
    chatMessages.innerHTML = '';
  }
  
  // 创建消息容器
  const messageContainer = document.createElement('div');
  messageContainer.style.display = 'flex';
  messageContainer.style.flexDirection = 'column';
  messageContainer.style.marginBottom = '15px';
  messageContainer.style.maxWidth = '80%';
  
  if (role === 'user') {
    messageContainer.style.alignSelf = 'flex-end';
    messageContainer.style.marginLeft = 'auto';
  } else {
    messageContainer.style.alignSelf = 'flex-start';
  }
  
  // 添加来源标识（如果有）
  if (framework && agentId) {
    const sourceInfo = getFrameworkDisplayInfo(framework, agentId);
    const agentDisplayInfo = getAgentDisplayInfo(agentId, sourceInfo.agent, framework);
    const sourceLabel = document.createElement('div');
    sourceLabel.style.fontSize = '0.75rem';
    sourceLabel.style.color = '#a9a9a9';
    sourceLabel.style.marginBottom = '4px';
    sourceLabel.style.padding = '0 5px';
    
    if (role === 'user') {
      sourceLabel.style.textAlign = 'right';
      sourceLabel.textContent = `我 → ${sourceInfo.icon} ${sourceInfo.name}/${agentDisplayInfo.shortName}`;
    } else {
      sourceLabel.style.textAlign = 'left';
      sourceLabel.textContent = `${sourceInfo.icon} ${sourceInfo.name}/${agentDisplayInfo.shortName}`;
    }
    
    messageContainer.appendChild(sourceLabel);
  }
  
  // 创建消息内容
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  messageDiv.innerHTML = content;
  
  // 设置消息样式
  if (role === 'user') {
    messageDiv.style.backgroundColor = '#4cc9f0';
    messageDiv.style.color = '#1a1a2e';
    messageDiv.style.padding = '10px 15px';
    messageDiv.style.borderRadius = '18px 18px 4px 18px';
  } else {
    messageDiv.style.backgroundColor = '#3a0ca3';
    messageDiv.style.color = '#ffffff';
    messageDiv.style.padding = '10px 15px';
    messageDiv.style.borderRadius = '18px 18px 18px 4px';
  }
  
  messageContainer.appendChild(messageDiv);
  chatMessages.appendChild(messageContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return messageContainer;
}

// 过滤系统信息，只保留实际回答内容
function filterSystemInfo(response) {
  if (!response) return '';
  
  // 分割响应内容为行
  const lines = response.split('\n');
  
  // 过滤掉系统信息行
  const filteredLines = lines.filter(line => {
    // 过滤OpenClaw系统信息
    if (line.includes('Now using node')) return false;
    if (line.includes('Using config file:')) return false;
    if (line.includes('Config warnings:')) return false;
    if (line.includes('plugin feishu: duplicate plugin id detected')) return false;
    if (line.includes('gateway connect failed:')) return false;
    if (line.includes('Gateway agent failed; falling back to embedded:')) return false;
    if (line.includes('Gateway target:')) return false;
    if (line.includes('Source: local loopback')) return false;
    if (line.includes('Config:')) return false;
    if (line.includes('Bind:')) return false;
    if (line.includes('Error: EPERM:')) return false;
    if (line.includes('Error:')) return false;
    if (line.includes('falling back to embedded')) return false;
    if (line.includes('ws://')) return false;
    
    // 过滤ZeroClaw系统信息
    if (line.includes('WARN')) return false;
    if (line.includes('INFO')) return false;
    if (line.includes('Config file') && line.includes('is world-readable')) return false;
    if (line.includes('Consider restricting with: chmod')) return false;
    if (line.includes('Config loaded')) return false;
    if (line.includes('path=')) return false;
    if (line.includes('workspace=')) return false;
    if (line.includes('source=')) return false;
    if (line.includes('initialized=')) return false;
    if (line.includes('Memory initialized')) return false;
    if (line.includes('backend=')) return false;
    
    // 过滤框架标识（避免重复显示）
    if (line.includes('🔵 OpenClaw')) return false;
    if (line.includes('🟢 ZeroClaw')) return false;
    if (line.includes('OpenClaw/') && line.length < 30) return false;
    if (line.includes('ZeroClaw/') && line.length < 30) return false;
    if (line.match(/(🔵|🟢)\s*(OpenClaw|ZeroClaw)\//)) return false;
    
    // 过滤只包含框架标识的行
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^(🔵|🟢)\s*(OpenClaw|ZeroClaw)\/\w+$/)) return false;
    
    // 过滤只包含代理名称的行（如 media-creator）
    if (trimmedLine.match(/^[a-z-]+$/)) return false;
    
    // 保留非空行
    return line.trim() !== '';
  });
  
  // 重新组合为字符串
  return filteredLines.join('\n');
}

// 获取框架显示信息
function getFrameworkDisplayInfo(framework, agentId) {
  const frameworkInfo = {
    'openclaw': {
      name: 'OpenClaw',
      icon: '🔵',
      agent: agentId
    },
    'zeroclaw': {
      name: 'ZeroClaw',
      icon: '🟢',
      agent: agentId
    }
  };
  
  return frameworkInfo[framework] || { name: framework, icon: '❓', agent: agentId };
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

// 加载代理选择下拉框
async function loadAgentSelect(framework) {
  try {
    const agents = await window.electron.getAgents(framework);
    const agentSelect = document.getElementById('agent-select');
    
    agentSelect.innerHTML = '';
    agents.forEach(agent => {
      const displayInfo = getAgentDisplayInfo(agent.id, agent.name, framework);
      const option = document.createElement('option');
      option.value = agent.id;
      option.textContent = `${displayInfo.icon} ${displayInfo.shortName}`;
      agentSelect.appendChild(option);
    });
  } catch (error) {
    console.error('加载代理选择失败:', error);
  }
}

// 初始化文件拖拽功能
function initFileDragDrop() {
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  
  // 创建拖拽提示区域
  const dropZone = document.createElement('div');
  dropZone.id = 'file-drop-zone';
  dropZone.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(76, 201, 240, 0.2);
    border: 3px dashed #4cc9f0;
    border-radius: 8px;
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    pointer-events: none;
  `;
  dropZone.innerHTML = `
    <div style="text-align: center; color: #4cc9f0;">
      <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; margin-bottom: 10px;"></i>
      <p style="font-size: 1.2rem;">释放以上传文件</p>
      <p style="font-size: 0.9rem; margin-top: 5px;">支持 .txt, .md, .doc, .docx, .pdf</p>
    </div>
  `;
  
  // 将dropZone添加到chatMessages的父元素
  chatMessages.parentElement.style.position = 'relative';
  chatMessages.parentElement.appendChild(dropZone);
  
  // 拖拽进入
  document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.display = 'flex';
  });
  
  // 拖拽悬停
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  // 拖拽离开
  document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget === null || !document.contains(e.relatedTarget)) {
      dropZone.style.display = 'none';
    }
  });
  
  // 放置文件
  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.display = 'none';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFloatFileUpload(files[0]);
    }
  });
}

// 处理浮点输入文件上传
async function handleFloatFileUpload(file) {
  // 检查文件大小（最大100KB）
  const maxSize = 100 * 1024; // 100KB
  if (file.size > maxSize) {
    alert(`文件过大！最大支持 ${maxSize / 1024}KB，当前文件 ${(file.size / 1024).toFixed(2)}KB`);
    return;
  }
  
  // 检查文件类型
  const allowedTypes = ['.txt', '.md', '.doc', '.docx', '.pdf'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  
  if (!allowedTypes.includes(fileExtension)) {
    alert(`不支持的文件格式！支持: ${allowedTypes.join(', ')}`);
    return;
  }
  
  try {
    // 读取文件内容
    const content = await readFileContent(file);
    
    // 保存文件信息
    currentFileContent = content;
    currentFileName = file.name;
    
    // 更新UI显示
    updateFileUploadUI(file.name, content.length);
    
    // 显示上传成功提示
    showFileUploadNotification(file.name, content.length);
    
  } catch (error) {
    console.error('读取文件失败:', error);
    alert('读取文件失败: ' + error.message);
  }
}

// 读取文件内容
async function readFileContent(file) {
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  
  try {
    switch(extension) {
      case '.txt':
      case '.md': {
        const text = await file.text();
        return text || '';
      }
      
      case '.doc':
      case '.docx':
        // 使用mammoth.js解析docx文件
        if (window.electron && window.electron.parseDocx) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.electron.parseDocx(arrayBuffer);
            if (result.success) {
              return result.text || '';
            } else {
              throw new Error(result.error || '解析docx文件失败');
            }
          } catch (error) {
            console.error('解析docx文件失败:', error);
            return `[文档文件: ${file.name}]\n文件大小: ${(file.size / 1024).toFixed(2)}KB\n\n解析失败: ${error.message}\n建议转换为txt格式以获得最佳效果。`;
          }
        } else {
          return `[文档文件: ${file.name}]\n文件大小: ${(file.size / 1024).toFixed(2)}KB\n\n注意：doc/docx文件解析功能仅在桌面应用中可用。建议转换为txt格式以获得最佳效果。`;
        }
      
      case '.pdf':
        // 使用pdf-parse解析pdf文件
        if (window.electron && window.electron.parsePdf) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.electron.parsePdf(arrayBuffer);
            if (result.success) {
              return result.text || '';
            } else {
              throw new Error(result.error || '解析PDF文件失败');
            }
          } catch (error) {
            console.error('解析PDF文件失败:', error);
            return `[PDF文件: ${file.name}]\n文件大小: ${(file.size / 1024).toFixed(2)}KB\n\n解析失败: ${error.message}\n建议转换为txt格式以获得最佳效果。`;
          }
        } else {
          return `[PDF文件: ${file.name}]\n文件大小: ${(file.size / 1024).toFixed(2)}KB\n\n注意：PDF文件解析功能仅在桌面应用中可用。建议转换为txt格式以获得最佳效果。`;
        }
      
      default:
        throw new Error('不支持的文件格式');
    }
  } catch (error) {
    console.error('读取文件内容失败:', error);
    return '';
  }
}

// 显示文件上传通知
function showFileUploadNotification(fileName, charCount) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #4cc9f0;
    color: #1a1a2e;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
      <div>
        <div style="font-weight: bold;">文件上传成功</div>
        <div style="font-size: 0.9rem;">${fileName} (${charCount} 字符)</div>
      </div>
    </div>
  `;
  
  // 添加动画样式
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // 3秒后自动移除
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// 清除已上传的文件
function clearUploadedFile() {
  currentFileContent = null;
  currentFileName = null;
  const messageInput = document.getElementById('message-input');
  const clearFileBtn = document.getElementById('clear-file-btn');
  
  messageInput.placeholder = '输入消息...';
  messageInput.style.borderColor = '';
  
  // 隐藏清除按钮
  if (clearFileBtn) {
    clearFileBtn.style.display = 'none';
  }
}

// 更新文件上传UI状态
function updateFileUploadUI(fileName, contentLength) {
  const messageInput = document.getElementById('message-input');
  const clearFileBtn = document.getElementById('clear-file-btn');
  
  messageInput.placeholder = `已上传: ${fileName} (${contentLength} 字符) - 输入你的问题...`;
  messageInput.style.borderColor = '#4cc9f0';
  
  // 显示清除按钮
  if (clearFileBtn) {
    clearFileBtn.style.display = 'block';
    clearFileBtn.onclick = () => {
      clearUploadedFile();
    };
  }
}