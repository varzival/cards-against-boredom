<template>
  <v-app>
    <router-view></router-view>

    <v-footer app v-if="!mobile">
      <div class="footer-text">ERDKERN Productions</div>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, watch } from "vue";
import { createSocket, socket } from "./socket";
import { State, useStore } from "./store/app";
import { useDisplay } from "vuetify";
import { delete_cookie } from "./utils/cookies";

const { mobile } = useDisplay();
const store = useStore();

function initSocket() {
  createSocket(store.name);
  if (!socket.connected) socket.connect();
  socket.on("gameState", (payload: State) => {
    store.setState(payload);
  });

  socket.on("kick", () => {
    store.$reset();
    store.name = ""; // necessary because of vueuse
    delete_cookie("session", "/", window.location.hostname);
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
