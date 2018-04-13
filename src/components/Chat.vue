<template>
<div class="chat">
  <connecting/>
  <div class="messages" id="messages">
    <div v-for="item in filtered" class="item" v-bind:class="isMe(item) ? 'me' : 'not-me'">
      <p class="idline">
        <span class="user">{{item.username}}</span>
        <span class="time">{{item.sent_at | since}}</span>
      </p>
      <p class="text">{{item.text}}</p>
    </div>
  </div>
  <form v-on:submit.prevent="send" class="sendForm">
    <input type="text" v-model="text" />
    <button class="primary" type="submit" v-bind:disabled="!connected">Send</button>
  </form>
</div>
</template>

<script>
import Connecting from './Connecting';
import moment from 'moment';
export default {
  components: {Connecting},
  name: 'Chat',
  data() {
    return {
      text: '',
    }
  },
  filters: {
    since: function(datetime) {
      moment.locale('en');
      return moment(datetime).format('LT');
    },
  },
  computed: {
    user: function() {
      return this.$store.getters.user;
    },
    openUser: function() {
      return this.$store.getters.openUser;
    },
    messages: function() {
      return this.$store.getters.messages;
    },
    filtered: function() {
      return this.messages.filter((message) =>
        message.from_id === this.openUser.id && message.to_id === this.user.id ||
        message.to_id === this.openUser.id && message.from_id === this.user.id
      );
    },
    connected: function() {
      return this.$store.getters.connected;
    },
  },
  updated: function() {
    var container = this.$el.querySelector("#messages");
    if (container !== undefined)
      container.scrollTop = container.scrollHeight;
  },
  methods: {
    send: function() {
      if (this.connected) {
        this.$store.dispatch('sendMessage', {
          from_id: this.user.id,
          to_id: this.openUser.id,
          text: this.text,
        }).then(tweet => {
          this.text = "";
        });
      }
    },
    isMe: function(item) {
      return this.user.username === item.username;
    },
  },
}
</script>

<style scoped>
.chat {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: white;
  position: relative;
}

.messages {
  flex: 1;
  overflow-y: scroll;
  padding: 0.5rem;
}

.item {
  padding-right: 1rem;
}

.sendForm {
  background: #eee;
  margin-bottom: 10px;
  display: flex;
}

button {
  margin-left: auto;
  height: 2em;
  font-size: 0.9em;
}

p {
  margin: 0;
}

input {
  flex: 1;
}

.idline {
  height: 1.5rem;
}

.user {
  font-weight: bold;
}

.item {
  padding: 1rem;
  border: 1px solid #ddd;
  clear: both;
}

.item:not(:first-child) {
  margin-top: 1rem;
}

.not-me {
  background-color: #aa3939;
  color: white;
  float: left;
  border-radius: 1rem 1rem 1rem 0;
}

.not-me .user {
  float: right;
}

.not-me .time {
  color: #ffbbbb;
  margin-right: 10px;
  float: left;
}

.me {
  background-color: #bbbbbb;
  float: right;
  border-radius: 1rem 1rem 0 1rem;
}

.me .time {
  color: #777777;
  text-align: right;
}

.me .user {
  margin-right: 10px;
  float: left;
}

.me .time {
  float: right;
}
</style>
