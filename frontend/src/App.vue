<template>
  <v-app>
    <router-view></router-view>

    <v-footer app>
      <div class="footer-text">ERDKERN Productions</div>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, watch } from "vue";
import { createSocket, socket } from "./socket";
import { State, useStore } from "./store/app";

const store = useStore();

function initSocket() {
  createSocket(store.name);
  if (!socket.connected) socket.connect();
  socket.on("gameState", (payload: State) => {
    store.setState(payload);
  });
}

onMounted(() => {
  if (store.name) {
    nextTick(async () => {
      initSocket();
    });
  }
});

watch(
  () => store.name,
  (newValue) => {
    if (newValue && !socket.connected) {
      initSocket();
    }
  }
);
</script>

<style scoped>
.footer-text {
  margin-left: auto;
}

h1 {
  margin-left: 20px;
}
</style>
