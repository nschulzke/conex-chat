const app = require('./src/app');
const model = require('./src/model');
const api = require('./src/api');
const handler = require('./src/handler');

const WebSocket = require('ws');

model.deactivateAllUsers();

app.post('/api/login', (req, res) => {
  model.loginUser(api('rest', res), {
    username: req.body.username,
    password: req.body.password,
  });
});

app.post('/api/users', (req, res) => {
  model.registerUser(api('rest', res), {
    username: req.body.username,
    password: req.body.password,
  });
});

app.post('/api/messages', (req, res) => {
  model.sendMessage(api('rest', res), {
    from_id: req.body.from_id,
    to_id: req.body.to_id,
    text: req.body.text,
    sent_at: new Date(),
    token: req.headers.authorization,
  });
});

app.get('/api/messages', (req, res) => {
  model.getMessages(api('rest', res), {
    token: req.headers.authorization,
  });
});

app.get('/api/users', (req, res) => {
  model.getUsers(api('rest', res), {
    token: req.headers.authorization,
  });
});

sockets = {};

function send(ws, data) {
  if (Array.isArray(ws))
    ws.forEach(socket => send(socket, data));
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
    if (user)
      send(sockets[user.id], data);
    else
      send(ws, data);
    if (data.result !== undefined) {
      if (data.result.to_id !== undefined && data.result.from_id !== data.result.to_id) {
        send(sockets[data.result.to_id], data);
      } else if (data.action === 'activated' && data.success) {
        user = data.result;
        if (sockets[user.id] === undefined)
          sockets[user.id] = [];
        sockets[user.id].push(ws);
        broadcast(data);
      }
    }
  }, ws);

  ws.on('message', (msg) => {
    try {
      _handler.handle(msg);
    } catch (e) {
      console.log(e);
    }
  });

  function closed() {
    clearInterval(ping);
    clearTimeout(pingTimeout);
    if (user) {
      var index = sockets[user.id].indexOf(ws);
      if (index !== -1) sockets[user.id].splice(index, 1);
      if (sockets[user.id].length === 0)
        model.deactivateUser(api('ws', (data) => broadcast(data), 'deactivated'), user);
    }
    if (ws._socket)
      ws._socket.destroy();
  }

  let pingTimeout;
  let ping = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
      pingTimeout = setTimeout(() => {
        closed();
      }, 2500);
    } else closed();
  }, 5000);

  ws.on('pong', () => {
    clearTimeout(pingTimeout);
  });

  ws.on('close', () => {
    closed();
  });
});
