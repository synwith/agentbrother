-- AgentBrother 漂浮输入框

-- 显示主菜单
set menuChoices to {"快速对话", "打开管理界面", "退出"}
set selectedMenu to (choose from list menuChoices with prompt "AgentBrother" default items {"快速对话"} without multiple selections allowed)

if selectedMenu is false then return
set selectedMenu to item 1 of selectedMenu

-- 处理菜单选择
if selectedMenu is "打开管理界面" then
    tell application "Electron" to activate
    return
end if

if selectedMenu is "退出" then
    return
end if

-- 框架选择
set frameworkChoices to {"OpenClaw", "ZeroClaw"}
set selectedFramework to (choose from list frameworkChoices with prompt "选择框架:" default items {"OpenClaw"} without multiple selections allowed)

if selectedFramework is false then return
set selectedFramework to item 1 of selectedFramework

-- Agent 选择
set defaultAgent to "main"

if selectedFramework is "OpenClaw" then
    set agentChoices to {"main", "film-director", "video-editor", "media-creator"}
else
    set agentChoices to {"main"}
end if

set selectedAgent to (choose from list agentChoices with prompt "选择 Agent:" default items {defaultAgent} without multiple selections allowed)

if selectedAgent is false then return
set selectedAgent to item 1 of selectedAgent

-- 提示词输入
set userPrompt to text returned of (display dialog "请输入提示词:" default answer "" with title "AgentBrother")

if userPrompt is "" then return

-- 清理可能存在的锁文件
do shell script "rm -f ~/.openclaw/agents/main/sessions/sessions.json.lock 2>/dev/null; true"

-- 根据框架执行命令
-- 直接使用命令行方式，更稳定可靠
if selectedFramework is "OpenClaw" then
    set curlCmd to "cd ~/Documents/trae_projects/openclaw_test && ./openclaw.sh agent -m '" & userPrompt & "' --agent " & selectedAgent
else
    -- ZeroClaw
    set curlCmd to "~/Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release-fast/zeroclaw agent --message '" & userPrompt & "'"
end if

-- 执行命令
try
    set shellResult to do shell script curlCmd
    display dialog shellResult with title (selectedFramework & " 响应") buttons {"复制到剪贴板", "确定"} default button "确定"
    
    if button returned of the result is "复制到剪贴板" then
        set the clipboard to shellResult
    end if
on error e number n
    display dialog "执行错误: " & e with title "错误" buttons {"确定"} default button "确定"
end try
