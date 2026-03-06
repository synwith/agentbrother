// 项目模块
// 实现项目管理、代理协作、文档共享等功能

// 项目数据存储键
const PROJECTS_STORAGE_KEY = 'agentbrother_projects';

// 项目聊天当前上传的文件内容
let projectChatFileContent = null;
let projectChatFileName = null;

// 初始化项目模块
async function initProjects() {
  // 项目页面点击事件由main.js中的initNavigation函数处理
  // 这里只需要初始化其他事件监听器
  
  // 从文件加载项目数据
  await loadProjectsFromFile();
  
  // 新建项目按钮点击事件
  document.getElementById('create-project-btn').addEventListener('click', () => {
    showPage('create-project-page');
  });
  
  // 保存项目按钮点击事件
  document.getElementById('save-project-btn').addEventListener('click', saveProject);
  
  // 取消创建项目按钮点击事件
  document.getElementById('cancel-create-project-btn').addEventListener('click', () => {
    showPage('projects');
  });
  
  // 初始化添加代理表单
  initAddAgentForm();
  
  // 初始化文档上传功能
  initDocumentUpload();
  
  // 初始化任务管理功能
  initTaskManagement();
}

// 从文件加载项目数据
async function loadProjectsFromFile() {
  try {
    if (window.electron && window.electron.loadProjects) {
      const result = await window.electron.loadProjects();
      if (result.success && result.projects) {
        // 保存到 localStorage 以便快速访问
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(result.projects));
        console.log('从文件加载项目数据成功:', result.projects.length, '个项目');
      }
    }
  } catch (error) {
    console.error('从文件加载项目数据失败:', error);
  }
}

// 保存项目数据到文件
async function saveProjectsToFile(projects) {
  try {
    if (window.electron && window.electron.saveProjects) {
      const result = await window.electron.saveProjects(projects);
      if (result.success) {
        console.log('项目数据已保存到文件');
      } else {
        console.error('保存项目数据到文件失败:', result.error);
      }
    }
  } catch (error) {
    console.error('保存项目数据到文件失败:', error);
  }
}

// 统一保存项目数据（localStorage + 文件）
async function saveProjectsData(projects) {
  // 保存到 localStorage 以便快速访问
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  // 保存到文件进行持久化
  await saveProjectsToFile(projects);
}

// 初始化任务管理功能
function initTaskManagement() {
  const createTaskBtn = document.getElementById('create-task-btn');
  const initWorkspacesBtn = document.getElementById('init-workspaces-btn');
  const viewLearningStatusBtn = document.getElementById('view-learning-status-btn');
  
  if (createTaskBtn) {
    createTaskBtn.addEventListener('click', createTask);
  }
  
  if (initWorkspacesBtn) {
    initWorkspacesBtn.addEventListener('click', () => {
      const projectId = localStorage.getItem('current_project_id');
      if (projectId) {
        initAgentWorkspaces(projectId);
        loadAgentWorkspaces(projectId);
        alert('代理工作区域初始化成功');
      } else {
        alert('请先打开一个项目');
      }
    });
  }
  
  if (viewLearningStatusBtn) {
    viewLearningStatusBtn.addEventListener('click', () => {
      const projectId = localStorage.getItem('current_project_id');
      if (projectId) {
        viewAgentLearningStatus(projectId);
      } else {
        alert('请先打开一个项目');
      }
    });
  }
}

// 初始化文档上传功能
function initDocumentUpload() {
  const uploadArea = document.getElementById('document-upload-area');
  const fileInput = document.getElementById('document-file-input');
  const uploadButton = document.getElementById('upload-document-btn');
  
  if (uploadArea) {
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#4cc9f0';
      uploadArea.style.backgroundColor = 'rgba(76, 201, 240, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '#3a0ca3';
      uploadArea.style.backgroundColor = '#16213e';
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#3a0ca3';
      uploadArea.style.backgroundColor = '#16213e';
      
      if (e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files);
      }
    });
  }
  
  if (fileInput) {
    // 文件选择事件
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileUpload(e.target.files);
      }
    });
  }
  
  if (uploadButton) {
    // 上传按钮点击事件
    uploadButton.addEventListener('click', () => {
      fileInput.click();
    });
  }
}

// 处理文件上传
async function handleFileUpload(files) {
  const projectId = localStorage.getItem('current_project_id');
  if (!projectId) {
    alert('请先打开一个项目');
    return;
  }
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    // 确保项目有documents属性
    if (!project.documents) {
      project.documents = [];
    }
    
    // 处理每个文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 读取文件内容
      const content = await readFileContent(file);
      
      // 创建文档对象
      const document = {
        id: Date.now().toString() + '_' + i,
        name: file.name,
        size: file.size,
        type: file.type,
        content: content,
        uploadedAt: new Date().toISOString()
      };
      
      // 添加文档到项目
      project.documents.push(document);
    }
    
    // 保存到本地存储
    await saveProjectsData(projects);
    
    // 重新加载项目详情
    loadProjectDetail(projectId);
    
    // 提示上传成功
    alert(`成功上传 ${files.length} 个文档`);
    
    // 自动让相关代理学习文档内容
    await autoLearnDocuments(projectId);
  } catch (error) {
    console.error('上传文档失败:', error);
    alert('上传文档失败');
  }
}

// 读取文件内容
function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    // 根据文件类型选择读取方式
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else if (file.type.includes('image')) {
      reader.readAsDataURL(file);
    } else {
      // 对于其他类型文件，尝试读取为文本
      reader.readAsText(file);
    }
  });
}

// 加载项目文档
function loadProjectDocuments(projectId) {
  const documentsList = document.getElementById('project-documents-list');
  documentsList.innerHTML = '';
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !project.documents || project.documents.length === 0) {
      documentsList.innerHTML = '<div class="no-documents">暂无文档，请上传文档</div>';
      return;
    }
    
    project.documents.forEach(document => {
      const documentItem = document.createElement('div');
      documentItem.className = 'document-item';
      documentItem.innerHTML = `
        <div class="document-info">
          <h4>${document.name}</h4>
          <p>大小: ${formatFileSize(document.size)}</p>
          <p>上传时间: ${new Date(document.uploadedAt).toLocaleString()}</p>
        </div>
        <div class="document-actions">
          <button class="btn btn-secondary" onclick="viewDocument('${projectId}', '${document.id}')">查看</button>
          <button class="btn btn-secondary" onclick="shareDocument('${projectId}', '${document.id}')">分享</button>
          <button class="btn btn-danger" onclick="deleteDocument('${projectId}', '${document.id}')">删除</button>
        </div>
      `;
      documentsList.appendChild(documentItem);
    });
  } catch (error) {
    console.error('加载文档失败:', error);
    documentsList.innerHTML = '<div class="error-message">加载文档失败</div>';
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 查看文档
function viewDocument(projectId, documentId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    const document = project.documents.find(d => d.id === documentId);
    if (!document) {
      alert('文档不存在');
      return;
    }
    
    // 创建模态框显示文档内容
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#16213e';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.maxWidth = '80%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #4cc9f0;">${document.name}</h3>
        <button class="btn btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()">关闭</button>
      </div>
      <div style="color: #a9a9a9;">
        ${document.content.length > 1000 ? document.content.substring(0, 1000) + '...' : document.content}
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  } catch (error) {
    console.error('查看文档失败:', error);
    alert('查看文档失败');
  }
}

// 分享文档
async function shareDocument(projectId, documentId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    const document = project.documents.find(d => d.id === documentId);
    if (!document) {
      alert('文档不存在');
      return;
    }
    
    // 生成分享消息
    const shareMessage = `@所有人 我上传了一份文档《${document.name}》，请大家查看。`;
    
    // 切换到项目聊天页面并发送消息
    openProjectChat(projectId);
    
    // 等待页面加载完成后填充消息
    setTimeout(() => {
      const chatInput = document.getElementById('project-chat-input');
      if (chatInput) {
        chatInput.value = shareMessage;
      }
    }, 500);
  } catch (error) {
    console.error('分享文档失败:', error);
    alert('分享文档失败');
  }
}

// 删除文档
async function deleteDocument(projectId, documentId) {
  if (!confirm('确定要删除这个文档吗？')) {
    return;
  }
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    // 从项目中删除文档
    project.documents = project.documents.filter(d => d.id !== documentId);
    
    // 保存到本地存储
    await saveProjectsData(projects);
    
    // 重新加载项目详情
    loadProjectDetail(projectId);
    
    // 提示删除成功
    alert('文档删除成功');
  } catch (error) {
    console.error('删除文档失败:', error);
    alert('删除文档失败');
  }
}

// 自动让相关代理学习文档内容
async function autoLearnDocuments(projectId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !project.roles || project.roles.length === 0) {
      return;
    }
    
    // 获取最新上传的文档
    const latestDocument = project.documents[project.documents.length - 1];
    if (!latestDocument) {
      return;
    }
    
    // 确保项目有learningStatus属性
    if (!project.learningStatus) {
      project.learningStatus = {};
    }
    
    // 分析文档内容，确定相关代理
    const relevantAgents = [];
    project.roles.forEach(role => {
      if (role.agents) {
        role.agents.forEach(agent => {
          // 根据角色判断是否相关
          const roleName = role.name.toLowerCase();
          const documentName = latestDocument.name.toLowerCase();
          const documentContent = latestDocument.content.toLowerCase();
          
          // 基于角色的相关性判断
          if (roleName.includes('ceo')) {
            relevantAgents.push({ ...agent, role: role.name });
          } else if (roleName.includes('cto') && (documentName.includes('技术') || documentName.includes('开发') || documentContent.includes('技术') || documentContent.includes('开发'))) {
            relevantAgents.push({ ...agent, role: role.name });
          } else if (roleName.includes('运营') && (documentName.includes('运营') || documentName.includes('市场') || documentContent.includes('运营') || documentContent.includes('市场'))) {
            relevantAgents.push({ ...agent, role: role.name });
          } else if (roleName.includes('产品') && (documentName.includes('产品') || documentContent.includes('产品'))) {
            relevantAgents.push({ ...agent, role: role.name });
          }
        });
      }
    });
    
    // 去重
    const uniqueAgents = [];
    const seenAgentIds = new Set();
    for (const agent of relevantAgents) {
      if (!seenAgentIds.has(agent.id)) {
        seenAgentIds.add(agent.id);
        uniqueAgents.push(agent);
      }
    }
    
    // 让相关代理学习文档内容
    for (const agent of uniqueAgents) {
      // 初始化代理的学习状态
      if (!project.learningStatus[agent.id]) {
        project.learningStatus[agent.id] = {
          agentId: agent.id,
          agentName: agent.name,
          agentRole: agent.role,
          documents: [],
          lastLearned: null,
          knowledgeBase: []
        };
      }
      
      // 记录文档学习
      project.learningStatus[agent.id].documents.push({
        documentId: latestDocument.id,
        documentName: latestDocument.name,
        learnedAt: new Date().toISOString(),
        status: 'completed'
      });
      
      // 更新最后学习时间
      project.learningStatus[agent.id].lastLearned = new Date().toISOString();
      
      // 提取文档中的关键信息作为知识
      const keyPoints = extractKeyPoints(latestDocument.content);
      project.learningStatus[agent.id].knowledgeBase.push(...keyPoints);
      
      // 这里可以调用代理的学习功能
      console.log(`让 ${agent.name} (${agent.role}) 学习文档: ${latestDocument.name}`);
      console.log(`提取的关键信息: ${keyPoints.slice(0, 3).join(', ')}...`);
    }
    
    // 保存到本地存储
    await saveProjectsData(projects);
    
    // 提示学习完成
    alert(`已安排 ${relevantAgents.length} 个代理学习文档: ${latestDocument.name}`);
  } catch (error) {
    console.error('自动学习文档失败:', error);
  }
}

