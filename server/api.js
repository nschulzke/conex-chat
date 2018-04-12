module.exports = function(api, target, arg) {
  if (api === 'rest') return getRest(target);
  if (api === 'ws') return getWs(target, arg);
  if (api == 'null') return getNull();
}

function getRest(res) {
  return {
    res: res,
    _success: () => {},
    _error: () => {},
    onSuccess: function(name, object) {
      this._success(object);
      this.res.status(200).json({
        [name]: object
      });
    },
    onError: function(error) {
      if (error.status === undefined) {
        error.status = 500;
        console.log(error);
      }
      this._error(error);
      this.res.status(error.status).json(error);
    },
    success: function(callback) {
      this._success = callback;
      return this;
    },
    error: function(callback) {
      this._error = callback;
      return this;
    },
  }
}

function getWs(send, action) {
  return {
    send: send,
    action: action,
    _success: () => {},
    _error: () => {},
    onSuccess: function(name, object) {
      this.send({
        action: this.action,
        success: true,
        result: object
      });
      this._success(object);
    },
    onError: function(error) {
      console.log(error);
      this._error(error);
      this.send({
        action: this.action,
        success: false,
        error: error
      })
    },
    success: function(callback) {
      this._success = callback;
      return this;
    },
    error: function(callback) {
      this._error = callback;
      return this;
    }
  }
}

function getNull() {
  return {
    onSuccess: () => {},
    onError: () => {},
  }
}
