#!/bin/bash

# AgentBrother 启动脚本

echo "🚀 启动 AgentBrother..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 启动 AgentBrother 核心
echo "✨ 启动 AgentBrother 核心..."
node -e "
console.log('🎯 AgentBrother 核心已启动');
console.log('\n可用功能:');
console.log('  - 漂浮输入框: 快速发送消息给 Agent');
console.log('  - 框架检测: 自动发现 OpenClaw 等框架');
console.log('  - Agent 管理: 统一管理所有 Agent');
"

# 运行漂浮输入框
echo "\n🎯 启动漂浮输入框..."
./run-float-input.sh