// 提取文档中的关键信息
function extractKeyPoints(content) {
  // 简单的关键信息提取逻辑
  // 实际应用中可以使用更复杂的NLP技术
  const sentences = content.split('. ');
  const keyPoints = [];
  
  // 提取包含关键词的句子
  const keywords = ['重要', '关键', '建议', '方法', '策略', '目标', '计划', '步骤', '注意', '问题'];
  
  sentences.forEach(sentence => {
    if (keywords.some(keyword => sentence.includes(keyword)) && sentence.length > 10) {
      keyPoints.push(sentence.trim());
    }
  });
  
  // 如果没有找到关键词，返回前几个句子
  if (keyPoints.length === 0 && sentences.length > 0) {
    return sentences.slice(0, 3).map(s => s.trim());
  }
  
  return keyPoints.slice(0, 5); // 最多返回5个关键信息
}

// 查看代理学习状态
function viewAgentLearningStatus(projectId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !project.learningStatus) {
      alert('暂无学习状态记录');
      return;
    }
    
    // 创建模态框显示学习状态
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#16213e';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.maxWidth = '80%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    
    let learningStatusHTML = '<h3 style="color: #4cc9f0; margin-bottom: 20px;">代理学习状态</h3>';
    
    Object.values(project.learningStatus).forEach(status => {
      learningStatusHTML += `
        <div style="background-color: rgba(58, 12, 163, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h4 style="color: #4cc9f0; margin-bottom: 10px;">${status.agentName} (${status.agentRole})</h4>
          <p><strong>学习文档数:</strong> ${status.documents.length}</p>
          <p><strong>最后学习时间:</strong> ${status.lastLearned ? new Date(status.lastLearned).toLocaleString() : '未学习'}</p>
          <p><strong>知识库大小:</strong> ${status.knowledgeBase.length} 条</p>
          ${status.knowledgeBase.length > 0 ? `<p><strong>部分知识:</strong> ${status.knowledgeBase.slice(0, 2).join('; ')}${status.knowledgeBase.length > 2 ? '...' : ''}</p>` : ''}
        </div>
      `;
    });
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #4cc9f0;">代理学习状态</h3>
        <button class="btn btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()">关闭</button>
      </div>
      <div style="color: #a9a9a9;">
        ${learningStatusHTML}
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  } catch (error) {
    console.error('查看学习状态失败:', error);
    alert('查看学习状态失败');
  }
}

// 创建任务
async function createTask() {
  const projectId = localStorage.getItem('current_project_id');
  
  if (!projectId) {
    alert('请先打开一个项目');
    return;
  }
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    if (!project.roles || project.roles.length === 0) {
      alert('项目中没有角色，请先添加角色');
      return;
    }
    
    // 检查是否有代理
    let allAgents = [];
    project.roles.forEach(role => {
      if (role.agents) {
        role.agents.forEach(agent => {
          allAgents.push({ ...agent, role: role.name });
        });
      }
    });
    
    if (allAgents.length === 0) {
      alert('项目中没有代理，请先为角色添加代理');
      return;
    }
    
    // 使用任务管理器打开任务编辑模态框
    if (window.taskManager) {
      // 先设置回调，确保在任务添加后能正确刷新
      window.taskManager.onTaskAdded = function() {
        // 刷新项目任务列表
        loadProjectTasks(projectId);
        // 刷新项目列表
        loadProjects();
      };
      
      // 设置任务更新回调，实时刷新项目任务列表
      window.taskManager.onTaskUpdated = function(task) {
        if (task && task.projectId === projectId) {
          loadProjectTasks(projectId);
        }
      };
      
      // 预填充项目相关信息（默认选中当前项目）
      const taskData = {
        type: 'project',
        projectId: projectId,
        name: `${project.name} - 新任务`,
        description: `为项目 ${project.name} 创建的新任务`,
        agentId: allAgents[0].id,
        agentFramework: allAgents[0].framework || 'openclaw',
        priority: 'medium'
      };
      
      // 打开任务编辑模态框
      window.taskManager.openTaskModal(taskData);
    } else {
      // 如果任务管理器不可用，使用旧的简单方式
      const taskName = prompt('请输入任务名称:');
      if (!taskName || taskName.trim() === '') {
        return;
      }
      
      const taskDescription = prompt('请输入任务描述:');
      
      // 生成代理选择菜单
      const assigneeIndex = prompt(`请选择任务负责人 (输入数字):\n${allAgents.map((agent, index) => `${index + 1}. ${agent.name} (${agent.role})`).join('\n')}`);
      
      if (!assigneeIndex || isNaN(assigneeIndex) || assigneeIndex < 1 || assigneeIndex > allAgents.length) {
        alert('无效的选择');
        return;
      }
      
      const selectedAgent = allAgents[parseInt(assigneeIndex) - 1];
      
      // 确保项目有tasks属性
      if (!project.tasks) {
        project.tasks = [];
      }
      
      // 创建新任务
      const newTask = {
        id: Date.now().toString(),
        name: taskName.trim(),
        description: taskDescription || '',
        assignee: {
          id: selectedAgent.id,
          name: selectedAgent.name,
          role: selectedAgent.role
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 添加任务到项目
      project.tasks.push(newTask);
      
      // 保存到本地存储
      await saveProjectsData(projects);
      
      // 重新加载项目详情
      loadProjectDetail(projectId);
      
      // 提示创建成功
      alert('任务创建成功');
    }
  } catch (error) {
    console.error('创建任务失败:', error);
    alert('创建任务失败');
  }
}

// 加载项目任务
function loadProjectTasks(projectId) {
  const tasksList = document.getElementById('project-tasks-list');
  if (!tasksList) return;
  
  tasksList.innerHTML = '';
  
  try {
    // 优先从任务管理器获取任务列表（与任务页面一致）
    if (window.taskManager && window.taskManager.tasks) {
      displayProjectTasks(window.taskManager.tasks, projectId, tasksList);
    } else {
      const tasks = JSON.parse(localStorage.getItem('agentbrother_tasks') || '[]');
      displayProjectTasks(tasks, projectId, tasksList);
    }
  } catch (error) {
    tasksList.innerHTML = '<div class="error-message">加载任务失败</div>';
  }
}

// 显示项目任务
function displayProjectTasks(tasks, projectId, tasksList) {
  // 筛选出当前项目的任务
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  
  if (projectTasks.length === 0) {
    tasksList.innerHTML = '<div class="no-tasks">暂无任务，请创建任务</div>';
    return;
  }
  
  tasksList.innerHTML = '';
  projectTasks.forEach(task => {
    const hasResult = task.result || task.error;
    const statusText = task.status === 'running' ? '执行中' : 
                       task.status === 'completed' ? '已完成' : 
                       task.status === 'failed' ? '失败' : '待处理';
    const statusClass = task.status === 'running' ? 'running' : 
                       task.status === 'completed' ? 'completed' : 
                       task.status === 'failed' ? 'failed' : 'pending';
    
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.status}`;
    taskItem.innerHTML = `
      <div class="task-info">
        <h4>${task.name}</h4>
        <p>${task.description || ''}</p>
        <span class="task-assignee">${task.agentId || ''}</span>
        <span class="task-status ${statusClass}">${statusText}</span>
        <p>创建时间: ${new Date(task.createdAt).toLocaleString()}</p>
        ${task.updatedAt ? `<p>更新时间: ${new Date(task.updatedAt).toLocaleString()}</p>` : ''}
        ${hasResult ? `<button class="btn btn-info" onclick="showTaskResult('${task.id}')" style="margin-top:5px;">查看结果</button>` : ''}
      </div>
      <div class="task-actions">
        ${task.status === 'pending' ? `<button class="btn btn-secondary" onclick="executeProjectTask('${projectId}', '${task.id}')">执行</button>` : ''}
        ${task.status === 'running' ? `<button class="btn btn-secondary" disabled>执行中...</button>` : ''}
        <button class="btn btn-danger" onclick="deleteProjectTask('${projectId}', '${task.id}')">删除</button>
      </div>
    `;
    tasksList.appendChild(taskItem);
  });
}

// 显示任务结果浮窗
function showTaskResult(taskId) {
  const task = window.taskManager?.tasks?.find(t => t.id === taskId);
  if (!task) return;
  
  const result = task.result || task.error || '无结果';
  
  // 创建浮窗
  const modal = document.createElement('div');
  modal.id = 'task-result-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#1a1a2e;padding:20px;border-radius:10px;width:80%;max-width:800px;max-height:80vh;display:flex;flex-direction:column;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
        <h3 style="color:white;margin:0;">任务结果 - ${task.name}</h3>
        <button onclick="this.closest('#task-result-modal').remove()" style="background:none;border:none;color:white;font-size:24px;cursor:pointer;">&times;</button>
      </div>
      <div style="flex:1;overflow-y:auto;background:#0f3460;padding:15px;border-radius:6px;color:#eee;white-space:pre-wrap;word-break:break-all;">
        ${result}
      </div>
      <div style="margin-top:15px;text-align:right;">
        <button onclick="this.closest('#task-result-modal').remove()" class="btn btn-secondary">关闭</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// 执行项目任务
async function executeProjectTask(projectId, taskId) {
  if (!window.taskManager) {
    alert('任务管理器不可用');
    return;
  }
  
  try {
    // 更新任务状态为执行中
    await window.taskManager.updateTask(taskId, { status: 'running' });
    // 刷新任务列表
    loadProjectTasks(projectId);
    
    // 执行任务
    const task = window.taskManager.getTask(taskId);
    if (task) {
      const result = await window.electron.executeTask({
        framework: task.agentFramework,
        agentId: task.agentId,
        content: task.content
      });
      
      if (result.success) {
        await window.taskManager.updateTask(taskId, {
          status: 'completed',
          result: result.result,
          completedAt: new Date().toISOString()
        });
      } else {
        await window.taskManager.updateTask(taskId, {
          status: 'failed',
          error: result.error
        });
      }
    }
    
    // 刷新任务列表
    loadProjectTasks(projectId);
  } catch (error) {
    alert('任务执行失败: ' + error.message);
    loadProjectTasks(projectId);
  }
}

// 删除项目任务
async function deleteProjectTask(projectId, taskId) {
  if (!confirm('确定要删除这个任务吗？')) return;
  
  try {
    if (window.taskManager) {
      await window.taskManager.deleteTask(taskId);
    }
    loadProjectTasks(projectId);
    loadProjects();
  } catch (error) {
    alert('删除任务失败: ' + error.message);
  }
}

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case 'pending':
      return '待处理';
    case 'in-progress':
      return '进行中';
    case 'completed':
      return '已完成';
    default:
      return status;
  }
}

// 更新任务状态
async function updateTaskStatus(projectId, taskId, newStatus) {
  try {
    // 使用任务管理器更新任务状态
    if (window.taskManager) {
      const task = window.taskManager.getTask(taskId);
      if (task) {
        await window.taskManager.updateTask(taskId, { status: newStatus });
        alert('任务状态更新成功！');
        // 重新加载项目详情
        loadProjectDetail(projectId);
        // 重新加载项目列表
        loadProjects();
      } else {
        alert('任务不存在');
      }
    } else {
      alert('任务管理器不可用');
    }
  } catch (error) {
    console.error('更新任务状态失败:', error);
    alert('更新任务状态失败');
  }
}

// 删除任务
async function deleteTask(projectId, taskId) {
  if (!confirm('确定要删除这个任务吗？')) {
    return;
  }
  
  try {
    // 使用任务管理器删除任务
    if (window.taskManager) {
      const success = await window.taskManager.deleteTask(taskId);
      if (success) {
        alert('任务删除成功！');
        // 重新加载项目详情
        loadProjectDetail(projectId);
        // 重新加载项目列表
        loadProjects();
      } else {
        alert('任务不存在');
      }
    } else {
      alert('任务管理器不可用');
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    alert('删除任务失败');
  }
}

// 初始化代理工作区域
async function initAgentWorkspaces(projectId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    // 确保项目有workspaces属性
    if (!project.workspaces) {
      project.workspaces = {
        roles: {},
        agents: {}
      };
    }
    
    // 确保workspaces有roles和agents属性
    if (!project.workspaces.roles) {
      project.workspaces.roles = {};
    }
    if (!project.workspaces.agents) {
      project.workspaces.agents = {};
    }
    
    // 为每个角色创建工作区域
    project.roles.forEach(role => {
      const roleKey = role.name.toLowerCase().replace(/\s+/g, '_');
      if (!project.workspaces.roles[roleKey]) {
        project.workspaces.roles[roleKey] = {
          name: role.name,
          path: `${project.path}/workspaces/roles/${roleKey}`,
          agents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      // 为角色下的每个代理创建工作区域
      if (role.agents) {
        role.agents.forEach(agent => {
          if (!project.workspaces.agents[agent.id]) {
            project.workspaces.agents[agent.id] = {
              id: agent.id,
              name: agent.name,
              role: role.name,
              path: `${project.path}/workspaces/roles/${roleKey}/agents/${agent.id}`,
              skills: {},
              files: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
          
          // 将代理添加到角色的代理列表中
          if (!project.workspaces.roles[roleKey].agents.includes(agent.id)) {
            project.workspaces.roles[roleKey].agents.push(agent.id);
          }
        });
      }
    });
    
    // 保存到本地存储
    await saveProjectsData(projects);
    
    console.log('代理工作区域初始化成功');
  } catch (error) {
    console.error('初始化代理工作区域失败:', error);
  }
}

// 加载代理工作区域
async function loadAgentWorkspaces(projectId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    // 确保项目有workspaces属性
    if (!project.workspaces) {
      project.workspaces = {
        roles: {},
        agents: {}
      };
    }
    
    // 确保workspaces有roles和agents属性
    if (!project.workspaces.roles) {
      project.workspaces.roles = {};
    }
    if (!project.workspaces.agents) {
      project.workspaces.agents = {};
    }
    
    // 为每个角色创建工作区域
    project.roles.forEach(role => {
      const roleKey = role.name.toLowerCase().replace(/\s+/g, '_');
      if (!project.workspaces.roles[roleKey]) {
        project.workspaces.roles[roleKey] = {
          name: role.name,
          path: `${project.path}/workspaces/roles/${roleKey}`,
          agents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      // 为角色下的每个代理创建工作区域
      if (role.agents) {
        role.agents.forEach(agent => {
          if (!project.workspaces.agents[agent.id]) {
            project.workspaces.agents[agent.id] = {
              id: agent.id,
              name: agent.name,
              role: role.name,
              path: `${project.path}/workspaces/roles/${roleKey}/agents/${agent.id}`,
              skills: {},
              files: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
          
          // 将代理添加到角色的代理列表中
          if (!project.workspaces.roles[roleKey].agents.includes(agent.id)) {
            project.workspaces.roles[roleKey].agents.push(agent.id);
          }
        });
      }
    });
    
    // 保存到本地存储
    await saveProjectsData(projects);
    
    // 显示代理工作区域
    const workspacesContainer = document.getElementById('agent-workspaces-container');
    if (workspacesContainer) {
      workspacesContainer.innerHTML = '';
      
      // 显示角色工作区域
      Object.values(project.workspaces.roles).forEach(roleWorkspace => {
        const roleWorkspaceItem = document.createElement('div');
        roleWorkspaceItem.className = 'workspace-item';
        roleWorkspaceItem.style.backgroundColor = '#16213e';
        roleWorkspaceItem.style.borderRadius = '8px';
        roleWorkspaceItem.style.padding = '15px';
        roleWorkspaceItem.style.marginBottom = '20px';
        roleWorkspaceItem.style.border = '1px solid #3a0ca3';
        
        // 获取角色下的代理工作区域
        const agentWorkspaces = roleWorkspace.agents.map(agentId => project.workspaces.agents[agentId]).filter(Boolean);
        
        let agentsHTML = '';
        if (agentWorkspaces.length > 0) {
          agentsHTML = `
            <div class="role-agents" style="margin-top: 10px;">
              <h5 style="color: #4cc9f0; margin-bottom: 10px;">代理工作区域</h5>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${agentWorkspaces.map(agentWorkspace => `
                  <div style="background-color: #0f3460; padding: 15px; border-radius: 6px; border: 1px solid #3a0ca3;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <h6 style="color: #4cc9f0; margin: 0;">${agentWorkspace.name}</h6>
                      <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" style="font-size: 12px; padding: 4px 8px;" onclick="viewWorkspace('${projectId}', '${agentWorkspace.id}')">查看</button>
                        <button class="btn btn-secondary btn-sm" style="font-size: 12px; padding: 4px 8px;" onclick="addFileToWorkspace('${projectId}', '${agentWorkspace.id}')">添加文件</button>
                      </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                      <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 12px; color: #666; margin-bottom: 2px;">路径:</span>
                        <p style="margin: 0; font-size: 12px; color: #a9b1d6; word-wrap: break-word; word-break: break-all;">${agentWorkspace.path}</p>
                      </div>
                      <p style="margin: 5px 0 0 0; font-size: 12px; color: #a9b1d6;">文件数量: ${agentWorkspace.files ? agentWorkspace.files.length : 0}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
        
        roleWorkspaceItem.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="color: #4cc9f0; margin: 0;">${roleWorkspace.name}</h4>
            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.9rem;" onclick="viewRoleWorkspace('${projectId}', '${roleWorkspace.name}')">查看角色工作区</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px;">
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 14px; color: #666; margin-bottom: 2px;">路径:</span>
              <p style="margin: 0; font-size: 14px; color: #a9b1d6; word-wrap: break-word; word-break: break-all;">${roleWorkspace.path}</p>
            </div>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #a9b1d6;">创建时间: ${new Date(roleWorkspace.createdAt).toLocaleString()}</p>
          </div>
          ${agentsHTML}
        `;
        
        workspacesContainer.appendChild(roleWorkspaceItem);
      });
    }
  } catch (error) {
    console.error('加载代理工作区域失败:', error);
  }
}

