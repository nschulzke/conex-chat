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

function getRest(res) {
  return {
    res: res,
    success: function(name, object) {
      this.res.status(200).json({
        [name]: object
      });
    },
    catchError: function(error) {
      if (error.status === undefined) {
        error.status = 500;
        console.log(error);
      }
      this.res.status(error.status).json(error);
    }
  }
}

app.post('/api/login', (req, res) => {
  loginUser(getRest(res), {
    username: req.body.username,
    password: req.body.password,
  });
});

app.post('/api/users', (req, res) => {
  registerUser(getRest(res), {
    username: req.body.username,
    password: req.body.password,
  });
});

app.post('/api/messages', (req, res) => {
  sendMessage(getRest(res), {
    from_id: req.body.from_id,
    to_id: req.body.to_id,
    text: req.body.text,
    sent_at: new Date(),
    token: req.headers.authorization,
  });
});

app.get('/api/messages', (req, res) => {
  getMessages(getRest(res), {
    token: req.headers.authorization,
  });
});

app.get('/api/users', (req, res) => {
  getUsers(getRest(res), {
    token: req.headers.authorization,
  });
});

function loginUser(api, req) {
  assertExist([req.username, req.password]).then(() => {
    return knex('users').where('username', req.username).first();
  }).then(user => {
    if (user === undefined) {
      throw {
        status: 403,
        message: "Invalid credentials"
      };
    }
    return [bcrypt.compare(req.password, user.hash), user];
  }).then(results => {
    result = results[0];
    user = results[1];
    if (!result) {
      throw {
        status: 403,
        message: "Invalid credentials"
      };
    }
    let token = crypto.randomBytes(48).toString('hex')
    knex('users').where('id', user.id).update({
      token: token,
    }).catch(error => console.log(error));
    api.success('user', {
      id: user.id,
      username: user.username,
      token: token,
    });
  }).catch(error => api.catchError(error));
}

function registerUser(api, req) {
  assertExist([req.username, req.password]).then(() => {
    return knex('users').where('username', req.username).first();
  }).then(user => {
    if (user !== undefined) {
      throw {
        status: 403,
        message: "Username already taken"
      };
    }
    return bcrypt.hash(req.password, saltRounds);
  }).then(hash => {
    return knex('users').insert({
      username: req.username,
      hash: hash,
      token: crypto.randomBytes(48).toString('hex'),
    });
  }).then(ids => {
    return knex('users').where('id', ids[0]).first().select('id', 'username', 'token');
  }).then(user => {
    api.success('user', user);
  }).catch(error => api.catchError(error));
}

function sendMessage(api, req) {
  console.log(req);
  compare(req.from_id, req.token).then(user => {
    delete req.token;
    req.sent_at = new Date();
    return knex('messages').insert(req);
  }).then(ids => {
    return knex('messages').where('id', ids[0]).first();
  }).then(message => {
    api.success('message', message);
  }).catch(error => api.catchError(error));
}

function getMessages(api, req) {
  authorize(req.token).then(user => {
    return knex('users').join('messages', 'users.id', 'messages.from_id')
      .where('from_id', user.id).orWhere('to_id', user.id)
      .select('username', 'text', 'sent_at');
  }).then(messages => {
    api.success('messages', messages);
  }).catch(error => api.catchError(error));
}

function getUsers(api, req) {
  authorize(req.token).then(user => {
    return knex('users').select('id', 'username');
  }).then(users => {
    api.success('users', users)
  }).catch(error => api.catchError(error));
}

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
