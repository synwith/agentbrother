#!/bin/bash

# AgentBrother 漂浮输入框启动脚本

echo "🚀 启动 AgentBrother 漂浮输入框..."

# 检查 OpenClaw 是否存在
if [ ! -f "$HOME/Documents/trae_projects/openclaw_test/openclaw.sh" ]; then
    echo "❌ 未找到 OpenClaw，请确保 OpenClaw 已安装"
    exit 1
fi

# 运行 AppleScript 漂浮输入框
osascript ui/float-input/macos/float-input.applescript

echo "✅ 漂浮输入框已启动"