// 查看角色工作区域
function viewRoleWorkspace(projectId, roleName) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !project.workspaces || !project.workspaces.roles) {
      alert('工作区域不存在');
      return;
    }
    
    const roleKey = roleName.toLowerCase().replace(/\s+/g, '_');
    const roleWorkspace = project.workspaces.roles[roleKey];
    
    if (!roleWorkspace) {
      alert('角色工作区域不存在');
      return;
    }
    
    // 创建模态框显示工作区域内容
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // 模态框内容
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#1a1a2e';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '800px';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    
    // 获取角色下的代理
    const agents = roleWorkspace.agents.map(agentId => project.workspaces.agents[agentId]).filter(Boolean);
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #4cc9f0; margin: 0;">${roleWorkspace.name} 工作区域</h3>
        <button style="background-color: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;" onclick="this.closest('.modal').remove()">关闭</button>
      </div>
      <div style="margin-bottom: 20px;">
        <p><strong>路径:</strong> ${roleWorkspace.path}</p>
        <p><strong>创建时间:</strong> ${new Date(roleWorkspace.createdAt).toLocaleString()}</p>
        <p><strong>代理数量:</strong> ${agents.length}</p>
      </div>
      <div>
        <h4 style="color: #4cc9f0; margin-bottom: 10px;">代理列表</h4>
        ${agents.length > 0 ? `
          <ul style="list-style: none; padding: 0;">
            ${agents.map(agent => `
              <li style="padding: 10px; border-bottom: 1px solid #3a0ca3; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>${agent.name}</strong>
                    <p style="margin: 5px 0; font-size: 14px; color: #a9b1d6;">路径: ${agent.path}</p>
                  </div>
                  <button class="btn btn-secondary btn-sm" onclick="viewWorkspace('${projectId}', '${agent.id}')">查看代理工作区</button>
                </div>
              </li>
            `).join('')}
          </ul>
        ` : '<p>暂无代理</p>'}
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  } catch (error) {
    console.error('查看角色工作区域失败:', error);
    alert('查看角色工作区域失败');
  }
}

// 查看代理工作区域
function viewWorkspace(projectId, workspaceId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !project.workspaces || !project.workspaces.agents || !project.workspaces.agents[workspaceId]) {
      alert('工作区域不存在');
      return;
    }
    
    const workspace = project.workspaces.agents[workspaceId];
    
    // 创建模态框显示工作区域内容
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#16213e';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.maxWidth = '80%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    
    let filesList = '<div class="no-files">暂无文件</div>';
    if (workspace.files.length > 0) {
      filesList = '<ul>';
      workspace.files.forEach(file => {
        filesList += `<li>${file.name} - ${formatFileSize(file.size)}</li>`;
      });
      filesList += '</ul>';
    }
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #4cc9f0;">${workspace.name}的工作区域</h3>
        <button class="btn btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()">关闭</button>
      </div>
      <div style="color: #a9a9a9;">
        <p><strong>角色:</strong> ${workspace.role}</p>
        <p><strong>工作路径:</strong> ${workspace.path}</p>
        <p><strong>文件数量:</strong> ${workspace.files.length}</p>
        <p><strong>创建时间:</strong> ${new Date(workspace.createdAt).toLocaleString()}</p>
        <p><strong>更新时间:</strong> ${new Date(workspace.updatedAt).toLocaleString()}</p>
        <h4 style="color: #4cc9f0; margin-top: 20px;">文件列表</h4>
        ${filesList}
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  } catch (error) {
    console.error('查看工作区域失败:', error);
    alert('查看工作区域失败');
  }
}

// 向工作区域添加文件
function addFileToWorkspace(projectId, workspaceId) {
  try {
    // 创建文件输入框
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    
    fileInput.addEventListener('change', async (e) => {
      if (e.target.files.length > 0) {
        // 从本地存储加载项目
        const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
        const project = projects.find(p => p.id === projectId);
        
        if (!project || !project.workspaces || !project.workspaces.agents || !project.workspaces.agents[workspaceId]) {
          alert('工作区域不存在');
          return;
        }
        
        const workspace = project.workspaces.agents[workspaceId];
        
        // 处理每个文件
        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          
          // 读取文件内容
          const content = await readFileContent(file);
          
          // 创建文件对象
          const fileObj = {
            id: Date.now().toString() + '_' + i,
            name: file.name,
            size: file.size,
            type: file.type,
            content: content,
            addedAt: new Date().toISOString()
          };
          
          // 添加文件到工作区域
          workspace.files.push(fileObj);
        }
        
        // 更新工作区域时间
        workspace.updatedAt = new Date().toISOString();
        
        // 保存到本地存储
        await saveProjectsData(projects);
        
        // 提示添加成功
        alert(`成功添加 ${e.target.files.length} 个文件到工作区域`);
        
        // 重新加载项目详情
        loadProjectDetail(projectId);
      }
    });
    
    // 触发文件选择
    fileInput.click();
  } catch (error) {
    console.error('添加文件到工作区域失败:', error);
    alert('添加文件到工作区域失败');
  }
}

