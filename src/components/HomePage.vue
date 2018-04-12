<template>
  <div>
    <div class="error" v-html="error"></div>
    <div v-if="loggedIn">
      <chat/>
    </div>
    <div v-else>
      <welcome-page/>
    </div>
  </div>
</template>

<script>
 import WelcomePage from './WelcomePage';
 import Chat from './Chat';
 export default {
   name: 'HomePage',
   components: {WelcomePage,Chat},
   computed: {
     loggedIn: function() {
       return this.$store.getters.loggedIn;
     },
     error: function() {
       return this.$store.getters.error;
     }
   },
 }
</script>

<style scoped>
.error {
  color: red;
}
</style>
