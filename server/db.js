// knex setup
const env = process.env.NODE_ENV || 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);

// bcrypt setup
const bcrypt = require('bcrypt');
const saltRounds = 10;

const crypto = require('crypto');

// jwt setup
const jwt = require('jsonwebtoken');

let jwtSecret = process.env.JWT_SECRET;
if (jwtSecret === undefined) {
  console.log("You need to define a jwtSecret environment variable to continue.");
  knex.destroy();
  process.exit();
}

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
      return Promise.all([bcrypt.compare(req.password, user.hash), user]);
    }).then(([result, user]) => {
      if (!result) {
        throw {
          status: 403,
          message: "Invalid credentials"
        };
      }
      let token = jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: 86400 // expires in 24 hours
      });
      api.onSuccess('user', {
        id: user.id,
        username: user.username,
        token: token,
      });
    }).catch(error => api.onError(error));
  },

  registerUser: function(api, req) {
    assertExist([req.username, req.password]).then(() => {
      if (req.username.length < 4 || /[\s\t\n]/g.test(req.username)) {
        throw {
          status: 400,
          message: "Invalid username: must be at least four characters and cannot contain whitespace"
        }
      }
      if (req.password.length < 4) {
        throw {
          status: 400,
          message: "Invalid password: must be at least four characters"
        }
      }
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
        active: false,
      });
    }).then(ids => {
      return knex('users').where('id', ids[0]).first().select('id', 'username');
    }).then(user => {
      user.token = jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: 86400 // expires in 24 hours
      });
      api.onSuccess('user', user);
    }).catch(error => api.onError(error));
  },

  sendMessage: function(api, req) {
    compare(req.from_id, req.token).then(user => {
      delete req.token;
      req.sent_at = new Date();
      return knex('messages').insert(req);
    }).then(ids => {
      return knex('users').join('messages', 'users.id', 'messages.from_id')
        .where('messages.id', ids[0]).select('username', 'text', 'sent_at', 'from_id', 'to_id').first();
    }).then(message => {
      api.onSuccess('message', message);
    }).catch(error => api.onError(error));
  },

  getMessages: function(api, req) {
    authorize(req.token).then(user => {
      return knex('users').join('messages', 'users.id', 'messages.from_id')
        .where('from_id', user.id).orWhere('to_id', user.id)
        .select('username', 'text', 'sent_at', 'from_id', 'to_id');
    }).then(messages => {
      api.onSuccess('messages', messages);
    }).catch(error => api.onError(error));
  },

  getUsers: function(api, req) {
    authorize(req.token).then(user => {
      return knex('users').select('id', 'username', 'active');
    }).then(users => {
      api.onSuccess('users', users)
    }).catch(error => api.onError(error));
  },

  activateUser: function(api, req) {
    authorize(req.token).then(user => {
      knex('users').where('id', user.id).update({
        active: true,
      }).then((cols) => {
        if (cols === 1) {
          api.onSuccess('user', {
            id: user.id,
            username: user.username,
            active: true,
          });
        }
      }).catch(error => api.onError(error));
    }).catch(error => api.onError(error));
  },

  deactivateUser: function(api, user) {
    knex('users').where('id', user.id).update({
      active: false,
    }).then((result) => {
      api.onSuccess('user', {
        id: user.id,
        username: user.username,
      });
    }).catch(error => console.log(error));
  },

  deactivateAllUsers: function() {
    knex('users').update({
      active: false,
    }).catch(error => console.log(error));
  },
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
    if (array[i] === undefined || array[i] === '') return Promise.resolve(false);
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
    let decoded = jwt.verify(token, jwtSecret);
    if (decoded.id)
      return knex('users').where('id', decoded.id).first();
    else return undefined;
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
