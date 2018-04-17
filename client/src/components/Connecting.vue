<template>
  <div class="message" v-if="!connected">
    Connecting...
  </div>
</template>

<script>
 export default {
   name: 'Connecting',
   computed: {
     connected: function() {
       return this.$store.getters.connected;
     },
   }
 }
</script>

<style scoped>
.message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2rem;
  line-height: 2rem;
  text-align: center;
  background-color: gray;
}
</style>