// 加载项目列表
async function loadProjects() {
  const projectsList = document.getElementById('projects-list');
  projectsList.innerHTML = '';
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    
    // 加载任务数据以统计项目任务
    let tasks = [];
    try {
      // 优先从任务管理器获取任务列表
      if (window.taskManager && window.taskManager.tasks) {
        tasks = window.taskManager.tasks;
        console.log('从任务管理器加载任务统计:', tasks.length, '个任务');
      } else if (window.electron && window.electron.loadTasks) {
        const result = await window.electron.loadTasks();
        if (result.success && result.tasks) {
          tasks = result.tasks;
        }
      } else {
        tasks = JSON.parse(localStorage.getItem('agentbrother_tasks') || '[]');
      }
    } catch (error) {
      console.error('加载任务数据失败:', error);
      tasks = [];
    }
    
    if (projects.length === 0) {
      projectsList.innerHTML = '<div class="no-projects">暂无项目，请创建新项目</div>';
      return;
    }
    
    projects.forEach(project => {
      const projectItem = document.createElement('div');
      projectItem.className = 'project-item';
      
      // 计算项目运行时间
      const createdDate = new Date(project.createdAt);
      const now = new Date();
      const daysRunning = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      const runningTimeText = daysRunning === 0 ? '今天创建' : `已运行 ${daysRunning} 天`;
      
      // 统计角色数量
      const roleCount = project.roles ? project.roles.length : 0;
      
      // 统计任务数量
      const taskCount = tasks.filter(t => t.projectId === project.id).length;
      
      // 创建时间格式化
      const createdTimeText = createdDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      projectItem.innerHTML = `
        <div class="project-card" style="background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%); border: 1px solid #3a0ca3; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3); transition: transform 0.2s, box-shadow 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div style="flex: 1;">
              <h3 style="color: #4cc9f0; margin: 0 0 8px 0; font-size: 1.3rem; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-folder-open" style="font-size: 1.2rem;"></i>
                ${project.name}
              </h3>
              <p style="color: #a9a9a9; margin: 0 0 12px 0; font-size: 0.9rem; line-height: 1.4;">${project.description || '暂无描述'}</p>
              <p style="color: #666; margin: 0; font-size: 0.8rem; font-family: monospace;">
                <i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>${project.path}
              </p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; padding: 15px; background-color: rgba(58, 12, 163, 0.2); border-radius: 8px;">
            <div style="text-align: center;">
              <div style="color: #4cc9f0; font-size: 1.8rem; font-weight: bold; margin-bottom: 5px;">
                <i class="fas fa-users" style="font-size: 1.2rem; margin-right: 5px;"></i>${roleCount}
              </div>
              <div style="color: #a9a9a9; font-size: 0.8rem;">角色数量</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #4cc9f0; font-size: 1.8rem; font-weight: bold; margin-bottom: 5px;">
                <i class="fas fa-tasks" style="font-size: 1.2rem; margin-right: 5px;"></i>${taskCount}
              </div>
              <div style="color: #a9a9a9; font-size: 0.8rem;">任务数量</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #4cc9f0; font-size: 1.8rem; font-weight: bold; margin-bottom: 5px;">
                <i class="fas fa-calendar-alt" style="font-size: 1.2rem; margin-right: 5px;"></i>${daysRunning}
              </div>
              <div style="color: #a9a9a9; font-size: 0.8rem;">运行天数</div>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid rgba(58, 12, 163, 0.3);">
            <div style="color: #666; font-size: 0.8rem;">
              <i class="fas fa-clock" style="margin-right: 5px;"></i>创建于 ${createdTimeText}
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-primary" onclick="openProject('${project.id}')" style="padding: 8px 16px; font-size: 0.9rem;">
                <i class="fas fa-sign-in-alt" style="margin-right: 5px;"></i>进入
              </button>
              <button class="btn btn-secondary" onclick="editProject('${project.id}')" style="padding: 8px 16px; font-size: 0.9rem;">
                <i class="fas fa-edit" style="margin-right: 5px;"></i>编辑
              </button>
              <button class="btn btn-danger" onclick="deleteProject('${project.id}')" style="padding: 8px 16px; font-size: 0.9rem;">
                <i class="fas fa-trash" style="margin-right: 5px;"></i>删除
              </button>
            </div>
          </div>
        </div>
      `;
      
      // 添加悬停效果
      projectItem.addEventListener('mouseenter', () => {
        projectItem.querySelector('.project-card').style.transform = 'translateY(-4px)';
        projectItem.querySelector('.project-card').style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.4)';
      });
      
      projectItem.addEventListener('mouseleave', () => {
        projectItem.querySelector('.project-card').style.transform = 'translateY(0)';
        projectItem.querySelector('.project-card').style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
      });
      
      projectsList.appendChild(projectItem);
    });
  } catch (error) {
    console.error('加载项目失败:', error);
    projectsList.innerHTML = '<div class="error-message">加载项目失败</div>';
  }
}

// 保存项目
async function saveProject() {
  const projectName = document.getElementById('project-name').value.trim();
  const projectDescription = document.getElementById('project-description').value.trim();
  const projectPath = document.getElementById('project-path').value.trim();
  
  if (!projectName) {
    alert('请输入项目名称');
    return;
  }
  
  if (!projectPath) {
    alert('请输入项目路径');
    return;
  }
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    
    // 创建新项目
    const newProject = {
      id: Date.now().toString(),
      name: projectName,
      description: projectDescription,
      path: projectPath,
      createdAt: new Date().toISOString(),
      roles: []
    };
    
    // 添加项目到列表
    projects.push(newProject);
    
    // 保存到本地存储
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    
    // 保存到文件（持久化）
    await saveProjectsToFile(projects);
    
    // 显示项目列表
    showPage('projects');
    loadProjects();
    
    // 提示保存成功
    alert('项目创建成功');
  } catch (error) {
    console.error('保存项目失败:', error);
    alert('保存项目失败');
  }
}

// 打开项目
function openProject(projectId) {
  // 从本地存储加载项目
  const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    alert('项目不存在');
    return;
  }
  
  // 显示项目详情页面
  showPage('project-detail-page');
  
  // 加载项目详情
  loadProjectDetail(projectId);
}

// 加载项目详情
async function loadProjectDetail(projectId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    // 显示项目信息
    document.getElementById('project-detail-name').textContent = project.name;
    document.getElementById('project-detail-description').textContent = project.description;
    document.getElementById('project-detail-path').textContent = project.path;
    document.getElementById('project-detail-created').textContent = new Date(project.createdAt).toLocaleString();
    
    // 加载项目中的角色和代理
    const projectAgentsList = document.getElementById('project-agents-list');
    projectAgentsList.innerHTML = '';
    
    if (!project.roles || project.roles.length === 0) {
      projectAgentsList.innerHTML = '<div class="no-agents">暂无角色，请添加角色</div>';
    } else {
      project.roles.forEach(role => {
        const roleItem = document.createElement('div');
        roleItem.className = 'role-item';
        roleItem.style.backgroundColor = '#16213e';
        roleItem.style.borderRadius = '8px';
        roleItem.style.padding = '15px';
        roleItem.style.marginBottom = '20px';
        roleItem.style.border = '1px solid #3a0ca3';
        
        let agentsHTML = '';
        if (role.agents && role.agents.length > 0) {
          agentsHTML = `
            <div class="role-agents">
              <h5 style="color: #4cc9f0; margin-top: 10px; margin-bottom: 10px;">代理列表</h5>
              <ul style="list-style: none; padding: 0;">
                ${role.agents.map(agent => `
                  <li style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid rgba(58, 12, 163, 0.3);">
                    <span>${agent.name} (${agent.framework})</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          `;
        }
        
        const roleIcon = getRoleIcon(role.name);
        roleItem.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">${roleIcon}</span>
              <h4 style="color: #4cc9f0; margin: 0;">${role.name}</h4>
            </div>
            <button class="btn btn-primary" onclick="editRole('${projectId}', '${role.name}')">编辑</button>
          </div>
          ${agentsHTML}
        `;
        
        projectAgentsList.appendChild(roleItem);
      });
    }
    
    // 加载项目文档
    loadProjectDocuments(projectId);
    
    // 加载项目任务
    loadProjectTasks(projectId);
    
    // 加载代理工作区域
    loadAgentWorkspaces(projectId);
    
    // 保存当前项目ID
    localStorage.setItem('current_project_id', projectId);
  } catch (error) {
    console.error('加载项目详情失败:', error);
  }
}

// 编辑项目
window.editProject = function(projectId) {
  // 从本地存储加载项目
  const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    alert('项目不存在');
    return;
  }
  
  // 创建编辑项目模态框
  const modal = document.createElement('div');
  modal.id = 'edit-project-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  
  modal.innerHTML = `
    <div style="background-color: #16213e; border-radius: 10px; padding: 30px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #4cc9f0; margin: 0;">
          <i class="fas fa-edit" style="margin-right: 10px;"></i>编辑项目
        </h3>
        <button onclick="closeEditProjectModal()" style="background: none; border: none; color: #a9a9a9; font-size: 1.5rem; cursor: pointer;">&times;</button>
      </div>
      
      <form id="edit-project-form" style="display: flex; flex-direction: column; gap: 15px;">
        <input type="hidden" id="edit-project-id" value="${project.id}">
        
        <div>
          <label style="display: block; margin-bottom: 5px; color: #a9a9a9;">项目名称</label>
          <input type="text" id="edit-project-name" required style="width: 100%; padding: 10px; border: none; border-radius: 6px; background-color: #0f3460; color: white;" value="${project.name}" placeholder="例如: AI助手项目">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; color: #a9a9a9;">项目描述</label>
          <textarea id="edit-project-description" rows="3" style="width: 100%; padding: 10px; border: none; border-radius: 6px; background-color: #0f3460; color: white; resize: vertical;" placeholder="描述项目的用途和目标...">${project.description || ''}</textarea>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; color: #a9a9a9;">项目路径</label>
          <input type="text" id="edit-project-path" required style="width: 100%; padding: 10px; border: none; border-radius: 6px; background-color: #0f3460; color: white;" value="${project.path}" placeholder="例如: /path/to/project">
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;">
          <button type="button" onclick="closeEditProjectModal()" class="btn btn-secondary" style="padding: 10px 20px;">取消</button>
          <button type="submit" class="btn btn-primary" style="padding: 10px 20px;">
            <i class="fas fa-save" style="margin-right: 5px;"></i>保存
          </button>
        </div>
      </form>
    </div>
  `;
  
  // 点击模态框外部关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeEditProjectModal();
    }
  });
  
  // 绑定表单提交事件
  const form = modal.querySelector('#edit-project-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEditProjectFromModal();
  });
  
  document.body.appendChild(modal);
}

// 关闭编辑项目模态框
window.closeEditProjectModal = function() {
  const modal = document.getElementById('edit-project-modal');
  if (modal) {
    modal.remove();
  }
};

// 从模态框保存编辑项目
window.saveEditProjectFromModal = async function() {
  const projectId = document.getElementById('edit-project-id').value;
  const projectName = document.getElementById('edit-project-name').value.trim();
  const projectDescription = document.getElementById('edit-project-description').value.trim();
  const projectPath = document.getElementById('edit-project-path').value.trim();
  
  if (!projectName) {
    alert('请输入项目名称');
    return;
  }
  
  if (!projectPath) {
    alert('请输入项目路径');
    return;
  }
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      alert('项目不存在');
      return;
    }
    
    // 更新项目信息
    projects[projectIndex] = {
      ...projects[projectIndex],
      name: projectName,
      description: projectDescription,
      path: projectPath
    };
    
    // 保存到本地存储
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    
    // 保存到文件（持久化）
    await saveProjectsToFile(projects);
    
    // 关闭模态框
    closeEditProjectModal();
    
    // 重新加载项目列表
    loadProjects();
    
    // 提示保存成功
    alert('项目更新成功');
  } catch (error) {
    console.error('保存项目失败:', error);
    alert('保存项目失败');
  }
}



// 删除项目
async function deleteProject(projectId) {
  if (!confirm('确定要删除这个项目吗？')) {
    return;
  }
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const updatedProjects = projects.filter(p => p.id !== projectId);
    
    // 保存到本地存储和文件
    await saveProjectsData(updatedProjects);
    
    // 重新加载项目列表
    loadProjects();
    
    // 提示删除成功
    alert('项目删除成功');
  } catch (error) {
    console.error('删除项目失败:', error);
    alert('删除项目失败');
  }
}

// 添加角色到项目
async function addRoleToProject() {
  const projectId = localStorage.getItem('current_project_id');
  if (!projectId) {
    alert('请先打开一个项目');
    return;
  }
  
  const framework = document.getElementById('add-agent-framework').value;
  const agentId = document.getElementById('add-agent-select').value;
  const role = document.getElementById('add-agent-role').value;
  
  if (!agentId) {
    alert('请选择代理');
    return;
  }
  
  if (!role) {
    alert('请输入角色');
    return;
  }
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    // 从框架获取代理信息
    const agent = await window.electron.getAgentDetail(agentId, framework);
    
    // 检查角色是否已存在
    let roleObj = project.roles.find(r => r.name === role);
    
    if (!roleObj) {
      // 创建新角色
      roleObj = {
        name: role,
        agents: []
      };
      project.roles.push(roleObj);
    }
    
    // 替换角色的代理（只保留一个）
    roleObj.agents = [{
      id: agentId,
      name: agent.name,
      framework: framework
    }];
    
    // 保存到本地存储
    await saveProjectsData(projects);
    
    // 重新加载项目详情
    loadProjectDetail(projectId);
    
    // 切换回项目详情页面
    showPage('project-detail-page');
    
    // 提示添加成功
    alert('角色添加成功');
  } catch (error) {
    console.error('添加角色失败:', error);
    alert('添加角色失败');
  }
}

