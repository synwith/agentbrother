// 代理管理模块
// 负责处理代理的增删改查功能

// 代理模态框控制
const agentModal = document.getElementById('agent-modal');
const agentForm = document.getElementById('agent-form');
const agentFrameworkSelect = document.getElementById('agent-framework-select');
const openclawSpecific = document.getElementById('openclaw-specific');
const zeroclawSpecific = document.getElementById('zeroclaw-specific');

// 初始化代理管理模块
function initAgents() {
  // 框架选择事件
  agentFrameworkSelect.addEventListener('change', function() {
    const selectedFramework = this.value;
    
    if (selectedFramework === 'openclaw') {
      openclawSpecific.style.display = 'block';
      zeroclawSpecific.style.display = 'none';
    } else if (selectedFramework === 'zeroclaw') {
      openclawSpecific.style.display = 'none';
      zeroclawSpecific.style.display = 'block';
    }
    
    // 更新配置预览
    updateAgentConfigPreview();
  });
  
  // 为表单字段添加事件监听器，实时更新配置预览
  const formFields = [
    'agent-id-input',
    'agent-name-input',
    'agent-model-input',
    'agent-zeroclaw-model-input',
    'agent-prompt-input'
  ];
  
  formFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', updateAgentConfigPreview);
    }
  });
  
  // 为技能复选框添加事件监听器
  document.querySelectorAll('input[name="skills"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateAgentConfigPreview);
  });
  
  // 绑定关闭按钮事件
  document.getElementById('close-agent-modal').addEventListener('click', closeAgentModal);
  document.getElementById('cancel-agent-btn').addEventListener('click', closeAgentModal);
  
  // 点击模态框外部关闭
  agentModal.addEventListener('click', (e) => {
    if (e.target === agentModal) {
      closeAgentModal();
    }
  });
  
  // 添加代理按钮
  document.getElementById('add-agent-btn').addEventListener('click', () => {
    openAgentModal();
  });
  
  // 刷新代理列表
  document.getElementById('refresh-agents-btn').addEventListener('click', loadAgents);
  
  // 保存代理表单提交
  agentForm.addEventListener('submit', handleAgentSave);
  
  // 加载代理列表
  loadAgents();
}

// 加载代理配置
function loadAgentConfig() {
  try {
    return JSON.parse(localStorage.getItem('agentConfigs') || '{}');
  } catch (error) {
    console.error('加载代理配置失败:', error);
    return {};
  }
}

// 保存代理配置
function saveAgentConfig(configs) {
  try {
    localStorage.setItem('agentConfigs', JSON.stringify(configs));
  } catch (error) {
    console.error('保存代理配置失败:', error);
  }
}

// 获取代理显示信息（包含自定义icon和简称）
function getAgentDisplayInfo(agentId, agentName, framework) {
  const configs = loadAgentConfig();
  const config = configs[agentId] || {};
  
  // 默认icon
  const defaultIcons = {
    'main': framework === 'zeroclaw' ? '🦀' : '🦞',
    'film-director': '🎬',
    'video-editor': '✂️',
    'media-creator': '🎨'
  };
  
  return {
    icon: config.icon || defaultIcons[agentId] || '🦞',
    shortName: config.shortName || agentName
  };
}

