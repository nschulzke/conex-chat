import Vue from 'vue';
import Vuex from 'vuex';

import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    loggedIn: false,
    active: false,
    error: '',
    users: [],
    messages: [],
    socket: {},
  },
  getters: {
    user: state => state.user,
    loggedIn: state => state.loggedIn,
    active: state => state.active,
    error: state => state.error,
    users: state => state.users,
    messages: state => state.messages,
    socket: state => state.socket,
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
    setError: (state, error) => {
      state.error = error;
    },
    setUsers: (state, users) => {
      state.users = users;
    },
    setMessages: (state, messages) => {
      state.messages = messages;
    },
    addMessage: (state, message) => {
      state.messages.push(message);
    }
  },
  actions: {
    register(context, user) {
      axios.post('/api/users', user).then(response => {
        context.commit('setUser', response.data.user);
        context.commit('setLoggedIn', true);
        context.commit('setError', '');
      }).catch(error => {
        context.commit('setLoggedIn', false);
        if (error.response && error.response.data.message) {
          context.commit('setError', error.response.data.message);
        } else context.commit('setError', 'Sorry, your request failed. We will look into it.');
      });
    },
    login(context, user) {
      axios.post('/api/login', user).then(response => {
        context.commit('setUser', response.data.user);
        context.commit('setLoggedIn', true);
        context.commit('setError', '');
        context.dispatch('getMessages');
        context.dispatch('getUsers');
        context.dispatch('activateWs');
      }).catch(error => {
        context.commit('setLoggedIn', false);
        if (error.response && error.response.data.message) {
          context.commit('setError', error.response.data.message);
        } else context.commit('setError', 'Sorry, your request failed. We will look into it.');
      });
    },
    activateWs(context) {
      initWebSocket(context);
      let timer = setInterval(() => {
        if (context.state.socket.readyState !== WebSocket.OPEN)
          initWebSocket(context);
      }, 5000);
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
        context.commit('setUsers', response.data.users);
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
  }
});

function initWebSocket(context) {
  console.log("Initializing WebSocket");
  context.state.socket = new WebSocket('ws://localhost:3000/api/messages');
  context.state.socket.addEventListener('open', (event) => {
    context.state.socket.send(JSON.stringify({
      action: 'activate',
      token: context.state.user.token
    }));
  });
  context.state.socket.addEventListener('message', (event) => {
    let data = JSON.parse(event.data);
    if (data.action == 'sentMessage') {
      context.commit('addMessage', data.result);
    }
  });
}
