<template>
  <div class="container">
    <div v-if="loggedIn" class="main">
      <window/>
    </div>
    <div v-else class="main">
      <welcome-page/>
    </div>
  </div>
</template>

<script>
 import WelcomePage from './WelcomePage';
 import Window from './Window';
 export default {
   name: 'HomePage',
   components: {WelcomePage,Window},
   computed: {
     loggedIn: function() {
       return this.$store.getters.loggedIn;
     }
   },
 }
</script>

<style scoped>
.container {
  height: 100%;
  background-color: #002222;
}

.main {
  height: 100%;
}
</style>
