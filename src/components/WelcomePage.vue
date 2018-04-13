<template>
<div class="welcome">
  <h1 class="head">Conex</h1>
  <h2 class="head">Make new connections!</h2>
  <div class="cols">
    <div class="col">
      <div class="error" v-html="loginError"></div>
      <h2>Log in</h2>
      <form v-on:submit.prevent="login">
        <input v-model="lUsername" placeholder="User Name">
        <input type="password" v-model="lPassword" placeholder="Password">
        <button type="submit">Log in</button>
      </form>
    </div>
    <div class="col">
      <div class="error" v-html="registerError"></div>
      <h2>Register</h2>
      <form v-on:submit.prevent="register">
        <input v-model="rUsername" placeholder="User Name">
        <input type="password" v-model="rPassword" placeholder="Password">
        <button type="submit">Register</button>
      </form>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'WelcomePage',
  data() {
    return {
      rUsername: '',
      rPassword: '',
      lUsername: '',
      lPassword: '',
    }
  },
  computed: {
    registerError: function() {
      return this.$store.getters.registerError;
    },
    loginError: function() {
      return this.$store.getters.loginError;
    },
    registerError: function() {
      return this.$store.getters.registerError;
    },
  },
  methods: {
    login: function() {
      this.$store.dispatch('login', {
        username: this.lUsername,
        password: this.lPassword,
      });
    },
    register: function() {
      this.$store.dispatch('register', {
        username: this.rUsername,
        password: this.rPassword,
      });
    }
  }
}
</script>

<style scoped>
.welcome {
  max-width: 800px;
  background-color: white;
  margin: 0 auto;
  padding: 1rem;
  height: 100%;
  background-color: #003333;
}

.head {
  text-align: center;
  color: white;
}

h1 {
  margin-bottom: 0;
  margin-top: 0;
}
h2.head {
  margin-top: 0;
}

.error {
  color: red;
  height: 1rem;
  margin-top: 1rem;
}

h2 {
  font-size: 1.2em;
  font-weight: normal;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.narrow {
  width: 170px;
}

.wide {
  width: 370px;
}

.cols {
  margin-top: 1rem;
  border: 1px solid black;
  background-color: white;
  border-radius: 1rem;
  min-height: 20rem;
}

.col {
  padding-left: 1rem;
  padding-right: 1rem;
}

@media only screen and (min-width: 600px) {
  .cols {
    display: flex;
  }

  .col {
    flex: 1;
  }
}

input,
button {
  display: block;
  margin-top: 0.5rem;
}

form {
  margin-bottom: 2rem;
}

input {
  width: 100%;
}
</style>
