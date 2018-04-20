.getAllconst users = require('./db/users');
const messages = require('./db/messages');

// bcrypt setup
const bcrypt = require('bcrypt');
const saltRounds = 10;

const crypto = require('crypto');

// jwt setup
const jwt = require('jsonwebtoken');

let jwtSecret = process.env.JWT_SECRET;
if (jwtSecret === undefined) {
  console.log("You need to define a jwtSecret environment variable to continue.");
  process.exit();
}

module.exports = {
  loginUser: function(api, req) {
    assertExist([req.username, req.password]).then(() => {
      return users.get('username', req.username);
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
      return users.get('username', req.username);
    }).then(user => {
      if (user !== undefined) {
        throw {
          status: 403,
          message: "Username already taken"
        };
      }
      return bcrypt.hash(req.password, saltRounds);
    }).then(hash => {
      return users.create({
        username: req.username,
        hash: hash,
        active: false,
      });
    }).then(ids => {
      return users.get('id', ids[0], ['id', 'username']);
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
      return messages.create(req);
    }).then(ids => {
      return messages.get(ids[0]);
    }).then(message => {
      api.onSuccess('message', message);
    }).catch(error => api.onError(error));
  },

  getMessages: function(api, req) {
    authorize(req.token).then(user => {
      return messages.getAll(user.id);
    }).then(messages => {
      api.onSuccess('messages', messages);
    }).catch(error => api.onError(error));
  },

  getUsers: function(api, req) {
    authorize(req.token).then(user => {
      return users.getAll();
    }).then(users => {
      api.onSuccess('users', users)
    }).catch(error => api.onError(error));
  },

  activateUser: function(api, req) {
    authorize(req.token).then(user => {
      users.update('id', user.id, {
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
    users.update('id', user.id, {
      active: false,
    }).then((result) => {
      api.onSuccess('user', {
        id: user.id,
        username: user.username,
      });
    }).catch(error => console.log(error));
  },

  deactivateAllUsers: function() {
    users.updateAll({
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
      return users.get('id', decoded.id);
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