// 加载代理列表
async function loadAgents() {
  try {
    const openclawAgents = await window.electron.getAgents('openclaw');
    const zeroclawAgents = await window.electron.getAgents('zeroclaw');
    const tableBody = document.getElementById('agents-table-body');
    
    tableBody.innerHTML = '';
    
    // 添加OpenClaw代理
    for (const agent of openclawAgents) {
      const displayInfo = getAgentDisplayInfo(agent.id, agent.name, 'openclaw');
      
      // 直接使用从后端返回的模型信息
      const modelName = agent.model || '';
      
      // 获取skills信息
      const skills = agent.skills || [];
      const skillsHtml = skills.length > 0 
        ? skills.map(skill => `<span class="skill-tag" onclick="showAgentSkills('${agent.id}', '${agent.name}', '${skills.join(',')}')" style="cursor: pointer; background-color: #3a0ca3; color: #4cc9f0; padding: 2px 6px; border-radius: 4px; margin-right: 4px; font-size: 0.75rem;">${skill}</span>`).join('')
        : '<span style="color: #666; font-size: 0.75rem;">无</span>';
      
      // 主代理不能删除
      const deleteButtonDisabled = agent.id === 'main' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-size: 1.5rem; text-align: center;">${displayInfo.icon}</td>
        <td>${displayInfo.shortName}</td>
        <td>聊天</td>
        <td>OpenClaw</td>
        <td>${modelName}</td>
        <td>${skillsHtml}</td>
        <td><span class="status-indicator status-active"></span> 活跃</td>
        <td>
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="editAgentFull('${agent.id}', '${displayInfo.shortName}', 'openclaw')">编辑</button>
          <button class="btn btn-secondary" ${deleteButtonDisabled} style="padding: 4px 8px; font-size: 0.8rem; margin-left: 5px;" onclick="deleteAgent('${agent.id}', 'openclaw')">删除</button>
        </td>
      `;
      tableBody.appendChild(row);
    }
    
    // 添加ZeroClaw代理
    for (const agent of zeroclawAgents) {
      const displayInfo = getAgentDisplayInfo(agent.id, agent.name, 'zeroclaw');
      
      // 直接使用从后端返回的模型信息
      const modelName = agent.model || 'deepseek-chat';
      
      // ZeroClaw代理暂时不显示skills
      const skillsHtml = '<span style="color: #666; font-size: 0.75rem;">-</span>';
      
      // 主代理不能删除
      const deleteButtonDisabled = agent.id === 'main' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-size: 1.5rem; text-align: center;">${displayInfo.icon}</td>
        <td>${displayInfo.shortName}</td>
        <td>聊天</td>
        <td>ZeroClaw</td>
        <td>${modelName}</td>
        <td>${skillsHtml}</td>
        <td><span class="status-indicator status-active"></span> 活跃</td>
        <td>
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="editAgentFull('${agent.id}', '${displayInfo.shortName}', 'zeroclaw')">编辑</button>
          <button class="btn btn-secondary" ${deleteButtonDisabled} style="padding: 4px 8px; font-size: 0.8rem; margin-left: 5px;" onclick="deleteAgent('${agent.id}', 'zeroclaw')">删除</button>
        </td>
      `;
      tableBody.appendChild(row);
    }
  } catch (error) {
    console.error('加载代理列表失败:', error);
    const tableBody = document.getElementById('agents-table-body');
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: #f72585;">
          加载代理列表失败: ${error.message}
        </td>
      </tr>
    `;
  }
}

// 显示代理的所有技能
window.showAgentSkills = function(agentId, agentName, skillsStr) {
  const skills = skillsStr ? skillsStr.split(',') : [];
  
  if (skills.length === 0) {
    alert(`代理 "${agentName}" 没有配置技能`);
    return;
  }
  
  // 创建技能列表的HTML
  const skillsHtml = skills.map(skill => `
    <div style="background-color: #3a0ca3; color: #4cc9f0; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-size: 0.9rem;">
      <i class="fas fa-bolt" style="margin-right: 8px;"></i>${skill}
    </div>
  `).join('');
  
  // 创建模态框
  const modal = document.createElement('div');
  modal.id = 'skills-modal';
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
    <div style="background-color: #16213e; border-radius: 10px; padding: 30px; width: 90%; max-width: 400px; max-height: 80vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #4cc9f0; margin: 0;">
          <i class="fas fa-robot" style="margin-right: 10px;"></i>${agentName} 的技能
        </h3>
        <button onclick="closeSkillsModal()" style="background: none; border: none; color: #a9a9a9; font-size: 1.5rem; cursor: pointer;">&times;</button>
      </div>
      <div style="margin-bottom: 20px;">
        <p style="color: #a9a9a9; margin-bottom: 15px; font-size: 0.9rem;">该代理拥有以下技能：</p>
        ${skillsHtml}
      </div>
      <div style="text-align: right;">
        <button onclick="closeSkillsModal()" class="btn btn-secondary" style="padding: 8px 16px;">关闭</button>
      </div>
    </div>
  `;
  
  // 点击模态框外部关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeSkillsModal();
    }
  });
  
  document.body.appendChild(modal);
};

// 关闭技能模态框
window.closeSkillsModal = function() {
  const modal = document.getElementById('skills-modal');
  if (modal) {
    modal.remove();
  }
};

// 编辑代理（完整编辑）
window.editAgentFull = async function(agentId, agentName, framework) {
  try {
    // 获取代理详细信息
    let agentData;
    if (window.electron) {
      agentData = await window.electron.getAgentDetail(agentId, framework);
    } else {
      // 从本地存储获取
      const customAgents = JSON.parse(localStorage.getItem('customAgents') || '[]');
      agentData = customAgents.find(a => a.id === agentId);
    }
    
    if (agentData) {
      // 从本地配置加载icon和name
      const configs = loadAgentConfig();
      const localConfig = configs[agentId] || {};
      
      // 合并本地配置到代理数据
      agentData.name = localConfig.name || agentName;
      agentData.icon = localConfig.icon || '';
      agentData.framework = framework;
      
      openAgentModal(agentData);
    } else {
      alert('无法获取代理详细信息');
    }
  } catch (error) {
    console.error('获取代理详情失败:', error);
    alert('获取代理详情失败: ' + error.message);
  }
};

