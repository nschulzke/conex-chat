<template>
  <div class="window">
      <users-list class="left"/>
      <chat class="right"/>
  </div>
</template>

<script>
 import UsersList from './UsersList';
 import Chat from './Chat';
 export default {
   name: 'Window',
   components: {UsersList,Chat},
 }
</script>

<style scoped>
.window {
  display: flex;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.left {
  width: 15rem;
}

.right {
  flex: 1;
}
</style>
