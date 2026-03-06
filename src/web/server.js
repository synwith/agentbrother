// Web 服务器
import express from 'express';
import { agentBrother } from '../index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API 路由
app.get('/api/frameworks', async (req, res) => {
  try {
    const frameworks = await agentBrother.detectFrameworks();
    res.json(Array.from(frameworks.values()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/:framework', async (req, res) => {
  try {
    const { framework } = req.params;
    const agents = await agentBrother.getAgents(framework);
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/message', async (req, res) => {
  try {
    const { framework, agentId, message } = req.body;
    const response = await agentBrother.sendMessage(framework, agentId, message);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    const { framework, config } = req.body;
    const agent = await agentBrother.createAgent(framework, config);
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/agents/:framework/:agentId', async (req, res) => {
  try {
    const { framework, agentId } = req.params;
    const { config } = req.body;
    const agent = await agentBrother.updateAgent(framework, agentId, config);
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/agents/:framework/:agentId', async (req, res) => {
  try {
    const { framework, agentId } = req.params;
    const result = await agentBrother.deleteAgent(framework, agentId);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Web server running at http://localhost:${port}`);
});
