const model = require('./model');
const api = require('./api');

module.exports = function(api, target, arg) {
  if (api === 'ws') return getWs(target, arg);
}

function getWs(send, ws) {
  let authorized = false;
  return {
    handle: function(msg) {
      try {
        msg = JSON.parse(msg);
        if (!authorized && msg.action !== 'activate') {
          this.unauthorized();
        } else if (this.actions[msg.action] !== undefined && msg.action != 'data') {
          this.actions[msg.action](msg);
        } else {
          this.invalid();
        }
      } catch (e) {
        console.log(e);
        send({
          status: 500,
          message: "Internal server error",
          error: e,
        })
      }
    },
    unauthorized: function() {
      send({
        status: 403,
        message: "Must send activate.",
      });
    },
    invalid: function() {
      send({
        status: 400,
        message: "Invalid action",
      });
    },
    actions: {
      data: {
        user: {},
      },
      activate: function(msg) {
        model.activateUser(
          api('ws', send, 'activated').success((user) => {
            this.data.user = user;
            this.data.user.token = msg.token;
            authorized = true;
          }).error(() => {
            authorized = false;
          }), {
            token: msg.token
          }
        );
      },
      sendMessage: function(msg) {
        model.sendMessage(api('ws', send, 'sentMessage'), {
          from_id: this.data.user.id,
          to_id: msg.to_id,
          text: msg.text,
          sent_at: new Date(),
          token: this.data.user.token,
        });
      }
    }
  }
}
