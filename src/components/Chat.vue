<template>
<div class="messages">
  <div v-for="item in messages" class="item">
    <p class="idline">
      <span class="time">{{item.sent_at | since}}</span>
    </p>
    <p class="tweet">{{item.text}}</p>
  </div>
  <div>
    <form v-on:submit.prevent="send" class="sendForm">
      <textarea v-model="text" placeholder="" /><br/>
      <div class="buttonWrap">
        <button class="primary" type="submit">Send</button>
      </div>
    </form>
  </div>
</div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'Chat',
  data() {
    return {
      text: '',
    }
  },
  created: function() {
    this.$store.dispatch('getMessages');
  },
  filters: {
    since: function(datetime) {
      moment.locale('en');
      return moment(datetime).format('LT');
    },
  },
  computed: {
    messages: function() {
      return this.$store.getters.messages;
    }
  },
  methods: {
    send: function() {
      this.$store.dispatch('sendMessage', {
        from_id: this.$store.getters.user.id,
        to_id: this.$store.getters.user.id,
        text: this.text,
      }).then(tweet => {
        this.text = "";
      });
    },
    isMe: function(id) {
      return this.$store.getters.user.id === id;
    }
  }
}
</script>

<style scoped>
.messages {
  width: 600px;
}

.tweetForm {
  background: #eee;
  padding: 10px;
  margin-bottom: 10px;
}

.buttonWrap {
  width: 100%;
  display: flex;
}

button {
  margin-left: auto;
  height: 2em;
  font-size: 0.9em;
}

textarea {
  width: 100%;
  height: 5em;
  padding: 2px;
  margin-bottom: 5px;
  resize: none;
  box-sizing: border-box;
}

.item {
  border-bottom: 1px solid #ddd;
  padding: 10px;
}

.tweet {
  margin-top: 0px;
}

.idline {
  margin-bottom: 0px;
}

.user {
  font-weight: bold;
  margin-right: 10px;
}

.handle {
  margin-right: 10px;
  color: #666;
}

.time {
  float: right;
  color: #666;
}
</style>
