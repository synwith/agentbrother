import http from 'http';

// 测试HTTP API连接
function testHttpApi() {
  const ports = [18788, 18789];
  const paths = ['/v1/chat/completions', '/api/v1/chat/completions', '/chat/completions', '/openai/v1/chat/completions'];
  let currentPortIndex = 0;
  let currentPathIndex = 0;

  function tryNext() {
    if (currentPortIndex >= ports.length) {
      console.error('所有端口和路径都返回404错误');
      return;
    }

    if (currentPathIndex >= paths.length) {
      currentPortIndex++;
      currentPathIndex = 0;
      tryNext();
      return;
    }

    const port = ports[currentPortIndex];
    const path = paths[currentPathIndex];
    currentPathIndex++;

    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log(`尝试端口: ${port}, 路径: ${path}`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('HTTP响应状态码:', res.statusCode);
        console.log('HTTP响应内容:', data);
        if (res.statusCode === 404) {
          // 尝试下一个路径
          tryNext();
        } else {
          try {
            const response = JSON.parse(data);
            console.log('解析后的响应:', JSON.stringify(response, null, 2));
          } catch (error) {
            console.error('解析响应失败:', error);
          }
        }
      });
    });

    req.on('error', (error) => {
      console.error('HTTP请求错误:', error);
      // 尝试下一个路径
      tryNext();
    });

    const body = JSON.stringify({
      model: 'openclaw',
      messages: [
        {
          role: 'user',
          content: '你好'
        }
      ],
      temperature: 0.7,
      agentId: 'main'
    });

    req.write(body);
    req.end();
  }

  tryNext();
}

testHttpApi();