// 任务管理模块
// 负责处理任务的增删改查、执行和定时任务功能

// 任务数据存储键
const TASKS_STORAGE_KEY = 'agentbrother_tasks';

// 任务状态枚举
const TaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// 任务类型枚举
const TaskType = {
  MANUAL: 'manual',
  SCHEDULED: 'scheduled',
  PROJECT: 'project'
};

// 任务优先级枚举
const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// 任务数据结构
class Task {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.name = data.name;
    this.description = data.description || '';
    this.type = data.type || TaskType.MANUAL;
    this.status = data.status || TaskStatus.PENDING;
    this.priority = data.priority || TaskPriority.MEDIUM;
    this.agentId = data.agentId;
    this.agentFramework = data.agentFramework || 'openclaw';
    this.content = data.content;
    this.projectId = data.projectId || null;
    this.scheduleTime = data.scheduleTime || null;
    this.repeatInterval = data.repeatInterval || 'none';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.executedAt = data.executedAt || null;
    this.completedAt = data.completedAt || null;
    this.result = data.result || null;
    this.error = data.error || null;
  }

  generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// 任务管理器
class TaskManager {
  constructor() {
    this.tasks = [];
    this.scheduledTasks = new Map();
    this.currentFilter = 'all';
    // 不要在这里调用init()，因为DOMContentLoaded事件中会调用
  }

  async init() {
    await this.loadTasks();
    this.setupEventListeners();
    this.startScheduledTaskChecker();
  }

  // 加载任务
  async loadTasks() {
    try {
      // 优先从Electron IPC加载任务
      if (window.electron && window.electron.loadTasks) {
        const result = await window.electron.loadTasks();
        if (result.success && result.tasks) {
          this.tasks = result.tasks.map(data => new Task(data));
          console.log('从文件加载任务成功:', this.tasks.length, '个任务');
        } else {
          console.error('从文件加载任务失败:', result.error);
          // 尝试从localStorage加载
          const tasksData = localStorage.getItem(TASKS_STORAGE_KEY);
          if (tasksData) {
            const tasksArray = JSON.parse(tasksData);
            this.tasks = tasksArray.map(data => new Task(data));
            console.log('从localStorage加载任务成功:', this.tasks.length, '个任务');
          } else {
            this.tasks = [];
          }
        }
      } else {
        // 回退到localStorage
        const tasksData = localStorage.getItem(TASKS_STORAGE_KEY);
        if (tasksData) {
          const tasksArray = JSON.parse(tasksData);
          this.tasks = tasksArray.map(data => new Task(data));
          console.log('从localStorage加载任务成功:', this.tasks.length, '个任务');
        } else {
          this.tasks = [];
        }
      }
    } catch (error) {
      console.error('加载任务失败:', error);
      // 尝试从localStorage加载
      try {
        const tasksData = localStorage.getItem(TASKS_STORAGE_KEY);
        if (tasksData) {
          const tasksArray = JSON.parse(tasksData);
          this.tasks = tasksArray.map(data => new Task(data));
          console.log('从localStorage加载任务成功:', this.tasks.length, '个任务');
        } else {
          this.tasks = [];
        }
      } catch (localError) {
        console.error('从localStorage加载任务失败:', localError);
        this.tasks = [];
      }
    }
  }

