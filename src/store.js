import Vue from 'vue';
import Vuex from 'vuex';

import axios from 'axios';
import serverConfig from '../server/config'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    user: {},
    loggedIn: false,
    active: false,
    loginError: '',
    registerError: '',
    users: [],
    messages: [],
    socket: {},
    openUser: {},
    connected: true,
  },
  getters: {
    user: state => state.user,
    loggedIn: state => state.loggedIn,
    active: state => state.active,
    loginError: state => state.loginError,
    registerError: state => state.registerError,
    users: state => state.users,
    messages: state => state.messages,
    socket: state => state.socket,
    openUser: state => state.openUser,
    connected: state => state.connected,
  },
  mutations: {
    setUser: (state, user) => {
      state.user = user;
    },
    setLoggedIn: (state, loggedIn) => {
      state.loggedIn = loggedIn;
    },
    setActive: (state, active) => {
      state.active = active;
    },
    setLoginError: (state, error) => {
      state.loginError = error;
    },
    setRegisterError: (state, error) => {
      state.registerError = error;
    },
    setUsers: (state, users) => {
      state.users = users;
      if (state.openUser.id) {
        for (var i = 0; i < state.users.length; i++) {
          if (state.users[i].id === state.openUser.id) {
            state.openUser = state.users[i];
            break;
          }
        }
      }
    },
    setMessages: (state, messages) => {
      state.messages = messages;
    },
    addMessage: (state, message) => {
      state.messages.push(message);
      if (message.username !== state.openUser.username && message.username !== state.user.username)
        state.users.find((user) => user.username === message.username).unread = true;
    },
    setOpenUser: (state, user) => {
      state.openUser = user;
      state.openUser.unread = false;
    },
    setConnected: (state, value) => {
      state.connected = value;
    }
  },
  actions: {
    postUser(context, [endpoint, user, errorType]) {
      axios.post(endpoint, user).then(response => {
        context.commit('setUser', response.data.user);
        context.commit('setLoggedIn', true);
        context.commit('setLoginError', '');
        context.commit('setRegisterError', '');
        context.dispatch('activateWs');
      }).catch(error => {
        context.commit('setLoggedIn', false);
        if (error.response && error.response.data.message) {
          context.commit(errorType, error.response.data.message);
        } else context.commit(errorType, 'Sorry, your request failed. We will look into it.');
      });
    },
    register(context, user) {
      context.dispatch('postUser', ['/api/users', user, 'setRegisterError']);
    },
    login(context, user) {
      context.dispatch('postUser', ['/api/login', user, 'setLoginError']);
    },
    activateWs(context) {
      initWebSocket(context);
    },
    logout(context, user) {
      context.commit('setUser', {});
      context.commit('setLoggedIn', false);
    },
    getMessages(context) {
      axios.get('/api/messages', {
        headers: {
          Authorization: context.state.user.token
        }
      }).then(response => {
        context.commit('setMessages', response.data.messages);
      }).catch(err => {
        console.log('getMessages failed:', err);
      });
    },
    getUsers(context) {
      axios.get('/api/users', {
        headers: {
          Authorization: context.state.user.token
        }
      }).then(response => {
        response.data.users.forEach(user => (user.unread = false))
        context.commit('setUsers', response.data.users.sort((a, b) => {
          if (a.id === context.state.user.id) return -1;
          if (b.id === context.state.user.id) return 1;
          if (a.active && !b.active) return -1;
          if (!a.active && b.active) return 1;
          return (a.username < b.username ? -1 : 1);
        }));
      }).catch(err => {
        console.log('getUsers failed:', err);
      })
    },
    sendMessage(context, message) {
      context.state.socket.send(JSON.stringify({
        action: 'sendMessage',
        from_id: message.from_id,
        to_id: message.to_id,
        text: message.text,
      }));
    },
    openUser(context, user) {
      context.commit('setOpenUser', user);
    },
    logout(context) {
      context.state.socket.close();
      clearInterval(context.state.reconnect);
      context.state.user = {}
      context.state.loggedIn = false
      context.state.active = false
      context.state.loginError = ''
      context.state.registerError = ''
      context.state.users = []
      context.state.messages = []
      context.state.socket = {}
      context.state.openUser = {}
    }
  }
});

function initWebSocket(context) {
  let loc = window.location;
  let ws_uri = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  ws_uri += '//' + loc.hostname + ':' + serverConfig.PORT + '/api/messages';
  context.state.socket = new WebSocket(ws_uri);
  context.state.socket.addEventListener('open', (event) => {
    context.commit('setConnected', true);
    context.state.socket.send(JSON.stringify({
      action: 'activate',
      token: context.state.user.token
    }));
    context.dispatch('getMessages');
  });
  context.state.socket.addEventListener('message', (event) => {
    let data = JSON.parse(event.data);
    if (data.success) {
      if (data.action === 'sentMessage') {
        context.commit('addMessage', data.result);
      } else if (data.action === 'activated' || data.action === 'deactivated') {
        context.dispatch('getUsers');
      }
    } else {
      context.dispatch('logout');
    }
  });
  context.state.socket.addEventListener('close', (event) => {
    clearInterval(context.state.reconnect)
    context.commit('setConnected', false);
    context.state.reconnect = setInterval(() => {
      if (context.state.socket.readyState === WebSocket.CLOSED) {
        initWebSocket(context);
      } else clearInterval(context.state.reconnect);
    }, 5000);
  });
}
