// 设置模块
// 负责处理应用设置，包括语言和主题

// 当前语言
let currentLanguage = 'zh-CN';

// 翻译文本
const translations = {
  'zh-CN': {
    nav: {
      float: '浮点',
      projects: '项目',
      agents: '代理',
      xclaw: '配置',
      settings: '设置',
      skills: '技能',
      about: '关于'
    },
    common: {
      showFloat: '显示浮点',
      refresh: '刷新',
      add: '添加',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消'
    },
    settings: {
      title: '设置',
      theme: '主题',
      language: '语言',
      autoUpdate: '自动更新',
      notifications: '通知',
      saved: '设置已保存！'
    },
    float: {
      title: '浮点输入',
      enabled: '启用浮点输入',
      enabledDesc: '启用全局浮点输入窗口',
      shortcut: '快捷键',
      position: '位置',
      opacity: '透明度',
      alwaysOnTop: '始终置顶',
      save: '保存设置'
    },
    agents: {
      title: '代理管理',
      add: '添加代理',
      edit: '编辑代理',
      delete: '删除代理',
      deleteConfirm: '确定要删除代理 "{id}" 吗？',
      saveSuccess: '代理保存成功！',
      deleteSuccess: '代理删除成功！',
      saveFailed: '保存失败',
      deleteFailed: '删除失败',
      restartConfirm: '代理配置已更改，需要重启框架才能生效。是否立即重启？',
      restartSuccess: '框架重启成功！'
    },
    framework: {
      openclaw: 'OpenClaw',
      zeroclaw: 'ZeroClaw',
      installed: '已安装',
      notInstalled: '未安装',
      running: '运行中',
      notRunning: '未运行',
      startGateway: '启动Gateway',
      starting: '启动中...',
      startSuccess: 'OpenClaw Gateway启动成功！',
      startFailed: '启动失败'
    }
  },
  'en-US': {
    nav: {
      float: 'Float Input',
      projects: 'Projects',
      agents: 'Agents',
      xclaw: 'Config',
      settings: 'Settings',
      skills: 'Skills Market',
      about: 'About'
    },
    common: {
      showFloat: 'Show Float',
      refresh: 'Refresh',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel'
    },
    settings: {
      title: 'Settings',
      theme: 'Theme',
      language: 'Language',
      autoUpdate: 'Auto Update',
      notifications: 'Notifications',
      saved: 'Settings saved!'
    },
    float: {
      title: 'Float Input',
      enabled: 'Enable Float Input',
      enabledDesc: 'Enable global float input window',
      shortcut: 'Shortcut',
      position: 'Position',
      opacity: 'Opacity',
      alwaysOnTop: 'Always on Top',
      save: 'Save Settings'
    },
    agents: {
      title: 'Agent Management',
      add: 'Add Agent',
      edit: 'Edit Agent',
      delete: 'Delete Agent',
      deleteConfirm: 'Are you sure you want to delete agent "{id}"?',
      saveSuccess: 'Agent saved successfully!',
      deleteSuccess: 'Agent deleted successfully!',
      saveFailed: 'Save failed',
      deleteFailed: 'Delete failed',
      restartConfirm: 'Agent configuration changed, framework restart required. Restart now?',
      restartSuccess: 'Framework restarted successfully!'
    },
    framework: {
      openclaw: 'OpenClaw',
      zeroclaw: 'ZeroClaw',
      installed: 'Installed',
      notInstalled: 'Not Installed',
      running: 'Running',
      notRunning: 'Not Running',
      startGateway: 'Start Gateway',
      starting: 'Starting...',
      startSuccess: 'OpenClaw Gateway started successfully!',
      startFailed: 'Start failed'
    }
  },
  'ja-JP': {
    nav: {
      float: 'フロート入力',
      projects: 'プロジェクト',
      agents: 'エージェント',
      xclaw: '設定',
      settings: '設定',
      skills: 'スキル市場',
      about: 'について'
    },
    common: {
      showFloat: 'フロート表示',
      refresh: '更新',
      add: '追加',
      edit: '編集',
      delete: '削除',
      save: '保存',
      cancel: 'キャンセル'
    },
    settings: {
      title: '設定',
      theme: 'テーマ',
      language: '言語',
      autoUpdate: '自動更新',
      notifications: '通知',
      saved: '設定を保存しました！'
    },
    float: {
      title: 'フロート入力',
      enabled: 'フロート入力を有効にする',
      enabledDesc: 'グローバルフロート入力ウィンドウを有効にする',
      shortcut: 'ショートカット',
      position: '位置',
      opacity: '不透明度',
      alwaysOnTop: '常に最前面',
      save: '設定を保存'
    },
    agents: {
      title: 'エージェント管理',
      add: 'エージェント追加',
      edit: 'エージェント編集',
      delete: 'エージェント削除',
      deleteConfirm: 'エージェント "{id}" を削除してもよろしいですか？',
      saveSuccess: 'エージェントを保存しました！',
      deleteSuccess: 'エージェントを削除しました！',
      saveFailed: '保存に失敗しました',
      deleteFailed: '削除に失敗しました',
      restartConfirm: 'エージェント設定が変更されました。フレームワークを再起動する必要があります。今すぐ再起動しますか？',
      restartSuccess: 'フレームワークを再起動しました！'
    },
    framework: {
      openclaw: 'OpenClaw',
      zeroclaw: 'ZeroClaw',
      installed: 'インストール済み',
      notInstalled: '未インストール',
      running: '実行中',
      notRunning: '未実行',
      startGateway: 'ゲートウェイ開始',
      starting: '開始中...',
      startSuccess: 'OpenClawゲートウェイを開始しました！',
      startFailed: '開始に失敗しました'
    }
  },
  'hi-IN': {
    nav: {
      float: 'तैरावार इनपुट',
      projects: 'परियोजना',
      agents: 'एजेंट',
      xclaw: 'कॉन्फ़िगरेशन',
      settings: 'सेटिंग्स',
      skills: 'कौशल बाज़ार',
      about: 'हमारे बारे में'
    },
    common: {
      showFloat: 'तैरावार दिखाएं',
      refresh: 'रिफ्रेश',
      add: 'जोड़ें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      save: 'सहेजें',
      cancel: 'रद्द करें'
    },
    settings: {
      title: 'सेटिंग्स',
      theme: 'थीम',
      language: 'भाषा',
      autoUpdate: 'स्वचालित अपडेट',
      notifications: 'सूचनाएं',
      saved: 'सेटिंग्स सहेज गईं!'
    },
    float: {
      title: 'तैरावार इनपुट',
      enabled: 'तैरावार इनपुट सक्षम करें',
      enabledDesc: 'वैश्विक तैरावार इनपुट विंडो सक्षम करें',
      shortcut: 'शॉर्टकट',
      position: 'स्थिति',
      opacity: 'अपारदर्शिता',
      alwaysOnTop: 'हमेशा शीर्ष पर',
      save: 'सेटिंग्स सहेजें'
    },
    agents: {
      title: 'एजेंट प्रबंधन',
      add: 'एजेंट जोड़ें',
      edit: 'एजेंट संपादित करें',
      delete: 'एजेंट हटाएं',
      deleteConfirm: 'क्या आप वाकई "{id}" को हटाना चाहते हैं?',
      saveSuccess: 'एजेंट सफलतापूर्वक सहेजा गया!',
      deleteSuccess: 'एजेंट सफलतापूर्वक हटाया गया!',
      saveFailed: 'सहेजना विफल',
      deleteFailed: 'हटाना विफल',
      restartConfirm: 'एजेंट कॉन्फ़िगरेशन बदल गई है, फ्रेमवर्क पुनः प्रारंभ की आवश्यकता है। अभी पुनः प्रारंभ करें?',
      restartSuccess: 'फ्रेमवर्क सफलतापूर्वक पुनः प्रारंभ हुआ!'
    },
    framework: {
      openclaw: 'OpenClaw',
      zeroclaw: 'ZeroClaw',
      installed: 'स्थापित',
      notInstalled: 'स्थापित नहीं',
      running: 'चल रहा है',
      notRunning: 'चल नहीं रहा है',
      startGateway: 'गेटवे प्रारंभ करें',
      starting: 'प्रारंभ हो रहा है...',
      startSuccess: 'OpenClaw गेटवे सफलतापूर्वक प्रारंभ हुआ!',
      startFailed: 'प्रारंभ विफल'
    }
  }
};

