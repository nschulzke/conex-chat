<template>
<div class="column">
  <h1>Chat with friends!</h1>
  <h2>Log in</h2>
  <form v-on:submit.prevent="login">
    <input class="narrow" v-model="username" placeholder="User Name">
    <input class="narrow" type="password" v-model="password" placeholder="Password">
    <button class="alternate" type="submit">Log in</button>
  </form>
  <h2>Register</h2>
  <form v-on:submit.prevent="register">
    <input class="narrow" v-model="username" placeholder="User Name">
    <input class="narrow" type="password" v-model="password" placeholder="Password">
    <button class="alternate" type="submit">Register</button>
  </form>
  <p class="error">{{registerError}}</p>
</div>
</template>

<script>
export default {
  name: 'WelcomePage',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      name: '',
    }
  },
  computed: {
    registerError: function() {
      return this.$store.getters.registerError;
    },
  },
  methods: {
    login: function() {
      this.$store.dispatch('login', {
        username: this.username,
        password: this.password,
      });
    },
    register: function() {
      this.$store.dispatch('register', {
        username: this.username,
        password: this.password,
      });
    }
  }
}
</script>

<style scoped>
h1 {
  margin-bottom: 0;
}

h2 {
  font-size: 1.2em;
  font-weight: normal;
  margin-top: 2rem;
  margin-bottom: 0;
}

.narrow {
  width: 170px;
}

.wide {
  width: 370px;
}
</style>