// 删除代理
window.deleteAgent = async function(agentId, framework) {
  // 主代理不能删除
  if (agentId === 'main') {
    alert('主代理不能删除！');
    return;
  }
  
  if (!confirm(`确定要删除代理 "${agentId}" 吗？`)) {
    return;
  }
  
  try {
    if (window.electron) {
      const result = await window.electron.deleteAgent(agentId, framework);
      
      if (result.success) {
        alert('代理删除成功！');
        await loadAgents();
      } else {
        alert('删除失败: ' + (result.error || '未知错误'));
      }
    } else {
      // 本地存储模式（Web端）
      const agents = JSON.parse(localStorage.getItem('customAgents') || '[]');
      const filteredAgents = agents.filter(a => a.id !== agentId);
      localStorage.setItem('customAgents', JSON.stringify(filteredAgents));
      alert('代理删除成功！(本地模式)');
      await loadAgents();
    }
  } catch (error) {
    console.error('删除代理失败:', error);
    alert('删除失败: ' + error.message);
  }
};

// 打开添加代理模态框
function openAgentModal(agentData = null) {
  const modalTitle = document.getElementById('agent-modal-title');
  const agentIdInput = document.getElementById('agent-id-input');
  const agentIdHidden = document.getElementById('agent-id-hidden');
  const rawConfigTextarea = document.getElementById('agent-raw-config');
  const frameworkSelect = document.getElementById('agent-framework-select');
  
  if (agentData) {
    modalTitle.textContent = '编辑代理';
    agentIdHidden.value = agentData.id;
    agentIdInput.value = agentData.id;
    agentIdInput.disabled = true;
    document.getElementById('agent-name-input').value = agentData.name || '';
    // 为main代理设置默认图标
    const framework = agentData.framework || 'openclaw';
    let iconValue = agentData.icon || '';
    if (!iconValue && agentData.id === 'main') {
      iconValue = framework === 'zeroclaw' ? '🦀' : '🦞';
    }
    document.getElementById('agent-icon-input').value = iconValue;
    // 存储原始框架，用于检测框架变更
    agentIdHidden.dataset.originalFramework = framework;
    frameworkSelect.value = framework;
    
    // 根据框架设置模型值
    if (agentData.framework === 'openclaw') {
      document.getElementById('agent-model-input').value = agentData.model || '';
      document.getElementById('agent-zeroclaw-model-input').value = '';
    } else if (agentData.framework === 'zeroclaw') {
      document.getElementById('agent-zeroclaw-model-input').value = agentData.model || '';
      document.getElementById('agent-model-input').value = '';
    }
    
    document.getElementById('agent-prompt-input').value = agentData.prompt || '';
    document.getElementById('agent-config-input').value = agentData.config ? JSON.stringify(agentData.config, null, 2) : '';
    
    // 显示原始配置
    if (agentData.rawConfig) {
      rawConfigTextarea.value = JSON.stringify(agentData.rawConfig, null, 2);
    } else {
      rawConfigTextarea.value = '';
    }
    
    // 设置技能选中状态
    const skillCheckboxes = document.querySelectorAll('input[name="skills"]');
    skillCheckboxes.forEach(cb => {
      cb.checked = agentData.skills && agentData.skills.includes(cb.value);
    });
  } else {
    modalTitle.textContent = '添加代理';
    agentIdHidden.value = '';
    agentIdHidden.dataset.originalFramework = '';
    agentIdInput.value = '';
    agentIdInput.disabled = false;
    agentForm.reset();
    rawConfigTextarea.value = '';
    
    // 重置模型输入框
    document.getElementById('agent-model-input').value = '';
    document.getElementById('agent-zeroclaw-model-input').value = '';
    
    // 重置技能选中状态
    const skillCheckboxes = document.querySelectorAll('input[name="skills"]');
    skillCheckboxes.forEach(cb => {
      cb.checked = cb.value === 'chat';
    });
  }
  
  // 触发框架选择事件，显示相应的配置内容
  frameworkSelect.dispatchEvent(new Event('change'));
  
  agentModal.style.display = 'flex';
}

// 关闭模态框
function closeAgentModal() {
  agentModal.style.display = 'none';
}