// 从角色中移除代理（保留函数但不在界面上使用）
async function removeAgentFromRole(projectId, roleName, agentId) {
  if (!confirm('确定要从角色中移除这个代理吗？')) {
    return;
  }
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    // 找到角色
    const role = project.roles.find(r => r.name === roleName);
    if (!role) {
      alert('角色不存在');
      return;
    }
    
    // 从角色中移除代理
    role.agents = role.agents.filter(agent => agent.id !== agentId);
    
    // 如果角色没有代理了，移除角色
    if (role.agents.length === 0) {
      project.roles = project.roles.filter(r => r.name !== roleName);
    }
    
    // 保存到本地存储
    await saveProjectsData(projects);
    
    // 重新加载项目详情
    loadProjectDetail(projectId);
    
    // 提示移除成功
    alert('代理移除成功');
  } catch (error) {
    console.error('移除代理失败:', error);
    alert('移除代理失败');
  }
}



// 从项目中移除角色
async function removeRoleFromProject(projectId, roleName) {
  if (!confirm('确定要从项目中移除这个角色吗？')) {
    return;
  }
  
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    // 从项目中移除角色
    project.roles = project.roles.filter(role => role.name !== roleName);
    
    // 保存到本地存储
    await saveProjectsData(projects);
    
    // 重新加载项目详情
    loadProjectDetail(projectId);
    
    // 提示移除成功
    alert('角色移除成功');
  } catch (error) {
    console.error('移除角色失败:', error);
    alert('移除角色失败');
  }
}

// 编辑角色
async function editRole(projectId, roleName) {
  // 从本地存储加载项目
  const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
  const project = projects.find(p => p.id === projectId);
  const role = project.roles.find(r => r.name === roleName);

  if (!project || !role) {
    alert('角色不存在');
    return;
  }

  // 获取所有可用的代理（从侧栏代理列表中获取真实代理）
  let allAgents = [];
  try {
    // 尝试从 localStorage 中获取代理数据，这是侧栏代理列表使用的数据源
    const agentsData = localStorage.getItem('agentbrother_agents');
    if (agentsData) {
      const agents = JSON.parse(agentsData);
      // 转换为与之前格式一致的代理列表
      allAgents = agents.map(agent => ({
        id: agent.id || agent.name,
        name: agent.name,
        framework: agent.framework || agent.type
      }));
    }
    
    // 如果 localStorage 中没有代理数据，尝试从 Electron 主进程获取
    if (allAgents.length === 0 && window.electron && window.electron.getAgents) {
      // 获取 OpenClaw 代理
      const openclawAgents = await window.electron.getAgents('openclaw');
      if (openclawAgents.success) {
        allAgents = allAgents.concat(openclawAgents.agents.map(agent => ({
          ...agent,
          framework: 'openclaw'
        })));
      }

      // 获取 ZeroClaw 代理
      const zeroclawAgents = await window.electron.getAgents('zeroclaw');
      if (zeroclawAgents.success) {
        allAgents = allAgents.concat(zeroclawAgents.agents.map(agent => ({
          ...agent,
          framework: 'zeroclaw'
        })));
      }
    }
    
    // 确保角色的代理列表存在
    if (!role.agents) {
      role.agents = [];
    }
  } catch (error) {
    console.error('获取代理列表失败:', error);
    allAgents = [];
  }

  // 角色图标选项
  const roleIcons = [
    { name: 'CEO', icon: '👔' },
    { name: 'CTO', icon: '💻' },
    { name: '运营官', icon: '📊' },
    { name: '产品经理', icon: '📱' },
    { name: '设计师', icon: '🎨' },
    { name: '开发', icon: '⚡' },
    { name: '测试', icon: '🔍' },
    { name: '运维', icon: '🔧' },
    { name: '其他', icon: '🤖' }
  ];

  // 当前角色的图标
  const currentIcon = getRoleIcon(role.name);

  // 创建编辑角色的对话框
  const dialog = document.createElement('div');
  dialog.className = 'modal';
  dialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  // 构建角色当前绑定的代理列表（只显示一个代理）
  const currentAgent = role.agents && role.agents.length > 0 ? role.agents[0] : null;
  const currentAgentsHTML = currentAgent ? `
    <div style="padding: 10px; border-radius: 5px; background-color: #16213e;">
      <div style="font-weight: bold;">${currentAgent.name}</div>
      <div style="font-size: 12px; color: #a9b1d6; margin-top: 5px;">${currentAgent.framework}</div>
    </div>
  ` : '<div style="text-align: center; padding: 10px; color: #a9b1d6;">暂无绑定代理</div>';
  
  // 最终的代理管理HTML
  const finalAgentsHTML = `
    <div style="margin-bottom: 15px;">
      <h5 style="color: #4cc9f0; margin-bottom: 10px;">当前绑定的代理</h5>
      ${currentAgentsHTML}
    </div>
  `;

  // 为对话框添加点击事件，点击背景关闭对话框
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      document.body.removeChild(dialog);
    }
  });

  dialog.innerHTML = `
    <div style="background-color: #1a1a2e; border-radius: 10px; padding: 20px; width: 600px; border: 1px solid #3a0ca3; max-height: 80vh; overflow-y: auto;">
      <h3 style="color: #4cc9f0; margin-top: 0;">编辑角色</h3>
      
      <!-- 角色基本信息 -->
      <div style="margin-bottom: 20px;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #a9b1d6;">角色名称</label>
          <input type="text" id="edit-role-name" value="${role.name}" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #3a0ca3; background-color: #16213e; color: white;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 10px; color: #a9b1d6;">角色图标</label>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${roleIcons.map(icon => `
              <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 10px; border-radius: 5px; ${currentIcon === icon.icon ? 'background-color: #3a0ca3; border: 1px solid #4cc9f0;' : 'background-color: #16213e; border: 1px solid #3a0ca3;'}" data-icon="${icon.icon}">
                <span style="font-size: 24px;">${icon.icon}</span>
                <span style="font-size: 12px; margin-top: 5px;">${icon.name}</span>
              </div>
            `).join('')}
          </div>
          <input type="hidden" id="edit-role-icon" value="${currentIcon}">
        </div>
      </div>
      
      <!-- 代理管理 -->
      <div style="margin-bottom: 20px;">
        <h4 style="color: #4cc9f0; margin-bottom: 10px;">代理管理</h4>
        <div style="background-color: #16213e; border-radius: 5px; padding: 10px; max-height: 300px; overflow-y: auto;">
          ${finalAgentsHTML}
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="cancel-edit-role" class="btn btn-secondary">取消</button>
        <button id="save-edit-role" class="btn btn-primary">保存</button>
        <button id="delete-edit-role" class="btn btn-danger">删除角色</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  // 图标选择事件
  dialog.querySelectorAll('[data-icon]').forEach(element => {
    element.addEventListener('click', () => {
      // 移除所有图标的选中状态
      dialog.querySelectorAll('[data-icon]').forEach(iconElement => {
        iconElement.style.backgroundColor = '#16213e';
        iconElement.style.border = '1px solid #3a0ca3';
      });
      // 设置当前选中图标的状态
      element.style.backgroundColor = '#3a0ca3';
      element.style.border = '1px solid #4cc9f0';
      // 更新隐藏输入值
      document.getElementById('edit-role-icon').value = element.dataset.icon;
    });
  });



  // 取消按钮点击事件
  dialog.getElementById('cancel-edit-role').addEventListener('click', () => {
    document.body.removeChild(dialog);
  });

  // 保存按钮点击事件
  dialog.getElementById('save-edit-role').addEventListener('click', async () => {
    const newRoleName = dialog.getElementById('edit-role-name').value.trim();
    const newRoleIcon = dialog.getElementById('edit-role-icon').value;
    
    if (!newRoleName) {
      alert('角色名称不能为空');
      return;
    }

    try {
      // 检查角色名称是否已存在
      const existingRole = project.roles.find(r => r.name === newRoleName && r.name !== roleName);
      if (existingRole) {
        alert('角色名称已存在');
        return;
      }

      // 更新角色信息
      role.name = newRoleName;
      // 注意：图标是通过 getRoleIcon 函数动态生成的，这里我们不直接存储图标

      // 保存项目数据
      await saveProjectsData(projects);

      // 重新加载项目详情
      loadProjectDetail(projectId);

      // 关闭对话框
      document.body.removeChild(dialog);

      alert('角色已更新');
    } catch (error) {
      console.error('更新角色失败:', error);
      alert('更新角色失败');
    }
  });

  // 删除角色按钮点击事件
  dialog.getElementById('delete-edit-role').addEventListener('click', async () => {
    if (!confirm(`确定要删除角色 ${role.name} 吗？`)) {
      return;
    }

    try {
      // 从项目中移除角色
      project.roles = project.roles.filter(r => r.name !== role.name);

      // 保存项目数据
      await saveProjectsData(projects);

      // 重新加载项目详情
      loadProjectDetail(projectId);

      // 关闭对话框
      document.body.removeChild(dialog);

      alert('角色已删除');
    } catch (error) {
      console.error('删除角色失败:', error);
      alert('删除角色失败');
    }
  });
}

// 打开项目聊天
function openProjectChat(projectId) {
  // 从本地存储加载项目
  const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    alert('项目不存在');
    return;
  }
  
  if (!project.roles || project.roles.length === 0) {
    alert('项目中没有角色，请先添加角色');
    return;
  }
  
  // 检查是否有代理
  let hasAgents = false;
  for (const role of project.roles) {
    if (role.agents && role.agents.length > 0) {
      hasAgents = true;
      break;
    }
  }
  
  if (!hasAgents) {
    alert('项目中没有代理，请先为角色添加代理');
    return;
  }
  
  // 显示项目聊天页面
  showPage('project-chat-page');
  
  // 加载项目聊天
  loadProjectChat(projectId);
}

// 加载项目聊天
async function loadProjectChat(projectId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    // 显示项目名称
    document.getElementById('project-chat-name').textContent = project.name;
    
    // 加载聊天记录
    const chatMessages = document.getElementById('project-chat-messages');
    chatMessages.innerHTML = '';
    
    // 从本地存储加载聊天记录
    const chatHistory = JSON.parse(localStorage.getItem(`project_chat_${projectId}`) || '[]');
    
    chatHistory.forEach(message => {
      addProjectChatMessage(message.role, message.content, message.agent, message.roleName);
    });
    
    // 加载角色列表到侧边栏
    loadProjectRoleList(project);
    
    // 初始化文件上传功能
    initProjectChatFileUpload();
    
    // 保存当前项目ID
    localStorage.setItem('current_project_chat_id', projectId);
  } catch (error) {
    console.error('加载项目聊天失败:', error);
  }
}

// 加载项目角色列表到侧边栏
function loadProjectRoleList(project) {
  const roleListContainer = document.getElementById('project-role-list');
  if (!roleListContainer) return;
  
  roleListContainer.innerHTML = '';
  
  // 添加创建者（项目所有者）
  const creatorItem = document.createElement('div');
  creatorItem.className = 'role-item-chat';
  creatorItem.innerHTML = `
    <div class="role-icon">�</div>
    <div class="role-info">
      <div class="role-name">创建者</div>
      <div class="role-agents-count">项目所有者</div>
    </div>
  `;
  roleListContainer.appendChild(creatorItem);
  
  // 添加分隔线
  if (project.roles && project.roles.length > 0) {
    const divider = document.createElement('div');
    divider.style.cssText = `
      height: 1px;
      background-color: #3a0ca3;
      margin: 10px 0;
    `;
    roleListContainer.appendChild(divider);
  }
  
  // 添加每个角色
  if (!project.roles || project.roles.length === 0) {
    const noRolesMsg = document.createElement('div');
    noRolesMsg.className = 'no-agents';
    noRolesMsg.textContent = '暂无角色';
    noRolesMsg.style.padding = '10px';
    noRolesMsg.style.textAlign = 'center';
    roleListContainer.appendChild(noRolesMsg);
    return;
  }
  
  project.roles.forEach(role => {
    const roleItem = document.createElement('div');
    roleItem.className = 'role-item-chat';
    
    const agentCount = role.agents ? role.agents.length : 0;
    const roleIcon = getRoleIcon(role.name);
    
    roleItem.innerHTML = `
      <div class="role-icon">${roleIcon}</div>
      <div class="role-info">
        <div class="role-name">${role.name}</div>
        <div class="role-agents-count">${agentCount} 个代理</div>
      </div>
    `;
    
    roleListContainer.appendChild(roleItem);
  });
}

// 获取角色图标
function getRoleIcon(roleName) {
  const roleIcons = {
    'AI CEO': '👔',
    'AI CTO': '💻',
    'AI运营官': '📊',
    'AI产品经理': '📱',
    'AI设计师': '🎨',
    'AI开发': '⚡',
    'AI测试': '🔍',
    'AI运维': '🔧'
  };
  
  // 根据角色名关键词匹配
  for (const [key, icon] of Object.entries(roleIcons)) {
    if (roleName.toLowerCase().includes(key.toLowerCase().replace('AI', '').trim())) {
      return icon;
    }
  }
  
  // 默认图标
  return '🤖';
}

// 插入提及到聊天输入框
function insertMentionToChatInput(mention) {
  const input = document.getElementById('project-chat-input');
  if (!input) return;
  
  const currentValue = input.value;
  const cursorPosition = input.selectionStart;
  
  // 在光标位置插入提及
  const newValue = currentValue.slice(0, cursorPosition) + mention + ' ' + currentValue.slice(cursorPosition);
  input.value = newValue;
  
  // 聚焦输入框
  input.focus();
  // 将光标移到提及之后
  input.setSelectionRange(cursorPosition + mention.length + 1, cursorPosition + mention.length + 1);
}

// 初始化项目聊天文件上传
function initProjectChatFileUpload() {
  const fileInput = document.getElementById('project-chat-file-input');
  const chatInput = document.getElementById('project-chat-input');
  
  if (!fileInput || !chatInput) return;
  
  // 移除旧的事件监听器
  const newFileInput = fileInput.cloneNode(true);
  fileInput.parentNode.replaceChild(newFileInput, fileInput);
  
  // 添加新的事件监听器
  newFileInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
      await handleProjectChatFileUpload(e.target.files[0]);
    }
  });
  
  // 添加回车键发送消息
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendProjectChatMessage();
    }
  });

  // 添加 @ 提及功能
  let mentionDropdown = null;
  chatInput.addEventListener('keyup', (e) => {
    if (e.key === '@') {
      showMentionDropdown();
    } else if (e.key === 'Escape') {
      hideMentionDropdown();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      navigateMentionDropdown(e.key);
    } else if (e.key === 'Enter') {
      selectMentionItem();
    }
  });

  // 点击其他地方关闭下拉列表
  document.addEventListener('click', (e) => {
    if (mentionDropdown && !mentionDropdown.contains(e.target) && e.target !== chatInput) {
      hideMentionDropdown();
    }
  });

  // 显示提及下拉列表
  function showMentionDropdown() {
    // 移除旧的下拉列表
    hideMentionDropdown();

    // 获取项目信息
    const projectId = localStorage.getItem('current_project_id');
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);

    if (!project) return;

    // 构建可提及的参与者列表
    const participants = [];

    // 只添加角色，不添加创建者（不能@自己）
    if (project.roles) {
      project.roles.forEach(role => {
        participants.push({
          id: role.name,
          name: role.name,
          type: 'role'
        });
      });
    }

    // 创建下拉列表
    mentionDropdown = document.createElement('div');
    mentionDropdown.id = 'project-chat-mention-dropdown';
    mentionDropdown.style.cssText = `
      position: absolute;
      background-color: #1a1a2e;
      border: 1px solid #3a0ca3;
      border-radius: 5px;
      padding: 5px 0;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      width: 200px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `;

    // 添加参与者选项
    participants.forEach((participant, index) => {
      const item = document.createElement('div');
      item.className = 'mention-item';
      item.dataset.id = participant.id;
      item.dataset.name = participant.name;
      item.dataset.type = participant.type;
      item.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        ${index === 0 ? 'background-color: #3a0ca3; color: #4cc9f0;' : 'color: #a9b1d6;'}
      `;
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>${participant.type === 'creator' ? '👤' : '🤖'}</span>
          <span>${participant.name}</span>
        </div>
      `;

      // 添加点击事件
      item.addEventListener('click', () => {
        insertMentionToChatInput(participant.name);
        hideMentionDropdown();
      });

      mentionDropdown.appendChild(item);
    });

    // 定位下拉列表（浮在输入框上方）
    const rect = chatInput.getBoundingClientRect();
    // 计算下拉列表的高度
    const dropdownHeight = Math.min(200, participants.length * 40);
    // 定位到输入框上方，确保框的最低点就是输入框
    mentionDropdown.style.top = `${rect.top + window.scrollY - dropdownHeight}px`;
    mentionDropdown.style.left = `${rect.left + window.scrollX}px`;

    document.body.appendChild(mentionDropdown);
  }

  // 隐藏提及下拉列表
  function hideMentionDropdown() {
    if (mentionDropdown) {
      document.body.removeChild(mentionDropdown);
      mentionDropdown = null;
    }
  }

  // 导航提及下拉列表
  function navigateMentionDropdown(direction) {
    if (!mentionDropdown) return;

    const items = mentionDropdown.querySelectorAll('.mention-item');
    if (items.length === 0) return;

    let activeIndex = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].style.backgroundColor === 'rgb(58, 12, 163)') {
        activeIndex = i;
        break;
      }
    }

    // 重置所有项目的样式
    items.forEach(item => {
      item.style.backgroundColor = '';
      item.style.color = '#a9b1d6';
    });

    // 计算新的活跃索引
    if (direction === 'ArrowDown') {
      activeIndex = (activeIndex + 1) % items.length;
    } else if (direction === 'ArrowUp') {
      activeIndex = (activeIndex - 1 + items.length) % items.length;
    }

    // 设置新的活跃项目样式
    items[activeIndex].style.backgroundColor = '#3a0ca3';
    items[activeIndex].style.color = '#4cc9f0';
  }

  // 选择当前活跃的提及项目
  function selectMentionItem() {
    if (!mentionDropdown) return;

    const activeItem = mentionDropdown.querySelector('[style*="background-color: rgb(58, 12, 163)"]');
    if (activeItem) {
      const name = activeItem.dataset.name;
      insertMentionToChatInput(name);
      hideMentionDropdown();
    }
  }
  
  // 初始化拖拽上传
  initProjectChatDragDrop();
}

// 初始化项目聊天拖拽上传
function initProjectChatDragDrop() {
  const chatMessages = document.getElementById('project-chat-messages');
  if (!chatMessages) return;
  
  // 创建拖拽区域
  let dropZone = document.getElementById('project-chat-drop-zone');
  if (!dropZone) {
    dropZone = document.createElement('div');
    dropZone.id = 'project-chat-drop-zone';
    dropZone.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(76, 201, 240, 0.2);
      border: 3px dashed #4cc9f0;
      border-radius: 10px;
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
        <p style="font-size: 0.9rem; margin-top: 5px;">支持 .txt, .doc, .docx, .pdf</p>
      </div>
    `;
    
    chatMessages.parentElement.style.position = 'relative';
    chatMessages.parentElement.appendChild(dropZone);
  }
  
  // 拖拽进入
  document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (document.getElementById('project-chat-page').classList.contains('active')) {
      dropZone.style.display = 'flex';
    }
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
    
    if (!document.getElementById('project-chat-page').classList.contains('active')) {
      return;
    }
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleProjectChatFileUpload(files[0]);
    }
  });
}

