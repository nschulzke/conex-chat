<template>
<div class="users">
  <h1 class="header">Conex chat</h1>
  <div class="users-list">
    <div v-for="user in users" class="user" v-on:click="selectUser(user)" v-bind:class="classes(user)">
      <span class="marker"></span>
      <span class="name">{{user.username}}</span>
      <span class="me-marker" v-if="isMe(user)">(Me)</span>
    </div>
  </div>
  <a class="logout" href="#" v-on:click.prevent="logout">Logout</a>
  <a class="repo" href="https://github.com/nschulzke/conex-chat" target="_blank">Repository</a>
</div>
</template>

<script>
export default {
  name: 'UsersList',
  created: function() {
    if (this.$store.getters.socket.readyState !== WebSocket.OPEN)
      this.$store.dispatch('activateWs');
  },
  computed: {
    user: function() {
      return this.$store.getters.user;
    },
    users: function() {
      return this.$store.getters.users;
    },
    openUser: function() {
      return this.$store.getters.openUser;
    },
  },
  methods: {
    classes: function(user) {
      let classes = ''
      if (this.isOpen(user)) classes += ' open';
      if (this.isMe(user)) classes += ' me';
      if (user.active) classes += ' active';
      return classes;
    },
    selectUser: function(user) {
      this.$store.dispatch('openUser', user);
    },
    isOpen: function(user) {
      return this.openUser === user ? 'open' : '';
    },
    isMe: function(user) {
      return user.id === this.user.id;
    },
    logout: function() {
      this.$store.dispatch('logout');
    }
  }
}
</script>

<style scoped>
h1.header {
  padding-bottom: 0.5rem;
  margin-bottom: 0;
  margin-top: 0.5rem;
  border-bottom: 1px solid white;
  font-size: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.me-marker {
  color: #999;
}

.users {
  background-color: #003333;
  color: white;
  position: relative;
  padding-bottom: 3rem;
  display: flex;
  flex-direction: column;
}

.users-list {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  overflow-y: auto;
  flex: 1;
}

.logout {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  color: white;
}

.repo {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  color: white;
}

.user {
  padding: 0.2rem;
  line-height: 1.2rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
}

.marker {
  margin: 0.1rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  vertical-align: bottom;
  display: inline-block;
  background-color: gray;
}

.active .marker {
  background-color: #a5c663;
}

.open {
  background-color: #0d4d4d;
  border: 1px solid #002525
}
</style>
