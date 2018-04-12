// knex setup
const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];
const knex = require('knex')(config);

// bcrypt setup
const bcrypt = require('bcrypt');
const saltRounds = 10;

const crypto = require('crypto');

module.exports = {
  loginUser: function(api, req) {
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
  },

  registerUser: function(api, req) {
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
  },

  sendMessage: function(api, req) {
    compare(req.from_id, req.token).then(user => {
      delete req.token;
      req.sent_at = new Date();
      return knex('messages').insert(req);
    }).then(ids => {
      return knex('messages').where('id', ids[0]).first();
    }).then(message => {
      api.success('message', message);
    }).catch(error => api.catchError(error));
  },

  getMessages: function(api, req) {
    authorize(req.token).then(user => {
      return knex('users').join('messages', 'users.id', 'messages.from_id')
        .where('from_id', user.id).orWhere('to_id', user.id)
        .select('username', 'text', 'sent_at');
    }).then(messages => {
      api.success('messages', messages);
    }).catch(error => api.catchError(error));
  },

  getUsers: function(api, req) {
    authorize(req.token).then(user => {
      return knex('users').select('id', 'username');
    }).then(users => {
      api.success('users', users)
    }).catch(error => api.catchError(error));
  }
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