// 初始化设置模块
function initSettings() {
  // 保存应用设置
  document.getElementById('save-app-settings').addEventListener('click', () => {
    const settings = {
      theme: document.getElementById('app-theme').value,
      language: document.getElementById('app-language').value
    };
    
    // 保存设置到本地存储
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // 应用语言设置
    if (settings.language && settings.language !== currentLanguage) {
      updateLanguage(settings.language);
    }
    
    // 应用主题设置
    applyTheme(settings.theme);
    
    // 显示保存成功提示
    alert(t('settings.saved'));
  });
  
  // 加载应用设置
  loadAppSettings();
}

// 获取翻译文本
function t(key) {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return value;
}

// 更新界面语言
function updateLanguage(lang) {
  currentLanguage = lang;
  
  // 更新HTML lang属性
  document.documentElement.lang = lang;
  
  // 更新导航栏
  document.querySelector('[data-page="float"] span').textContent = t('nav.float');
  document.querySelector('[data-page="projects"] span').textContent = t('nav.projects');
  document.querySelector('[data-page="agents"] span').textContent = t('nav.agents');
  document.querySelector('[data-page="xclaw"] span').textContent = t('nav.xclaw');
  document.querySelector('[data-page="skills"] span').textContent = t('nav.skills');
  document.querySelector('[data-page="about"] span').textContent = t('nav.about');
  document.querySelector('[data-page="settings"] span').textContent = t('settings.title');
  
  // 更新导航栏标题
  const navSectionTitles = document.querySelectorAll('.nav-section-title');
  if (navSectionTitles.length > 0) {
    navSectionTitles[0].textContent = t('settings.title');
  }
  
  // 更新页面标题
  document.getElementById('page-title').textContent = t('nav.float');
  
  // 更新显示浮点框按钮
  document.getElementById('float-input-btn').innerHTML = '<i class="fas fa-comment-dots"></i> ' + t('common.showFloat');
  
  // 更新设置页面
  const settingsTitle = document.querySelector('#settings-page .section-title');
  if (settingsTitle) {
    settingsTitle.textContent = t('settings.title');
  }
  
  // 更新浮点输入设置标题
  const floatSettingsTitle = document.querySelector('#settings-page h3:nth-of-type(1)');
  if (floatSettingsTitle) {
    floatSettingsTitle.textContent = t('float.title') + ' ' + t('settings.title');
  }
  
  // 更新应用设置标题
  const appSettingsTitle = document.querySelector('#settings-page h3:nth-of-type(2)');
  if (appSettingsTitle) {
    appSettingsTitle.textContent = t('settings.title');
  }
  
  // 更新设置页面表单标签
  const themeLabel = document.querySelector('label[for="app-theme"]');
  if (themeLabel) {
    themeLabel.textContent = t('settings.theme');
  }
  
  const languageLabel = document.querySelector('label[for="app-language"]');
  if (languageLabel) {
    languageLabel.textContent = t('settings.language');
  }
  
  const autoUpdateLabel = document.querySelector('label[for="app-update"] span');
  if (autoUpdateLabel) {
    autoUpdateLabel.textContent = t('settings.autoUpdate');
  }
  
  const notificationsLabel = document.querySelector('label[for="app-notifications"] span');
  if (notificationsLabel) {
    notificationsLabel.textContent = t('settings.notifications');
  }
  
  // 更新保存按钮
  const saveFloatSettingsBtn = document.getElementById('save-float-settings');
  if (saveFloatSettingsBtn) {
    saveFloatSettingsBtn.textContent = t('settings.save');
  }
  
  const saveAppSettingsBtn = document.getElementById('save-app-settings');
  if (saveAppSettingsBtn) {
    saveAppSettingsBtn.textContent = t('settings.save');
  }
  
  // 保存语言设置
  localStorage.setItem('appLanguage', lang);
}

