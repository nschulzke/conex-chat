const app = require('./server/app');
const db = require('./server/db');
const api = require('./server/api');

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
