// 主应用文件
// 负责页面导航、全局初始化和模块加载

// 页面导航
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const pageTitle = document.getElementById('page-title');
  
  const pageTitles = {
    'float': '浮点输入设置',
    'projects': '项目管理',
    'agents': '代理管理',
    'xclaw': '配置',
    'settings': '设置',
    'skills': '技能',
    'about': '关于我们'
  };
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageName = item.getAttribute('data-page');
      
      // 更新导航状态
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // 更新页面显示
      pages.forEach(page => page.classList.remove('active'));
      // 特殊处理项目页面
      let targetPage;
      if (pageName === 'projects') {
        targetPage = document.getElementById('projects');
      } else {
        targetPage = document.getElementById(`${pageName}-page`);
      }
      if (targetPage) {
        targetPage.classList.add('active');
      }
      
      // 更新页面标题
      if (pageTitle && pageTitles[pageName]) {
        pageTitle.textContent = pageTitles[pageName];
      }
      
      // 触发页面特定的初始化
      onPageChange(pageName);
    });
  });
}

// 显示指定页面
function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  const navItems = document.querySelectorAll('.nav-item');
  const pageTitle = document.getElementById('page-title');
  
  const pageTitles = {
    'float': '浮点输入设置',
    'projects': '项目管理',
    'agents': '代理管理',
    'xclaw': '配置',
    'settings': '设置',
    'skills': '技能',
    'about': '关于我们'
  };
  
  // 隐藏所有页面
  pages.forEach(page => page.classList.remove('active'));
  
  // 显示目标页面
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // 重置导航状态
  navItems.forEach(nav => nav.classList.remove('active'));
  
  // 设置当前导航项为active（只对标准导航页面）
  const pageName = pageId.replace('-page', '');
  let navPageName = pageName;
  
  // 处理子页面，找到对应的父级导航项
  if (pageId === 'create-project-page' || pageId === 'project-detail-page' || 
      pageId === 'add-agent-page' || pageId === 'project-chat-page') {
    navPageName = 'projects';
  }
  
  const currentNavItem = document.querySelector(`.nav-item[data-page="${navPageName}"]`);
  if (currentNavItem) {
    currentNavItem.classList.add('active');
  }
  
  // 更新页面标题（只对标准导航页面）
  if (pageTitle && pageTitles[navPageName]) {
    pageTitle.textContent = pageTitles[navPageName];
  }
  
  // 触发页面特定的初始化
  onPageChange(navPageName);
}

// 页面变化时的处理
function onPageChange(pageName) {
  switch(pageName) {
    case 'agents':
      if (typeof loadAgents === 'function') {
        loadAgents();
      }
      break;
    case 'float':
      if (typeof initFloatInput === 'function') {
        initFloatInput();
      }
      break;
    case 'xclaw':
      if (typeof updateFrameworkStatus === 'function') {
        updateFrameworkStatus();
      }
      break;
    case 'settings':
      if (typeof loadSettings === 'function') {
        loadSettings();
      }
      break;
    case 'projects':
      if (typeof loadProjects === 'function') {
        loadProjects();
      }
      break;
    case 'tasks':
      if (typeof window.taskManager !== 'undefined' && typeof window.taskManager.renderTasks === 'function') {
        window.taskManager.renderTasks();
      }
      break;
    case 'skills':
      if (typeof initSkillsPage === 'function') {
        initSkillsPage();
      }
      break;
  }
}

// 初始化应用
function initApp() {
  initNavigation();
  
  // 初始化各个模块
  if (typeof initFloatInput === 'function') {
    initFloatInput();
  }
  
  if (typeof initAgents === 'function') {
    initAgents();
  }
  
  if (typeof initFramework === 'function') {
    initFramework();
  }
  
  if (typeof initSettings === 'function') {
    initSettings();
  }
  
  if (typeof initProjects === 'function') {
    initProjects();
  }
  
  // 如果在Electron环境中，初始化框架状态
  if (window.electron) {
    if (typeof updateFrameworkStatus === 'function') {
      updateFrameworkStatus();
    }
    
    // 每5秒更新一次框架状态
    setInterval(() => {
      if (typeof updateFrameworkStatus === 'function') {
        updateFrameworkStatus();
      }
    }, 5000);
  }
}

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);