// 应用主题设置
function applyTheme(theme) {
  const body = document.body;
  
  // 移除所有主题类
  body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
  
  // 添加当前主题类
  body.classList.add(`theme-${theme}`);
  
  // 根据主题设置不同的样式
  if (theme === 'light') {
    body.style.backgroundColor = '#ffffff';
    body.style.color = '#333333';
    
    // 更新侧边栏背景
    document.querySelector('.sidebar').style.backgroundColor = '#f8f9fa';
    document.querySelector('.sidebar').style.borderRight = '1px solid #dee2e6';
    
    // 更新导航项
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.style.color = '#333333';
      item.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#e9ecef';
      });
      item.addEventListener('mouseout', function() {
        if (!this.classList.contains('active')) {
          this.style.backgroundColor = 'transparent';
        }
      });
    });
    
    // 更新活动导航项
    const activeNavItem = document.querySelector('.nav-item.active');
    if (activeNavItem) {
      activeNavItem.style.backgroundColor = '#e9ecef';
      activeNavItem.style.borderLeft = '3px solid #007bff';
    }
    
    // 更新主内容区域
    document.querySelector('.main-content').style.backgroundColor = '#ffffff';
    document.querySelector('.header').style.backgroundColor = '#f8f9fa';
    document.querySelector('.header').style.borderBottom = '1px solid #dee2e6';
  } else if (theme === 'dark') {
    body.style.backgroundColor = '#1a1a2e';
    body.style.color = '#ffffff';
    
    // 更新侧边栏背景
    document.querySelector('.sidebar').style.backgroundColor = '#16213e';
    document.querySelector('.sidebar').style.borderRight = '1px solid #0f3460';
    
    // 更新导航项
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.style.color = '#ffffff';
      item.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#0f3460';
      });
      item.addEventListener('mouseout', function() {
        if (!this.classList.contains('active')) {
          this.style.backgroundColor = 'transparent';
        }
      });
    });
    
    // 更新活动导航项
    const activeNavItem = document.querySelector('.nav-item.active');
    if (activeNavItem) {
      activeNavItem.style.backgroundColor = '#0f3460';
      activeNavItem.style.borderLeft = '3px solid #4cc9f0';
    }
    
    // 更新主内容区域
    document.querySelector('.main-content').style.backgroundColor = '#1a1a2e';
    document.querySelector('.header').style.backgroundColor = '#16213e';
    document.querySelector('.header').style.borderBottom = '1px solid #0f3460';
  } else if (theme === 'auto') {
    // 自动主题：根据系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
}

// 加载应用设置
function loadAppSettings() {
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    document.getElementById('app-theme').value = settings.theme;
    document.getElementById('app-language').value = settings.language;
    
    // 应用语言设置
    if (settings.language) {
      updateLanguage(settings.language);
    }
    
    // 应用主题设置
    if (settings.theme) {
      applyTheme(settings.theme);
    }
  } else {
    // 默认应用中文和深色主题
    updateLanguage('zh-CN');
    applyTheme('dark');
  }
}