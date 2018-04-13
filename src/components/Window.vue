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
  flex-direction: column;
}

.left {
  height: 10rem;
  width: 100%;
  order: 2;
}

.right {
  flex: 1;
  order: 1;
}

@media only screen and (min-width: 500px) {
  .window {
    flex-direction: row;
  }
  .left {
    height: 100%;
    width: 15rem;
    order: 0;
  }
}
</style>
