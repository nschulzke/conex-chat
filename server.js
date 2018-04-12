// Express Setup
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));

// Knex Setup
const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];
const knex = require('knex')(config);

// bcrypt setup
let bcrypt = require('bcrypt');
const saltRounds = 10;

app.listen(3000, () => console.log('Server listening on port 3000!'));

app.post('/api/login', (req, res) => {
  if (!req.body.username || !req.body.password)
    return res.status(400).send();
  knex('users').where('username', req.body.username).first().then(user => {
    if (user === undefined) {
      res.status(403).send("Invalid credentials");
      throw new Error('abort');
    }
    return [bcrypt.compare(req.body.password, user.hash), user];
  }).spread((result, user) => {
    if (result) {
      let token = crypto.randomBytes(48).toString('hex')
      knex('users').where('id', ids[0]).update({
        token: token,
      });
      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          token: token,
        }
      });
    } else
      res.status(403).send("Invalid credentials");
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({
        error
      });
    }
  });
});

app.post('/api/users', (req, res) => {
  if (!req.body.username || !req.body.password)
    return res.status(400).send();
  knex('users').where('username', req.body.username).first().then(user => {
    if (user !== undefined) {
      res.status(403).send("Username already taken");
      throw new Error('abort');
    }
    return bcrypt.hash(req.body.password, saltRounds);
  }).then(hash => {
    return knex('users').insert({
      username: req.body.username,
      hash: hash,
      token: crypto.randomBytes(48).toString('hex'),
    });
  }).then(ids => {
    return knex('users').where('id', ids[0]).first().select('id', 'username', 'token');
  }).then(user => {
    res.status(200).json({
      user: user
    });
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({
        error
      });
    }
  });
});

app.post('/api/messages', (req, res) => {
  knex('users').where('id', req.body.from_id).first().then(user => {
    if (req.headers.authorization != user.token) {
      res.status(403).send("Not logged in");
      throw new Error('abort');
    }
    return knex('messages').insert({
      from_id: req.body.from_id,
      to_id: req.body.to_id,
      text: req.body.text,
      sent_at: new Date()
    });
  }).then(ids => {
    return knex('messages').where('id', ids[0]).first();
  }).then(message => {
    res.status(200).json({
      message: message
    });
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({
        error
      });
    }
  });
});

app.get('/api/messages', (req, res) => {
  knex('users').where('token', req.headers.authorization).first().then(user => {
    if (user === undefined) {
      res.status(403).send("Not logged in");
      throw new Error('abort');
    }
    return knex('users').join('messages', 'users.id', 'messages.from_id')
    .where('from_id', user.id).orWhere('to_id', user.id)
    .select('username', 'text', 'sent_at');
  }).then(messages => {
    res.status(200).json({
      messages: messages
    });
  }).catch(error => {
    if (error.message !== 'abort') {
      res.status(500).json({
        error
      });
    }
  });
});

app.get('/api/users', (req, res) => {
  knex('users').where('token', req.headers.authorization).first().then(user => {
    if (user === undefined) {
      res.status(403).send("Not logged in");
      throw new Error('abort');
    }
    return knex('users').select('id', 'username');
  }).then(users => {
    res.status(200).json({
      users: users
    });
  }).catch(error => {
    console.log('error');
    if (error.message !== 'abort') {
      res.status(500).json({
        error
      });
    }
  });
});