// 更新代理配置预览
function updateAgentConfigPreview() {
  const agentId = document.getElementById('agent-id-input').value;
  const agentName = document.getElementById('agent-name-input').value;
  const framework = document.getElementById('agent-framework-select').value;
  
  // 根据框架获取模型值
  let model;
  if (framework === 'openclaw') {
    model = document.getElementById('agent-model-input').value;
  } else if (framework === 'zeroclaw') {
    model = document.getElementById('agent-zeroclaw-model-input').value;
  }
  
  const prompt = document.getElementById('agent-prompt-input').value;
  
  // 获取选中的技能
  const skills = [];
  document.querySelectorAll('input[name="skills"]:checked').forEach(cb => {
    skills.push(cb.value);
  });
  
  let configPreview = '';
  
  if (framework === 'openclaw') {
    // OpenClaw 配置预览 (JSON)
    const config = {
      id: agentId,
      name: agentName,
      model: {
        primary: model
      },
      skills: skills
    };
    
    if (prompt) {
      config.system_prompt = prompt;
    }
    
    configPreview = JSON.stringify(config, null, 2);
  } else if (framework === 'zeroclaw') {
    // ZeroClaw 配置预览 (TOML)
    configPreview = `[agents.${agentId}]
name = "${agentName}"
model = "${model}"
`;
    
    if (prompt) {
      configPreview += `system_prompt = """${prompt}"""
`;
    }
    
    if (skills.length > 0) {
      configPreview += `skills = [${skills.map(s => `"${s}"`).join(', ')}]
`;
    }
  }
  
  // 更新配置预览
  document.getElementById('agent-raw-config').value = configPreview;
}

// 处理代理保存
async function handleAgentSave(e) {
  e.preventDefault();
  
  const agentId = document.getElementById('agent-id-hidden').value || document.getElementById('agent-id-input').value;
  const agentName = document.getElementById('agent-name-input').value;
  const agentIcon = document.getElementById('agent-icon-input').value;
  const framework = document.getElementById('agent-framework-select').value;
  const originalFramework = document.getElementById('agent-id-hidden').dataset.originalFramework;
  
  // 根据框架获取模型值
  let model;
  if (framework === 'openclaw') {
    model = document.getElementById('agent-model-input').value;
  } else if (framework === 'zeroclaw') {
    model = document.getElementById('agent-zeroclaw-model-input').value;
  }
  
  const prompt = document.getElementById('agent-prompt-input').value;
  const configText = document.getElementById('agent-config-input').value;
  
  // 获取选中的技能
  const skills = [];
  document.querySelectorAll('input[name="skills"]:checked').forEach(cb => {
    skills.push(cb.value);
  });
  
  // 解析高级配置
  let config = {};
  if (configText.trim()) {
    try {
      config = JSON.parse(configText);
    } catch (error) {
      alert('高级配置JSON格式错误: ' + error.message);
      return;
    }
  }
  
  const agentData = {
    id: agentId,
    name: agentName,
    icon: agentIcon,
    framework: framework,
    model: model,
    prompt: prompt,
    skills: skills,
    config: config
  };
  
  try {
    // 保存icon和name到本地配置（只在AgentBrother中使用，不影响底层框架）
    const configs = loadAgentConfig();
    configs[agentId] = {
      icon: agentIcon,
      name: agentName
    };
    saveAgentConfig(configs);
    
    if (window.electron) {
      // 准备发送给底层框架的数据（不包含icon和name）
      const frameworkAgentData = {
        id: agentId,
        framework: framework,
        model: model,
        prompt: prompt,
        skills: skills,
        config: config
      };
      
      // 检查是否需要跨框架迁移
      if (originalFramework && originalFramework !== framework) {
        // 先删除原框架中的代理
        const deleteResult = await window.electron.deleteAgent(agentId, originalFramework);
        if (!deleteResult.success) {
          alert('删除原框架代理失败: ' + (deleteResult.error || '未知错误'));
          return;
        }
      }
      
      // 保存代理到底层框架
      const result = await window.electron.saveAgent(frameworkAgentData);
      
      if (result.success) {
        alert('代理保存成功！');
        closeAgentModal();
        
        // 刷新代理列表
        await loadAgents();
        
        // 刷新浮点输入的代理选择
        const currentFramework = document.getElementById('framework-select').value;
        if (typeof loadAgentSelect === 'function') {
          await loadAgentSelect(currentFramework);
        }
        
        // 如果需要重启框架
        if (result.needRestart) {
          const shouldRestart = confirm('代理配置已更改，需要重启框架才能生效。是否立即重启？');
          if (shouldRestart) {
            await window.electron.restartFramework(framework);
            alert('框架重启成功！');
          }
        }
      } else {
        alert('保存代理失败: ' + (result.error || '未知错误'));
      }
    } else {
      // 模拟保存成功
      alert('代理保存成功！');
      closeAgentModal();
      await loadAgents();
    }
  } catch (error) {
    console.error('保存代理失败:', error);
    alert('保存代理失败: ' + error.message);
  }
}