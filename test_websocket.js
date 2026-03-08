import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:18789');

ws.on('open', () => {
  console.log('WebSocket连接已建立');
});

ws.on('message', (data) => {
  try {
    // 确保数据是字符串
    const dataStr = data.toString('utf8');
    console.log('收到消息:', dataStr);
    
    const wsMessage = JSON.parse(dataStr);
    
    if (wsMessage.type === 'event' && wsMessage.event === 'connect.challenge') {
      console.log('收到连接挑战，nonce:', wsMessage.payload.nonce);
      
      const nonce = wsMessage.payload.nonce;
      const connectRequest = {
        type: 'req',
        id: 'test_' + Date.now(),
        method: 'connect',
        params: {
          minProtocol: 3,
          maxProtocol: 3,
          client: {
            id: 'cli',
            version: '1.0.0',
            platform: 'win32',
            mode: 'cli'
          },
          role: 'operator',
          scopes: ['operator.read', 'operator.write'],
          device: {
            id: 'cli',
            nonce: nonce,
            publicKey: 'cli',
            signature: nonce,
            signedAt: Date.now()
          }
        }
      };
      
      console.log('发送连接请求:', JSON.stringify(connectRequest, null, 2));
      ws.send(JSON.stringify(connectRequest));
    } else if (wsMessage.type === 'res') {
      console.log('收到响应:', JSON.stringify(wsMessage, null, 2));
    }
  } catch (error) {
    console.error('处理消息时出错:', error);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket错误:', error);
});

ws.on('close', (code, reason) => {
  console.log('WebSocket连接关闭:', code, reason.toString());
});