// 处理项目聊天文件上传
async function handleProjectChatFileUpload(file) {
  // 检查文件大小（最大100KB）
  const maxSize = 100 * 1024; // 100KB
  if (file.size > maxSize) {
    alert(`文件过大！最大支持 ${maxSize / 1024}KB，当前文件 ${(file.size / 1024).toFixed(2)}KB`);
    return;
  }
  
  // 检查文件类型
  const allowedTypes = ['.txt', '.doc', '.docx', '.pdf'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  
  if (!allowedTypes.includes(fileExtension)) {
    alert(`不支持的文件格式！支持: ${allowedTypes.join(', ')}`);
    return;
  }
  
  try {
    // 读取文件内容
    const content = await readFileContent(file);
    
    // 保存文件信息
    projectChatFileContent = content;
    projectChatFileName = file.name;
    
    // 更新UI显示
    updateProjectChatFileUI(file.name, content.length);
    
    // 显示上传成功提示
    showNotification(`文件 "${file.name}" 已准备好，将在发送消息时一并提交`, 'success');
    
  } catch (error) {
    console.error('读取文件失败:', error);
    alert('读取文件失败: ' + error.message);
  }
}

// 更新项目聊天文件UI
function updateProjectChatFileUI(fileName, contentLength) {
  const fileInfo = document.getElementById('project-chat-file-info');
  const fileNameSpan = fileInfo.querySelector('.file-name');
  
  fileNameSpan.textContent = `📎 ${fileName} (${(contentLength / 1024).toFixed(2)} KB)`;
  fileInfo.style.display = 'flex';
}

// 清除项目聊天上传的文件
function clearProjectChatFile() {
  projectChatFileContent = null;
  projectChatFileName = null;
  
  const fileInfo = document.getElementById('project-chat-file-info');
  if (fileInfo) {
    fileInfo.style.display = 'none';
  }
  
  const fileInput = document.getElementById('project-chat-file-input');
  if (fileInput) {
    fileInput.value = '';
  }
}

// 显示通知
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-size: 0.9rem;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  if (type === 'success') {
    notification.style.backgroundColor = '#4cc9f0';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#f72585';
  } else {
    notification.style.backgroundColor = '#3a0ca3';
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// 添加项目聊天消息
function addProjectChatMessage(role, content, agent = null, roleName = null) {
  const chatMessages = document.getElementById('project-chat-messages');
  
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
  if (agent) {
    const sourceLabel = document.createElement('div');
    sourceLabel.style.fontSize = '0.75rem';
    sourceLabel.style.color = '#a9a9a9';
    sourceLabel.style.marginBottom = '4px';
    sourceLabel.style.padding = '0 5px';
    
    if (role === 'user') {
      sourceLabel.style.textAlign = 'right';
      sourceLabel.textContent = `我`;
    } else {
      sourceLabel.style.textAlign = 'left';
      // 优先显示角色名，如果没有角色名则显示代理名
      const displayName = roleName || agent.role || agent.name;
      const agentInfo = agent.name && agent.name !== displayName ? ` (${agent.name})` : '';
      sourceLabel.textContent = `${displayName}${agentInfo}`;
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

// 发送项目聊天消息
async function sendProjectChatMessage() {
  const projectId = localStorage.getItem('current_project_chat_id');
  if (!projectId) {
    alert('请先打开一个项目聊天');
    return;
  }
  
  const messageInput = document.getElementById('project-chat-input');
  let message = messageInput.value.trim();
  
  // 如果没有消息且没有文件，不发送
  if (!message && !projectChatFileContent) return;
  
  // 从本地存储加载项目
  const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    alert('项目不存在');
    return;
  }
  
  // 构建完整消息（包含文件内容）
  let displayMessage = message;
  let fullMessage = message;
  
  if (projectChatFileContent) {
    // 构建包含文件内容的完整消息
    fullMessage = `[文件: ${projectChatFileName}]\n\n${projectChatFileContent}\n\n用户问题: ${message || '请分析以上文件内容'}`;
    
    // 显示给用户的消息（简化版）
    displayMessage = message 
      ? `[📎 ${projectChatFileName}] ${message}`
      : `[📎 ${projectChatFileName}] 请分析以上文件内容`;
  }
  
  // 添加用户消息
  addProjectChatMessage('user', displayMessage);
  messageInput.value = '';
  
  // 保存聊天记录
  const chatHistory = JSON.parse(localStorage.getItem(`project_chat_${projectId}`) || '[]');
  chatHistory.push({
    role: 'user',
    content: displayMessage,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(`project_chat_${projectId}`, JSON.stringify(chatHistory));
  
  // 处理@提及
  const mentionedRoles = [];
  const mentionedAgents = [];
  const regex = /@([^\s]+)/g;
  let match;
  
  while ((match = regex.exec(message)) !== null) {
    const mention = match[1];
    
    // 检查是否提及"所有人"
    if (mention === '所有人') {
      // 添加所有角色
      project.roles.forEach(role => {
        if (!mentionedRoles.some(r => r.name === role.name)) {
          mentionedRoles.push(role);
        }
      });
    } else {
      // 检查是否提及角色
      const role = project.roles.find(r => r.name === mention);
      if (role) {
        if (!mentionedRoles.some(r => r.name === role.name)) {
          mentionedRoles.push(role);
        }
      } else {
        // 检查是否提及代理
        project.roles.forEach(role => {
          if (role.agents) {
            const agent = role.agents.find(a => a.name === mention);
            if (agent && !mentionedAgents.some(a => a.id === agent.id)) {
              mentionedAgents.push({ agent, role });
            }
          }
        });
      }
    }
  }
  
  // 收集所有需要发送的代理
  const agentsToSend = [];
  
  // 添加提及角色的代理
  mentionedRoles.forEach(role => {
    if (role.agents) {
      role.agents.forEach(agent => {
        if (!agentsToSend.some(item => item.agent.id === agent.id)) {
          agentsToSend.push({ agent, role });
        }
      });
    }
  });
  
  // 添加直接提及的代理
  mentionedAgents.forEach(({ agent, role }) => {
    if (!agentsToSend.some(item => item.agent.id === agent.id)) {
      agentsToSend.push({ agent, role });
    }
  });
  
  // 发送消息给代理
  if (agentsToSend.length > 0) {
    // 只发送给被提及的代理
    for (const { agent, role } of agentsToSend) {
      await sendMessageToAgent(projectId, agent, fullMessage, role.name);
    }
  } else {
    // 发送给所有代理
    project.roles.forEach(role => {
      if (role.agents) {
        role.agents.forEach(agent => {
          sendMessageToAgent(projectId, agent, fullMessage, role.name);
        });
      }
    });
  }
  
  // 发送完成后清除文件内容
  if (projectChatFileContent) {
    clearProjectChatFile();
  }
}

// 发送消息给代理
async function sendMessageToAgent(projectId, agent, message, roleName = null) {
  try {
    // 显示代理正在处理的消息
    const loadingMessage = addProjectChatMessage('assistant', '<i class="fas fa-spinner fa-spin"></i> 正在处理...', agent, roleName);

    // 通过IPC发送消息到主进程
    const response = await window.electron.sendMessage({
      framework: agent.framework,
      agentId: agent.id,
      message: message
    });

    // 移除加载状态
    loadingMessage.remove();

    // 过滤掉系统信息，只保留实际回答内容
    const filteredResponse = filterSystemInfo(response);

    // 如果过滤后内容为空，显示提示信息
    const finalResponse = filteredResponse.trim() || '（代理返回内容为空）';

    // 添加AI回复
    addProjectChatMessage('assistant', finalResponse, agent, roleName);

    // 保存聊天记录
    const chatHistory = JSON.parse(localStorage.getItem(`project_chat_${projectId}`) || '[]');
    chatHistory.push({
      role: 'assistant',
      content: finalResponse,
      agent: agent,
      roleName: roleName,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(`project_chat_${projectId}`, JSON.stringify(chatHistory));
  } catch (error) {
    console.error('发送消息失败:', error);
    addProjectChatMessage('assistant', `错误: ${error.message}`, agent, roleName);
  }
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
    return true;
  });
  
  // 重新组合过滤后的行
  return filteredLines.join('\n');
}

// 多智能体通信框架
function initMultiAgentCommunication() {
  // 初始化代理之间的通信通道
  console.log('多智能体通信框架初始化');
}

// 代理之间的直接通信
async function sendMessageBetweenAgents(projectId, fromAgent, toAgent, message) {
  try {
    // 记录代理之间的通信
    const communicationHistory = JSON.parse(localStorage.getItem(`agent_communication_${projectId}`) || '[]');
    communicationHistory.push({
      from: fromAgent,
      to: toAgent,
      message: message,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(`agent_communication_${projectId}`, JSON.stringify(communicationHistory));
    
    // 显示代理之间的通信消息
    const chatMessages = document.getElementById('project-chat-messages');
    if (chatMessages) {
      const messageContainer = document.createElement('div');
      messageContainer.style.display = 'flex';
      messageContainer.style.flexDirection = 'column';
      messageContainer.style.marginBottom = '15px';
      messageContainer.style.maxWidth = '80%';
      messageContainer.style.alignSelf = 'center';
      
      const sourceLabel = document.createElement('div');
      sourceLabel.style.fontSize = '0.75rem';
      sourceLabel.style.color = '#a9a9a9';
      sourceLabel.style.marginBottom = '4px';
      sourceLabel.style.textAlign = 'center';
      sourceLabel.textContent = `${fromAgent.name} (${fromAgent.role}) → ${toAgent.name} (${toAgent.role})`;
      
      const messageDiv = document.createElement('div');
      messageDiv.style.backgroundColor = '#16213e';
      messageDiv.style.color = '#4cc9f0';
      messageDiv.style.padding = '10px 15px';
      messageDiv.style.borderRadius = '18px';
      messageDiv.style.border = '1px solid #3a0ca3';
      messageDiv.innerHTML = message;
      
      messageContainer.appendChild(sourceLabel);
      messageContainer.appendChild(messageDiv);
      chatMessages.appendChild(messageContainer);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 发送消息到目标代理
    const response = await window.electron.sendMessage({ 
      framework: toAgent.framework, 
      agentId: toAgent.id, 
      message: `来自 ${fromAgent.name} (${fromAgent.role}) 的消息: ${message}` 
    });
    
    // 过滤系统信息
    const filteredResponse = filterSystemInfo(response);
    const finalResponse = filteredResponse.trim() || '（代理返回内容为空）';
    
    // 显示目标代理的回复
    if (document.getElementById('project-chat-messages')) {
      addProjectChatMessage('assistant', finalResponse, toAgent);
    }
    
    // 记录回复
    communicationHistory.push({
      from: toAgent,
      to: fromAgent,
      message: finalResponse,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(`agent_communication_${projectId}`, JSON.stringify(communicationHistory));
    
    return finalResponse;
  } catch (error) {
    console.error('代理之间通信失败:', error);
    return `错误: ${error.message}`;
  }
}

// 共享信息给所有代理
async function shareInfoToAllAgents(projectId, message, sender = null) {
  try {
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !project.roles) {
      return;
    }
    
    // 收集所有代理
    let allAgents = [];
    project.roles.forEach(role => {
      if (role.agents) {
        role.agents.forEach(agent => {
          allAgents.push(agent);
        });
      }
    });
    
    if (allAgents.length === 0) {
      return;
    }
    
    // 记录信息共享
    const shareHistory = JSON.parse(localStorage.getItem(`info_share_${projectId}`) || '[]');
    shareHistory.push({
      sender: sender,
      message: message,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(`info_share_${projectId}`, JSON.stringify(shareHistory));
    
    // 显示信息共享消息
    const chatMessages = document.getElementById('project-chat-messages');
    if (chatMessages) {
      const messageContainer = document.createElement('div');
      messageContainer.style.display = 'flex';
      messageContainer.style.flexDirection = 'column';
      messageContainer.style.marginBottom = '15px';
      messageContainer.style.maxWidth = '80%';
      messageContainer.style.alignSelf = 'center';
      
      const sourceLabel = document.createElement('div');
      sourceLabel.style.fontSize = '0.75rem';
      sourceLabel.style.color = '#a9a9a9';
      sourceLabel.style.marginBottom = '4px';
      sourceLabel.style.textAlign = 'center';
      sourceLabel.textContent = sender ? `${sender.name} (${sender.role}) 共享信息` : '系统共享信息';
      
      const messageDiv = document.createElement('div');
      messageDiv.style.backgroundColor = '#16213e';
      messageDiv.style.color = '#4cc9f0';
      messageDiv.style.padding = '10px 15px';
      messageDiv.style.borderRadius = '18px';
      messageDiv.style.border = '1px solid #4cc9f0';
      messageDiv.innerHTML = message;
      
      messageContainer.appendChild(sourceLabel);
      messageContainer.appendChild(messageDiv);
      chatMessages.appendChild(messageContainer);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 发送给所有代理
    for (const agent of allAgents) {
      await window.electron.sendMessage({ 
        framework: agent.framework, 
        agentId: agent.id, 
        message: `共享信息: ${message}` 
      });
    }
  } catch (error) {
    console.error('共享信息失败:', error);
  }
}

// 多智能体协作决策
async function multiAgentDecision(projectId, topic, agents = []) {
  try {
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return;
    }
    
    // 收集所有代理
    let allAgents = [];
    project.roles.forEach(role => {
      if (role.agents) {
        role.agents.forEach(agent => {
          allAgents.push(agent);
        });
      }
    });
    
    const targetAgents = agents.length > 0 ? agents : allAgents;
    if (targetAgents.length === 0) {
      return;
    }
    
    // 显示决策开始消息
    const chatMessages = document.getElementById('project-chat-messages');
    if (chatMessages) {
      const messageContainer = document.createElement('div');
      messageContainer.style.display = 'flex';
      messageContainer.style.flexDirection = 'column';
      messageContainer.style.marginBottom = '15px';
      messageContainer.style.maxWidth = '80%';
      messageContainer.style.alignSelf = 'center';
      
      const sourceLabel = document.createElement('div');
      sourceLabel.style.fontSize = '0.75rem';
      sourceLabel.style.color = '#a9a9a9';
      sourceLabel.style.marginBottom = '4px';
      sourceLabel.style.textAlign = 'center';
      sourceLabel.textContent = '多智能体协作决策';
      
      const messageDiv = document.createElement('div');
      messageDiv.style.backgroundColor = '#16213e';
      messageDiv.style.color = '#4cc9f0';
      messageDiv.style.padding = '10px 15px';
      messageDiv.style.borderRadius = '18px';
      messageDiv.style.border = '1px solid #3a0ca3';
      messageDiv.textContent = `主题: ${topic}\n参与代理: ${targetAgents.map(a => a.name).join(', ')}`;
      
      messageContainer.appendChild(sourceLabel);
      messageContainer.appendChild(messageDiv);
      chatMessages.appendChild(messageContainer);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 收集每个代理的意见
    const opinions = [];
    for (const agent of targetAgents) {
      const response = await window.electron.sendMessage({ 
        framework: agent.framework, 
        agentId: agent.id, 
        message: `请对以下主题提供你的专业意见:\n主题: ${topic}\n\n请提供详细的分析和建议。` 
      });
      
      const filteredResponse = filterSystemInfo(response);
      const finalResponse = filteredResponse.trim() || '（代理返回内容为空）';
      
      opinions.push({
        agent: agent,
        opinion: finalResponse
      });
      
      // 显示代理的意见
      if (document.getElementById('project-chat-messages')) {
        addProjectChatMessage('assistant', finalResponse, agent);
      }
    }
    
    // 综合所有意见
    const summaryMessage = `请综合以下所有代理的意见，提供一个最终的决策方案:\n\n${opinions.map(o => `${o.agent.name} (${o.agent.role}):\n${o.opinion}\n`).join('\n')}\n\n请提供一个综合的决策方案。`;
    
    // 选择一个主要代理来生成最终决策
    const mainAgent = targetAgents.find(a => a.role.includes('ceo')) || targetAgents[0];
    
    const finalDecision = await window.electron.sendMessage({ 
      framework: mainAgent.framework, 
      agentId: mainAgent.id, 
      message: summaryMessage 
    });
    
    const filteredDecision = filterSystemInfo(finalDecision);
    const finalDecisionText = filteredDecision.trim() || '（代理返回内容为空）';
    
    // 显示最终决策
    if (document.getElementById('project-chat-messages')) {
      const messageContainer = document.createElement('div');
      messageContainer.style.display = 'flex';
      messageContainer.style.flexDirection = 'column';
      messageContainer.style.marginBottom = '15px';
      messageContainer.style.maxWidth = '80%';
      messageContainer.style.alignSelf = 'center';
      
      const sourceLabel = document.createElement('div');
      sourceLabel.style.fontSize = '0.75rem';
      sourceLabel.style.color = '#a9a9a9';
      sourceLabel.style.marginBottom = '4px';
      sourceLabel.style.textAlign = 'center';
      sourceLabel.textContent = `最终决策 (由 ${mainAgent.name} 制定)`;
      
      const messageDiv = document.createElement('div');
      messageDiv.style.backgroundColor = '#16213e';
      messageDiv.style.color = '#4cc9f0';
      messageDiv.style.padding = '10px 15px';
      messageDiv.style.borderRadius = '18px';
      messageDiv.style.border = '2px solid #4cc9f0';
      messageDiv.innerHTML = finalDecisionText;
      
      messageContainer.appendChild(sourceLabel);
      messageContainer.appendChild(messageDiv);
      chatMessages.appendChild(messageContainer);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    return finalDecisionText;
  } catch (error) {
    console.error('多智能体决策失败:', error);
    return `错误: ${error.message}`;
  }
}

// 查看代理通信历史
function viewAgentCommunicationHistory(projectId) {
  try {
    const communicationHistory = JSON.parse(localStorage.getItem(`agent_communication_${projectId}`) || '[]');
    
    if (communicationHistory.length === 0) {
      alert('暂无代理通信记录');
      return;
    }
    
    // 创建模态框显示通信历史
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#16213e';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.maxWidth = '80%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    
    let historyHTML = '<h3 style="color: #4cc9f0; margin-bottom: 20px;">代理通信历史</h3>';
    
    communicationHistory.forEach(comm => {
      historyHTML += `
        <div style="background-color: rgba(58, 12, 163, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p><strong>时间:</strong> ${new Date(comm.timestamp).toLocaleString()}</p>
          <p><strong>发送方:</strong> ${comm.from.name} (${comm.from.role})</p>
          <p><strong>接收方:</strong> ${comm.to.name} (${comm.to.role})</p>
          <p><strong>消息:</strong> ${comm.message}</p>
        </div>
      `;
    });
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #4cc9f0;">代理通信历史</h3>
        <button class="btn btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()">关闭</button>
      </div>
      <div style="color: #a9a9a9;">
        ${historyHTML}
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  } catch (error) {
    console.error('查看通信历史失败:', error);
    alert('查看通信历史失败');
  }
}

// AI数字员工自进化框架
function initAIEvolutionFramework() {
  console.log('AI数字员工自进化框架初始化');
}

// 记录代理经验
async function recordAgentExperience(projectId, agentId, experience) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return;
    }
    
    // 确保项目有agentExperiences属性
    if (!project.agentExperiences) {
      project.agentExperiences = {};
    }
    
    // 确保代理有经验记录
    if (!project.agentExperiences[agentId]) {
      project.agentExperiences[agentId] = {
        agentId: agentId,
        experiences: [],
        skills: {},
        performance: {},
        lastUpdated: new Date().toISOString()
      };
    }
    
    // 添加经验记录
    project.agentExperiences[agentId].experiences.push({
      ...experience,
      timestamp: new Date().toISOString()
    });
    
    // 更新最后更新时间
    project.agentExperiences[agentId].lastUpdated = new Date().toISOString();
    
    // 保存到本地存储
    await saveProjectsData(projects);
    
    // 触发自进化
    triggerAgentEvolution(projectId, agentId);
  } catch (error) {
    console.error('记录代理经验失败:', error);
  }
}

// 触发代理自进化
async function triggerAgentEvolution(projectId, agentId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !project.agentExperiences || !project.agentExperiences[agentId]) {
      return;
    }
    
    const agentExperience = project.agentExperiences[agentId];
    
    // 分析经验数据
    analyzeAgentExperience(agentExperience);
    
    // 更新代理能力
    updateAgentCapabilities(projectId, agentId, agentExperience);
    
    // 保存到本地存储
    await saveProjectsData(projects);
    
    console.log(`${agentId} 代理自进化完成`);
  } catch (error) {
    console.error('触发代理自进化失败:', error);
  }
}

// 分析代理经验
function analyzeAgentExperience(agentExperience) {
  // 分析技能表现
  const skills = {};
  const performance = {};
  
  // 分析每个经验
  agentExperience.experiences.forEach(exp => {
    // 分析任务类型
    if (exp.taskType) {
      if (!performance[exp.taskType]) {
        performance[exp.taskType] = {
          total: 0,
          success: 0,
          failure: 0,
          averageTime: 0,
          totalTime: 0
        };
      }
      
      performance[exp.taskType].total++;
      if (exp.success) {
        performance[exp.taskType].success++;
      } else {
        performance[exp.taskType].failure++;
      }
      
      if (exp.timeTaken) {
        performance[exp.taskType].totalTime += exp.timeTaken;
        performance[exp.taskType].averageTime = performance[exp.taskType].totalTime / performance[exp.taskType].total;
      }
    }
    
    // 分析技能
    if (exp.skills) {
      exp.skills.forEach(skill => {
        if (!skills[skill.name]) {
          skills[skill.name] = {
            level: skill.level || 1,
            usage: 0,
            success: 0
          };
        }
        
        skills[skill.name].usage++;
        if (exp.success) {
          skills[skill.name].success++;
        }
        
        // 更新技能等级
        if (skill.level && skill.level > skills[skill.name].level) {
          skills[skill.name].level = skill.level;
        }
      });
    }
  });
  
  // 更新技能和表现
  agentExperience.skills = skills;
  agentExperience.performance = performance;
}

// 更新代理能力
async function updateAgentCapabilities(projectId, agentId, agentExperience) {
  // 基于经验更新代理能力
  // 这里可以实现更复杂的能力更新逻辑
  
  // 例如：根据表现调整技能等级
  Object.keys(agentExperience.skills).forEach(skillName => {
    const skill = agentExperience.skills[skillName];
    const successRate = skill.usage > 0 ? skill.success / skill.usage : 0;
    
    // 根据成功率调整技能等级
    if (successRate > 0.8) {
      skill.level = Math.min(skill.level + 1, 10); // 最高等级10
    } else if (successRate < 0.3) {
      skill.level = Math.max(skill.level - 1, 1); // 最低等级1
    }
  });
  
  // 记录能力更新
  agentExperience.lastEvolution = new Date().toISOString();
}

// 查看代理进化状态
function viewAgentEvolutionStatus(projectId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !project.agentExperiences) {
      alert('暂无代理进化记录');
      return;
    }
    
    // 创建模态框显示进化状态
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#16213e';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.maxWidth = '80%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    
    let evolutionHTML = '<h3 style="color: #4cc9f0; margin-bottom: 20px;">代理进化状态</h3>';
    
    Object.values(project.agentExperiences).forEach(exp => {
      // 找到对应的代理信息
      let agent = null;
      project.roles.forEach(role => {
        if (role.agents) {
          const foundAgent = role.agents.find(a => a.id === exp.agentId);
          if (foundAgent) {
            agent = { ...foundAgent, role: role.name };
          }
        }
      });
      if (!agent) return;
      
      // 计算总体表现
      const totalExperiences = exp.experiences.length;
      const successfulExperiences = exp.experiences.filter(e => e.success).length;
      const successRate = totalExperiences > 0 ? (successfulExperiences / totalExperiences * 100).toFixed(2) : 0;
      
      evolutionHTML += `
        <div style="background-color: rgba(58, 12, 163, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h4 style="color: #4cc9f0; margin-bottom: 10px;">${agent.name} (${agent.role})</h4>
          <p><strong>经验数量:</strong> ${totalExperiences}</p>
          <p><strong>成功率:</strong> ${successRate}%</p>
          <p><strong>最后进化时间:</strong> ${exp.lastEvolution ? new Date(exp.lastEvolution).toLocaleString() : '未进化'}</p>
          <p><strong>最后更新时间:</strong> ${new Date(exp.lastUpdated).toLocaleString()}</p>
          
          ${Object.keys(exp.skills).length > 0 ? `
            <h5 style="color: #4cc9f0; margin-top: 10px; margin-bottom: 5px;">技能等级:</h5>
            <ul>
              ${Object.entries(exp.skills).map(([skill, data]) => `
                <li>${skill}: ${data.level}/10 (成功率: ${(data.success / data.usage * 100).toFixed(1)}%)</li>
              `).join('')}
            </ul>
          ` : ''}
          
          ${Object.keys(exp.performance).length > 0 ? `
            <h5 style="color: #4cc9f0; margin-top: 10px; margin-bottom: 5px;">任务表现:</h5>
            <ul>
              ${Object.entries(exp.performance).map(([task, data]) => `
                <li>${task}: 成功率 ${(data.success / data.total * 100).toFixed(1)}%, 平均时间 ${data.averageTime.toFixed(2)}s</li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
      `;
    });
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #4cc9f0;">代理进化状态</h3>
        <button class="btn btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()">关闭</button>
      </div>
      <div style="color: #a9a9a9;">
        ${evolutionHTML}
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  } catch (error) {
    console.error('查看代理进化状态失败:', error);
    alert('查看代理进化状态失败');
  }
}

// 手动触发代理进化
async function manuallyTriggerEvolution(projectId) {
  try {
    // 从本地存储加载项目
    const projects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      alert('项目不存在');
      return;
    }
    
    // 为每个代理触发进化
    project.roles.forEach(role => {
      if (role.agents) {
        role.agents.forEach(agent => {
          triggerAgentEvolution(projectId, agent.id);
        });
      }
    });
    
    alert('所有代理进化完成');
  } catch (error) {
    console.error('手动触发代理进化失败:', error);
    alert('手动触发代理进化失败');
  }
}

// 初始化添加代理表单
async function initAddAgentForm() {
  const frameworkSelect = document.getElementById('add-agent-framework');
  const agentSelect = document.getElementById('add-agent-select');
  
  // 框架选择变化事件
  frameworkSelect.addEventListener('change', async (e) => {
    const framework = e.target.value;
    await loadAgentsForSelect(framework, agentSelect);
  });
  
  // 初始加载OpenClaw代理
  await loadAgentsForSelect('openclaw', agentSelect);
}

// 加载代理到选择框
async function loadAgentsForSelect(framework, selectElement) {
  try {
    const agents = await window.electron.getAgents(framework);
    selectElement.innerHTML = '';
    
    agents.forEach(agent => {
      const option = document.createElement('option');
      option.value = agent.id;
      option.textContent = agent.name;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error('加载代理失败:', error);
  }
}

// 暴露函数到全局作用域
window.initProjects = initProjects;
window.loadProjects = loadProjects;
window.saveProject = saveProject;
window.openProject = openProject;
window.editProject = editProject;
window.saveEditProject = saveEditProject;
window.deleteProject = deleteProject;
window.addRoleToProject = addRoleToProject;
window.removeAgentFromRole = removeAgentFromRole;
window.removeRoleFromProject = removeRoleFromProject;
window.editRole = editRole;
window.openProjectChat = openProjectChat;
window.sendProjectChatMessage = sendProjectChatMessage;
window.initAddAgentForm = initAddAgentForm;
