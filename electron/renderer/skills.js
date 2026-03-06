// 技能页面功能实现

// 初始化技能页面
function initSkillsPage() {
  initSkillTabs();
  loadLocalSkills();
  loadCloudSkills();
}

// 初始化技能标签页
function initSkillTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      
      // 更新标签按钮状态
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // 更新内容显示
      tabContents.forEach(content => content.style.display = 'none');
      document.getElementById(`${tabId}-skills`).style.display = 'block';
    });
  });
}

// 加载本地技能
async function loadLocalSkills() {
  const localSkillsContainer = document.querySelector('#local-skills .skills-container');
  
  try {
    // 模拟从OpenClaw和ZeroClaw读取技能
    const localSkills = await getLocalSkills();
    
    if (localSkills.length === 0) {
      localSkillsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #a9a9a9; padding: 40px;">
          <i class="fas fa-info-circle"></i> 暂无本地技能
        </div>
      `;
      return;
    }
    
    localSkillsContainer.innerHTML = '';
    localSkills.forEach(skill => {
      const skillCard = createSkillCard(skill);
      localSkillsContainer.appendChild(skillCard);
    });
  } catch (error) {
    console.error('加载本地技能失败:', error);
    localSkillsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: #f72585; padding: 40px;">
        <i class="fas fa-exclamation-circle"></i> 加载本地技能失败
      </div>
    `;
  }
}

// 加载云端技能
async function loadCloudSkills() {
  const cloudSkillsContainer = document.querySelector('#cloud-skills .skills-container');
  
  try {
    // 模拟从网络获取云端技能
    const cloudSkills = await getCloudSkills();
    
    if (cloudSkills.length === 0) {
      cloudSkillsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #a9a9a9; padding: 40px;">
          <i class="fas fa-info-circle"></i> 暂无云端技能
        </div>
      `;
      return;
    }
    
    cloudSkillsContainer.innerHTML = '';
    cloudSkills.forEach(skill => {
      const skillCard = createSkillCard(skill);
      cloudSkillsContainer.appendChild(skillCard);
    });
  } catch (error) {
    console.error('加载云端技能失败:', error);
    cloudSkillsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: #f72585; padding: 40px;">
        <i class="fas fa-exclamation-circle"></i> 加载云端技能失败
      </div>
    `;
  }
}

// 模拟获取本地技能
async function getLocalSkills() {
  // 模拟从OpenClaw和ZeroClaw读取技能
  return [
    {
      id: 'openclaw-chat',
      name: '基础聊天',
      description: '提供基本的对话能力，支持自然语言交流',
      framework: 'OpenClaw',
      isLocal: true
    },
    {
      id: 'openclaw-file',
      name: '文件处理',
      description: '处理各种文件格式，包括文本、文档和PDF',
      framework: 'OpenClaw',
      isLocal: true
    },
    {
      id: 'openclaw-web',
      name: '网络搜索',
      description: '进行网络搜索，获取最新信息',
      framework: 'OpenClaw',
      isLocal: true
    },
    {
      id: 'zeroclaw-image',
      name: '图像生成',
      description: '根据描述生成高质量图像',
      framework: 'ZeroClaw',
      isLocal: true
    },
    {
      id: 'zeroclaw-code',
      name: '代码执行',
      description: '执行和调试代码，支持多种编程语言',
      framework: 'ZeroClaw',
      isLocal: true
    }
  ];
}

// 模拟获取云端技能
async function getCloudSkills() {
  // 模拟从网络获取云端技能
  return [
    {
      id: 'cloud-nlp',
      name: '自然语言处理',
      description: '增强AI的语言理解和生成能力，支持多语言翻译、情感分析等',
      framework: 'Cloud',
      isLocal: false
    },
    {
      id: 'cloud-vision',
      name: '计算机视觉',
      description: '让AI能够识别和分析图像内容，支持物体检测、人脸识别等',
      framework: 'Cloud',
      isLocal: false
    },
    {
      id: 'cloud-data',
      name: '数据分析',
      description: '帮助AI分析和处理数据，生成可视化报告和洞察',
      framework: 'Cloud',
      isLocal: false
    },
    {
      id: 'cloud-voice',
      name: '语音合成',
      description: '让AI能够生成自然的语音，支持多种语言和音色',
      framework: 'Cloud',
      isLocal: false
    }
  ];
}

// 创建技能卡片
function createSkillCard(skill) {
  const skillCard = document.createElement('div');
  skillCard.className = 'skill-card';
  
  // 检查技能是否已收藏
  const isFavorited = isSkillFavorited(skill.id);
  
  skillCard.innerHTML = `
    <h3>
      ${skill.name}
      <span class="skill-framework">${skill.framework}</span>
    </h3>
    <p>${skill.description}</p>
    <div class="skill-actions">
      <button class="btn btn-add" onclick="addSkillToAgent('${skill.id}')">
        <i class="fas fa-plus"></i> 添加到代理
      </button>
      <button class="btn btn-favorite ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorite('${skill.id}')">
        <i class="fas ${isFavorited ? 'fa-heart' : 'fa-heart'}"></i> ${isFavorited ? '已收藏' : '收藏'}
      </button>
    </div>
  `;
  
  return skillCard;
}

// 检查技能是否已收藏
function isSkillFavorited(skillId) {
  const favorites = JSON.parse(localStorage.getItem('agentbrother_skill_favorites') || '[]');
  return favorites.includes(skillId);
}

// 切换技能收藏状态
function toggleFavorite(skillId) {
  const favorites = JSON.parse(localStorage.getItem('agentbrother_skill_favorites') || '[]');
  
  if (favorites.includes(skillId)) {
    // 取消收藏
    const updatedFavorites = favorites.filter(id => id !== skillId);
    localStorage.setItem('agentbrother_skill_favorites', JSON.stringify(updatedFavorites));
  } else {
    // 添加收藏
    favorites.push(skillId);
    localStorage.setItem('agentbrother_skill_favorites', JSON.stringify(favorites));
  }
  
  // 重新加载技能列表以更新UI
  if (document.querySelector('.tab-btn.active').getAttribute('data-tab') === 'local') {
    loadLocalSkills();
  } else {
    loadCloudSkills();
  }
}

// 添加技能到代理
function addSkillToAgent(skillId) {
  // 这里应该打开一个模态框，让用户选择要添加技能的代理
  // 现在先模拟一个提示
  alert(`技能 ${skillId} 已添加到代理`);
}

// 导出函数
window.initSkillsPage = initSkillsPage;
window.loadLocalSkills = loadLocalSkills;
window.loadCloudSkills = loadCloudSkills;
window.addSkillToAgent = addSkillToAgent;
window.toggleFavorite = toggleFavorite;