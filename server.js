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
  assertExist([req.body.username, req.body.password]).then(() => {
    return knex('users').where('username', req.body.username).first();
  }).then(user => {
    if (user === undefined) {
      throw {
        status: 403,
        message: "Invalid credentials"
      };
    }
    return [bcrypt.compare(req.body.password, user.hash), user];
  }).then(results => {
    result = results[0];
    user = results[1];
    if (result) {
      let token = crypto.randomBytes(48).toString('hex')
      knex('users').where('id', user.id).update({
        token: token,
      });
      success(res, 'user', {
        id: user.id,
        username: user.username,
        token: token,
      });
    } else {
      throw {
        status: 403,
        message: "Invalid credentials"
      };
    }
    return;
  }).catch(error => catchError(res, error));
});

app.post('/api/users', (req, res) => {
  assertExist([req.body.username, req.body.password]).then(() => {
    return knex('users').where('username', req.body.username).first();
  }).then(user => {
    if (user !== undefined) {
      throw {
        status: 403,
        message: "Username already taken"
      };
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
    success(res, 'user', user);
  }).catch(error => catchError(res, error));
});

app.post('/api/messages', (req, res) => {
  compare(req.body.from_id, req.headers.authorization).then(user => {
    return knex('messages').insert({
      from_id: req.body.from_id,
      to_id: req.body.to_id,
      text: req.body.text,
      sent_at: new Date()
    });
  }).then(ids => {
    return knex('messages').where('id', ids[0]).first();
  }).then(message => {
    success(res, 'message', message);
  }).catch(error => catchError(res, error));
});

app.get('/api/messages', (req, res) => {
  authorize(req.headers.authorization).then(user => {
    return knex('users').join('messages', 'users.id', 'messages.from_id')
      .where('from_id', user.id).orWhere('to_id', user.id)
      .select('username', 'text', 'sent_at');
  }).then(messages => {
    success(res, 'messages', messages);
  }).catch(error => catchError(res, error));
});

app.get('/api/users', (req, res) => {
  authorize(req.headers.authorization).then(user => {
    return knex('users').select('id', 'username');
  }).then(users => {
    success(res, 'users', users)
  }).catch(error => catchError(res, error));
});

function assertExist(array) {
  return doExist(array).then(result => {
    if (result === false) {
      throw {
        status: 400,
        message: "Missing fields"
      };
    }
  });
}

function doExist(array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === undefined) return Promise.resolve(false);
  }
  return Promise.resolve(true);
}

function success(res, name, object) {
  res.status(200).json({
    [name]: object
  });
}

function catchError(res, error) {
  if (error.status === undefined) {
    error.status = 500;
    console.log(error);
  }
  res.status(error.status).json(error);
}

function authorize(token) {
  return validateUser(token, [token]).then(user => {
    return checkUser(user, user !== undefined);
  });
}

function compare(user_id, token) {
  return validateUser(token, [user_id, token]).then(user => {
    return checkUser(user, user !== undefined && parseInt(user_id) === user.id);
  });
}

function validateUser(token, validate) {
  return doExist(validate).then(exist => {
    if (!exist) return undefined;
    return knex('users').where('token', token).first();
  });
}

function checkUser(user, bool) {
  if (bool)
    return user;
  else {
    throw {
      status: 403,
      message: 'Not logged in.'
    };
  }
}