  // 保存任务
  async saveTasks() {
    try {
      // 优先使用Electron IPC保存任务
      if (window.electron && window.electron.saveTasks) {
        const result = await window.electron.saveTasks(this.tasks);
        if (result.success) {
          console.log('任务数据已保存到文件');
        } else {
          console.error('保存任务数据到文件失败:', result.error);
        }
      } else {
        console.log('Electron saveTasks不可用');
      }
      
      // 无论文件保存是否成功，都保存到localStorage作为备份
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks));
        console.log('任务数据已保存到localStorage');
      } catch (localError) {
        console.error('保存任务到localStorage失败:', localError);
      }
    } catch (error) {
      console.error('保存任务失败:', error);
      // 回退到localStorage
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks));
        console.log('任务数据已保存到localStorage');
      } catch (localError) {
        console.error('保存任务到localStorage失败:', localError);
      }
    }
  }

  // 添加任务
  async addTask(taskData) {
    const task = new Task(taskData);
    this.tasks.push(task);
    await this.saveTasks();
    
    // 如果是定时任务，设置定时器
    if (task.type === TaskType.SCHEDULED && task.scheduleTime) {
      this.scheduleTask(task);
    }
    
    // 触发任务添加完成事件
    if (this.onTaskAdded) {
      this.onTaskAdded();
    }
    
    return task;
  }

  // 更新任务
  async updateTask(taskId, updateData) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      await this.saveTasks();
      
      // 触发任务更新回调，刷新项目任务列表
      if (this.onTaskUpdated) {
        this.onTaskUpdated(this.tasks[index]);
      }
      
      return this.tasks[index];
    }
    return null;
  }

  // 删除任务
  async deleteTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const task = this.tasks[index];
      
      // 取消定时任务
      if (this.scheduledTasks.has(taskId)) {
        clearTimeout(this.scheduledTasks.get(taskId));
        this.scheduledTasks.delete(taskId);
      }
      
      this.tasks.splice(index, 1);
      await this.saveTasks();
      return true;
    }
    return false;
  }

  // 获取任务
  getTask(taskId) {
    return this.tasks.find(t => t.id === taskId);
  }

  // 获取所有任务
  getAllTasks() {
    return this.tasks;
  }

  // 根据状态筛选任务
  getTasksByStatus(status) {
    return this.tasks.filter(t => t.status === status);
  }

  // 根据项目筛选任务
  getTasksByProject(projectId) {
    return this.tasks.filter(t => t.projectId === projectId);
  }

  // 设置定时任务
  scheduleTask(task) {
    const scheduleTime = new Date(task.scheduleTime);
    const now = new Date();
    
    if (scheduleTime <= now) {
      // 立即执行
      this.executeTask(task.id);
      return;
    }
    
    const delay = scheduleTime.getTime() - now.getTime();
    const timeoutId = setTimeout(async () => {
      await this.executeTask(task.id);
      
      // 处理重复任务
      if (task.repeatInterval !== 'none') {
        await this.rescheduleTask(task);
      }
    }, delay);
    
    this.scheduledTasks.set(task.id, timeoutId);
  }

  // 重新调度重复任务
  async rescheduleTask(task) {
    let nextScheduleTime = new Date(task.scheduleTime);
    
    switch (task.repeatInterval) {
      case 'daily':
        nextScheduleTime.setDate(nextScheduleTime.getDate() + 1);
        break;
      case 'weekly':
        nextScheduleTime.setDate(nextScheduleTime.getDate() + 7);
        break;
      case 'monthly':
        nextScheduleTime.setMonth(nextScheduleTime.getMonth() + 1);
        break;
    }
    
    const updatedTask = await this.updateTask(task.id, {
      scheduleTime: nextScheduleTime.toISOString(),
      status: TaskStatus.PENDING
    });
    
    if (updatedTask) {
      this.scheduleTask(updatedTask);
    }
  }

  // 执行任务
  async executeTask(taskId) {
    const task = this.getTask(taskId);
    if (!task) {
      console.error('任务不存在:', taskId);
      return;
    }

    // 更新任务状态为执行中
    await this.updateTask(taskId, {
      status: TaskStatus.RUNNING,
      executedAt: new Date().toISOString()
    });

    // 重新渲染任务列表，显示加载状态
    this.renderTasks();

    try {
      // 使用Electron IPC执行任务
      if (window.electron) {
        const result = await window.electron.executeTask({
          framework: task.agentFramework,
          agentId: task.agentId,
          content: task.content
        });

        if (result.success) {
          // 更新任务状态为已完成
          await this.updateTask(taskId, {
            status: TaskStatus.COMPLETED,
            completedAt: new Date().toISOString(),
            result: result.result
          });
        } else {
          throw new Error(result.error || '任务执行失败');
        }
      } else {
        throw new Error('Electron API不可用');
      }
    } catch (error) {
      console.error('任务执行失败:', error);
      
      // 更新任务状态为失败
      await this.updateTask(taskId, {
        status: TaskStatus.FAILED,
        error: error.message
      });
    } finally {
      // 重新渲染任务列表，更新状态
      this.renderTasks();
    }
  }

  // 取消任务
  async cancelTask(taskId) {
    const task = this.getTask(taskId);
    if (!task) {
      return false;
    }

    // 取消定时任务
    if (this.scheduledTasks.has(taskId)) {
      clearTimeout(this.scheduledTasks.get(taskId));
      this.scheduledTasks.delete(taskId);
    }

    // 更新任务状态
    await this.updateTask(taskId, {
      status: TaskStatus.CANCELLED
    });

    return true;
  }

  // 启动定时任务检查器
  startScheduledTaskChecker() {
    // 每分钟检查一次定时任务
    setInterval(async () => {
      try {
        await this.checkScheduledTasks();
      } catch (error) {
        console.error('检查定时任务失败:', error);
      }
    }, 60000);
  }

  // 检查定时任务
  async checkScheduledTasks() {
    const now = new Date();
    
    for (const task of this.tasks) {
      if (task.type === TaskType.SCHEDULED && 
          task.status === TaskStatus.PENDING && 
          task.scheduleTime) {
        
        const scheduleTime = new Date(task.scheduleTime);
        if (scheduleTime <= now) {
          await this.executeTask(task.id);
        }
      }
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    // 添加任务按钮
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.openTaskModal());
    }

    // 刷新任务按钮
    const refreshTasksBtn = document.getElementById('refresh-tasks-btn');
    if (refreshTasksBtn) {
      refreshTasksBtn.addEventListener('click', () => this.renderTasks());
    }

    // 关闭任务模态框
    const closeTaskModal = document.getElementById('close-task-modal');
    if (closeTaskModal) {
      closeTaskModal.addEventListener('click', () => this.closeTaskModal());
    }

    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    if (cancelTaskBtn) {
      cancelTaskBtn.addEventListener('click', () => this.closeTaskModal());
    }

    // 任务表单提交
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => this.handleTaskSave(e));
    }

    // 任务类型选择
    const taskTypeInput = document.getElementById('task-type-input');
    if (taskTypeInput) {
      taskTypeInput.addEventListener('change', (e) => this.handleTaskTypeChange(e));
    }

    // 筛选按钮
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilterChange(e));
    });

    // 监听任务执行更新事件
    if (window.electron && window.electron.onTaskExecutionUpdate) {
      window.electron.onTaskExecutionUpdate((data) => {
        this.handleTaskExecutionUpdate(data);
      });
    }
  }

  // 打开任务模态框
  openTaskModal(taskData = null) {
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('task-modal-title');
    const taskIdHidden = document.getElementById('task-id-hidden');
    const projectSelect = document.getElementById('task-project-select');
    
    if (taskData) {
      modalTitle.textContent = '编辑任务';
      taskIdHidden.value = taskData.id;
      
      // 填充表单数据
      document.getElementById('task-name-input').value = taskData.name;
      document.getElementById('task-description-input').value = taskData.description || '';
      document.getElementById('task-type-input').value = taskData.type;
      document.getElementById('task-agent-select').value = taskData.agentId;
      document.getElementById('task-content-input').value = taskData.content || '';
      document.getElementById('task-priority-input').value = taskData.priority;
      
      // 如果是从项目页面创建的任务，禁用任务类型选择器，只能选择项目任务
      const taskTypeInput = document.getElementById('task-type-input');
      if (taskData.projectId) {
        taskTypeInput.disabled = true;
        taskTypeInput.style.opacity = '0.7';
      }
      
      if (taskData.type === TaskType.SCHEDULED) {
        document.getElementById('task-schedule-time').value = taskData.scheduleTime ? 
          new Date(taskData.scheduleTime).toISOString().slice(0, 16) : '';
        document.getElementById('task-repeat-interval').value = taskData.repeatInterval || 'none';
      }
      
      if (taskData.type === TaskType.PROJECT) {
        // 先设置项目ID（确保即使项目列表加载失败也能保存）
        const projectIdValue = taskData.projectId || '';
        
        // 加载项目列表
        this.loadProjectSelect();
        
        // 设置项目ID
        document.getElementById('task-project-select').value = projectIdValue;
        
        // 如果是从项目页面创建的任务，禁用项目选择器
        if (taskData.projectId) {
          projectSelect.disabled = true;
          projectSelect.style.opacity = '0.7';
          
          // 只显示当前项目
          try {
            const projects = JSON.parse(localStorage.getItem('agentbrother_projects') || '[]');
            const currentProject = projects.find(p => p.id === taskData.projectId);
            if (currentProject) {
              projectSelect.innerHTML = '';
              const option = document.createElement('option');
              option.value = currentProject.id;
              option.textContent = currentProject.name;
              projectSelect.appendChild(option);
              // 再次设置项目ID，确保选择正确
              projectSelect.value = currentProject.id;
            }
          } catch (error) {
            console.error('加载项目失败:', error);
          }
        }
      }
    } else {
      modalTitle.textContent = '添加任务';
      taskIdHidden.value = '';
      
      // 重置表单
      document.getElementById('task-form').reset();
      
      // 启用项目选择器
      if (projectSelect) {
        projectSelect.disabled = false;
        projectSelect.style.opacity = '1';
      }
    }
    
    // 触发任务类型选择事件
    document.getElementById('task-type-input').dispatchEvent(new Event('change'));
    
    // 加载代理列表
    this.loadAgentSelect();
    
    // 只有在不是从项目页面创建任务时才加载项目列表
    if (!taskData || !taskData.projectId) {
      this.loadProjectSelect();
    }
    
    modal.style.display = 'flex';
  }

  // 关闭任务模态框
  closeTaskModal() {
    const modal = document.getElementById('task-modal');
    modal.style.display = 'none';
  }

  // 处理任务保存
  async handleTaskSave(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('task-id-hidden').value;
    const taskName = document.getElementById('task-name-input').value;
    const taskDescription = document.getElementById('task-description-input').value;
    const taskType = document.getElementById('task-type-input').value;
    const taskAgentId = document.getElementById('task-agent-select').value;
    const taskContent = document.getElementById('task-content-input').value;
    const taskPriority = document.getElementById('task-priority-input').value;
    
    let taskData = {
      name: taskName,
      description: taskDescription,
      type: taskType,
      agentId: taskAgentId,
      content: taskContent,
      priority: taskPriority
    };
    
    // 根据任务类型添加特定字段
    if (taskType === TaskType.SCHEDULED) {
      const scheduleTime = document.getElementById('task-schedule-time').value;
      const repeatInterval = document.getElementById('task-repeat-interval').value;
      
      taskData.scheduleTime = scheduleTime ? new Date(scheduleTime).toISOString() : null;
      taskData.repeatInterval = repeatInterval;
    }
    
    // 获取项目ID（从项目页面创建的任务，默认关联当前项目）
    const projectSelect = document.getElementById('task-project-select');
    let projectId = projectSelect ? projectSelect.value : null;
    
    // 如果项目选择器被禁用（从项目页面创建），检查选项
    if (projectSelect && !projectId && projectSelect.disabled && projectSelect.options.length > 0) {
      projectId = projectSelect.options[0].value;
    }
    
    // 如果有projectId，说明是从项目页面创建的任务，关联该项目
    if (projectId) {
      taskData.projectId = projectId;
    }
    
    if (taskType === TaskType.PROJECT && !projectId) {
      alert('请选择项目');
      return;
    }
    
    // 获取代理框架
    const agentSelect = document.getElementById('task-agent-select');
    const selectedOption = agentSelect.options[agentSelect.selectedIndex];
    taskData.agentFramework = selectedOption?.dataset?.framework || 'openclaw';
    
    // 判断是更新还是添加任务 - 修复：检查taskId是否是有效的ID
    const isUpdate = taskId && taskId.trim() !== '' && taskId !== 'undefined';
    
    try {
      if (isUpdate) {
        await this.updateTask(taskId, taskData);
        alert('任务更新成功！');
      } else {
        await this.addTask(taskData);
        alert('任务添加成功！');
      }
      
      this.closeTaskModal();
      this.renderTasks();
    } catch (error) {
      alert('保存任务失败: ' + error.message);
    }
  }

  // 处理任务类型变更
  handleTaskTypeChange(e) {
    const taskType = e.target.value;
    const scheduledConfig = document.getElementById('scheduled-task-config');
    const projectConfig = document.getElementById('project-task-config');
    
    // 隐藏所有特定配置
    scheduledConfig.style.display = 'none';
    projectConfig.style.display = 'none';
    
    // 根据任务类型显示相应配置
    if (taskType === TaskType.SCHEDULED) {
      scheduledConfig.style.display = 'block';
    } else if (taskType === TaskType.PROJECT) {
      projectConfig.style.display = 'block';
    }
  }

  // 处理筛选变更
  handleFilterChange(e) {
    const filter = e.target.dataset.filter;
    this.currentFilter = filter;
    
    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // 重新渲染任务列表
    this.renderTasks();
  }

  // 加载代理选择器
  async loadAgentSelect() {
    const agentSelect = document.getElementById('task-agent-select');
    if (!agentSelect) return;
    
    agentSelect.innerHTML = '<option value="">选择代理...</option>';
    
    try {
      // 加载OpenClaw代理
      if (window.electron) {
        const openclawAgents = await window.electron.getAgents('openclaw');
        if (openclawAgents && Array.isArray(openclawAgents)) {
          openclawAgents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent.id;
            option.textContent = `${agent.name} (OpenClaw)`;
            option.dataset.framework = 'openclaw';
            agentSelect.appendChild(option);
          });
        }
        
        // 加载ZeroClaw代理
        const zeroclawAgents = await window.electron.getAgents('zeroclaw');
        if (zeroclawAgents && Array.isArray(zeroclawAgents)) {
          zeroclawAgents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent.id;
            option.textContent = `${agent.name} (ZeroClaw)`;
            option.dataset.framework = 'zeroclaw';
            agentSelect.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error('加载代理列表失败:', error);
    }
  }

  // 处理任务执行更新
  async handleTaskExecutionUpdate(data) {
    const { taskId, output, status } = data;
    if (!taskId) return;

    // 获取任务
    const task = this.getTask(taskId);
    if (!task) return;

    // 更新任务的实时输出
    if (!task.executionOutput) {
      task.executionOutput = '';
    }
    task.executionOutput += output;

    // 保存任务状态
    await this.saveTasks();

    // 重新渲染任务列表，显示实时输出
    this.renderTasks();
  }

  // 加载项目选择器
  loadProjectSelect() {
    const projectSelect = document.getElementById('task-project-select');
    if (!projectSelect) return;
    
    projectSelect.innerHTML = '<option value="">选择项目...</option>';
    
    try {
      const projects = JSON.parse(localStorage.getItem('agentbrother_projects') || '[]');
      projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
      });
    } catch (error) {
      console.error('加载项目列表失败:', error);
    }
  }

  // 渲染任务列表
  renderTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;
    
    // 根据当前筛选条件获取任务
    let filteredTasks = this.tasks;
    if (this.currentFilter !== 'all') {
      filteredTasks = this.tasks.filter(t => t.status === this.currentFilter);
    }
    
    // 按创建时间倒序排列
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (filteredTasks.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #a9a9a9; padding: 40px;">
          <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px;"></i>
          <p>暂无任务</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = filteredTasks.map(task => this.renderTaskCard(task)).join('');
  }

  // 渲染任务卡片
  renderTaskCard(task) {
    const statusColors = {
      [TaskStatus.PENDING]: '#f39c12',
      [TaskStatus.RUNNING]: '#3498db',
      [TaskStatus.COMPLETED]: '#2ecc71',
      [TaskStatus.FAILED]: '#e74c3c',
      [TaskStatus.CANCELLED]: '#95a5a6'
    };
    
    const statusTexts = {
      [TaskStatus.PENDING]: '待执行',
      [TaskStatus.RUNNING]: '执行中',
      [TaskStatus.COMPLETED]: '已完成',
      [TaskStatus.FAILED]: '失败',
      [TaskStatus.CANCELLED]: '已取消'
    };
    
    const priorityColors = {
      [TaskPriority.LOW]: '#95a5a6',
      [TaskPriority.MEDIUM]: '#f39c12',
      [TaskPriority.HIGH]: '#e67e22',
      [TaskPriority.URGENT]: '#e74c3c'
    };
    
    const priorityTexts = {
      [TaskPriority.LOW]: '低',
      [TaskPriority.MEDIUM]: '中',
      [TaskPriority.HIGH]: '高',
      [TaskPriority.URGENT]: '紧急'
    };
    
    const typeTexts = {
      [TaskType.MANUAL]: '手动任务',
      [TaskType.SCHEDULED]: '定时任务',
      [TaskType.PROJECT]: '项目任务'
    };
    
    const statusColor = statusColors[task.status] || '#95a5a6';
    const statusText = statusTexts[task.status] || '未知';
    const priorityColor = priorityColors[task.priority] || '#95a5a6';
    const priorityText = priorityTexts[task.priority] || '中';
    const typeText = typeTexts[task.type] || '未知';
    
    return `
      <div class="task-card" style="background-color: #16213e; border-radius: 10px; padding: 20px; border: 1px solid #3a0ca3;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
          <div>
            <h4 style="color: #4cc9f0; margin: 0 0 5px 0;">${task.name}</h4>
            <span style="background-color: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${statusText}</span>
            <span style="background-color: ${priorityColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 5px;">${priorityText}</span>
          </div>
          <div style="display: flex; gap: 5px;">
            ${task.status === TaskStatus.PENDING ? `
              <button onclick="(async () => { await taskManager.executeTask('${task.id}'); taskManager.renderTasks(); })()" style="background-color: #2ecc71; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" title="执行任务">
                <i class="fas fa-play"></i>
              </button>
            ` : ''}
            ${task.status === TaskStatus.RUNNING ? `
              <button onclick="(async () => { await taskManager.cancelTask('${task.id}'); taskManager.renderTasks(); })()" style="background-color: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" title="取消任务">
                <i class="fas fa-stop"></i>
              </button>
              <div style="display: flex; align-items: center; padding: 5px 10px; color: #3498db;">
                <i class="fas fa-spinner fa-spin"></i> 执行中...
              </div>
            ` : ''}
            <button onclick="taskManager.openTaskModal(taskManager.getTask('${task.id}'))" style="background-color: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" title="编辑任务">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="(async () => { if (confirm('确定要删除这个任务吗？')) { await taskManager.deleteTask('${task.id}'); taskManager.renderTasks(); } })()" style="background-color: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" title="删除任务">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p style="color: #a9a9a9; margin: 0 0 5px 0; font-size: 0.9rem;">
            <i class="fas fa-clock"></i> 创建时间: ${new Date(task.createdAt).toLocaleString()}
          </p>
          <p style="color: #a9a9a9; margin: 0; font-size: 0.9rem;">
            <i class="fas fa-tag"></i> 类型: ${typeText}
          </p>
          ${task.scheduleTime ? `
            <p style="color: #a9a9a9; margin: 5px 0; font-size: 0.9rem;">
              <i class="fas fa-calendar"></i> 执行时间: ${new Date(task.scheduleTime).toLocaleString()}
            </p>
          ` : ''}
          ${task.projectId ? `
            <p style="color: #a9a9a9; margin: 5px 0; font-size: 0.9rem;">
              <i class="fas fa-folder"></i> 关联项目: ${this.getProjectName(task.projectId)}
            </p>
          ` : ''}
        </div>
        
        ${task.description ? `
          <div style="margin-bottom: 15px;">
            <p style="color: #a9b1d6; margin: 0;">${task.description}</p>
          </div>
        ` : ''}
        
        ${task.content ? `
          <div style="margin-bottom: 15px;">
            <p style="color: #a9b1d6; margin: 0; font-size: 0.9rem;">
              <strong>任务内容:</strong> ${task.content.substring(0, 100)}${task.content.length > 100 ? '...' : ''}
            </p>
          </div>
        ` : ''}
        
        ${task.executionOutput ? `
          <div style="margin-bottom: 15px; background-color: #0f3460; padding: 10px; border-radius: 6px; max-height: 100px; overflow-y: auto;">
            <p style="color: #a9b1d6; margin: 0; font-size: 0.9rem; white-space: pre-wrap;">
              <strong>执行输出:</strong> ${task.executionOutput}
            </p>
          </div>
        ` : ''}
        
        ${task.result ? `
          <div style="margin-bottom: 15px; background-color: #0f3460; padding: 10px; border-radius: 6px; max-height: 150px; overflow-y: auto;">
            <p style="color: #a9b1d6; margin: 0; font-size: 0.9rem; white-space: pre-wrap;">
              <strong>执行结果:</strong> ${typeof task.result === 'string' ? task.result : JSON.stringify(task.result, null, 2)}
            </p>
          </div>
        ` : ''}
        
        ${task.error ? `
          <div style="margin-bottom: 15px; background-color: #3a0ca3; padding: 10px; border-radius: 6px; max-height: 100px; overflow-y: auto;">
            <p style="color: #e74c3c; margin: 0; font-size: 0.9rem; white-space: pre-wrap;">
              <strong>错误信息:</strong> ${task.error}
            </p>
          </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #3a0ca3;">
          <div style="color: #a9a9a9; font-size: 0.9rem;">
            <i class="fas fa-robot"></i> 代理: ${task.agentId}
          </div>
          ${task.completedAt ? `
            <div style="color: #2ecc71; font-size: 0.9rem;">
              <i class="fas fa-check-circle"></i> 完成时间: ${new Date(task.completedAt).toLocaleString()}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 获取项目名称
  getProjectName(projectId) {
    try {
      const projects = JSON.parse(localStorage.getItem('agentbrother_projects') || '[]');
      const project = projects.find(p => p.id === projectId);
      return project ? project.name : '未知项目';
    } catch (error) {
      return '未知项目';
    }
  }
}

// 创建全局任务管理器实例
const taskManager = new TaskManager();

// 导出给全局使用
window.taskManager = taskManager;
window.TaskStatus = TaskStatus;
window.TaskType = TaskType;
window.TaskPriority = TaskPriority;

// 页面加载完成后初始化任务管理器
window.addEventListener('DOMContentLoaded', async () => {
  // 初始化任务管理器
  await taskManager.init();
  
  // 检查是否在任务页面
  const tasksPage = document.getElementById('tasks-page');
  if (tasksPage) {
    taskManager.renderTasks();
  }
});
