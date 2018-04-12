const app = require('./server/app');
const db = require('./server/db');
const api = require('./server/api');
const handler = require('./server/handler');

const WebSocket = require('ws');

app.post('/api/login', (req, res) => {
  db.loginUser(api('rest', res), {
    username: req.body.username,
    password: req.body.password,
  });
});

app.post('/api/users', (req, res) => {
  db.registerUser(api('rest', res), {
    username: req.body.username,
    password: req.body.password,
  });
});

app.post('/api/messages', (req, res) => {
  db.sendMessage(api('rest', res), {
    from_id: req.body.from_id,
    to_id: req.body.to_id,
    text: req.body.text,
    sent_at: new Date(),
    token: req.headers.authorization,
  });
});

app.get('/api/messages', (req, res) => {
  db.getMessages(api('rest', res), {
    token: req.headers.authorization,
  });
});

app.get('/api/users', (req, res) => {
  db.getUsers(api('rest', res), {
    token: req.headers.authorization,
  });
});

sockets = {};

function send(ws, data) {
  if (ws !== undefined && ws.readyState === WebSocket.OPEN)
    ws.send(JSON.stringify(data));
}

function broadcast(data) {
  for (var index in sockets)
    send(sockets[index], data);
}

app.ws('/api/messages', (ws, req) => {
  let user;
  let _handler = handler('ws', (data) => {
    send(ws, data);
    if (data.result !== undefined) {
      if (data.result.to_id !== undefined) {
        send(sockets[data.result.to_id], data);
      } else if (data.action === 'activated' && data.success) {
        user = data.result;
        broadcast(data);
      }
    }
  }, sockets, ws);

  ws.on('message', (msg) => {
    try {
      _handler.handle(msg);
    } catch (e) {
      console.log(e);
    }
  });

  function closed() {
    clearInterval(pingTimeout);
    clearTimeout(ping);
    db.deactivateUser(api('ws', (data) => broadcast(data), 'deactivated'), user);
    if (ws._socket)
      ws._socket.destroy();
  }

  let pingTimeout;
  let ping = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
      pingTimeout = setTimeout(() => {
        closed();
      }, 5000);
    } else closed();
  }, 5000);

  ws.on('pong', () => {
    clearTimeout(ping);
  });

  ws.on('close', () => {
    closed();
  });
});
