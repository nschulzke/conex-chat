<template>
<div class="welcome">
  <h1 class="head">Conex</h1>
  <h2 class="head">Make new connections!</h2>
  <div class="main">
    <p>
      Conex is a chat app, a simple one right now. To get started, log in or create an account below!
    </p>
    <div class="cols">
      <div class="col">
        <h2>Log in</h2>
        <form v-on:submit.prevent="login">
          <input v-model="loginUsername" placeholder="User Name">
          <input type="password" v-model="loginPassword" placeholder="Password">
          <button type="submit">Log in</button>
        </form>
        <div class="error" v-html="loginError"></div>
      </div>
      <div class="col">
        <h2>Register</h2>
        <form v-on:submit.prevent="register">
          <input v-model="registerUsername" placeholder="User Name">
          <input type="password" v-model="registerPassword" placeholder="Password">
          <input type="password" v-model="confirmPassword" placeholder="Confirm password">
          <button type="submit">Register</button>
        </form>
        <div class="error" v-html="registerError"></div>
      </div>
      <a class="repo" href="https://github.com/nschulzke/conex-chat" target="_blank">Repository</a>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'WelcomePage',
  data() {
    return {
      registerUsername: '',
      registerPassword: '',
      confirmPassword: '',
      loginUsername: '',
      loginPassword: '',
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
        username: this.loginUsername,
        password: this.loginPassword,
      });
    },
    register: function() {
      if (this.registerPassword !== this.confirmPassword)
        this.$store.commit('setRegisterError', 'Passswords must match');
      else {
        this.$store.dispatch('register', {
          username: this.registerUsername,
          password: this.registerPassword,
        });
      }
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

.main {
  margin-top: 1rem;
  border: 1px solid black;
  background-color: white;
  border-radius: 1rem;
  min-height: 20rem;
  position: relative;
}

.main p {
  text-align: center;
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

input {
  width: 100%;
}

.repo {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}
</style>
