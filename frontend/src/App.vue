<template>
  <v-app>
    <v-alert
      v-model="store.showAlert"
      closable
      :title="store.alertMessage.title"
      :text="store.alertMessage.message"
      type="error"
      style="position: absolute; top: 10vh; right: 5vw; z-index: 9999999"
    >
    </v-alert>

    <router-view></router-view>

    <v-footer app v-if="!mobile">
      <div class="footer-text">
        made by
        <a target="_blank" href="https://github.com/varzival">Varzival</a>
      </div>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from "vue";
import { createSocket, socket } from "./socket";
import { State, useStore } from "./store/app";
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();
const store = useStore();

function initSocket() {
  createSocket(store.name, store.uniqueUserId);

  if (!socket.connected) socket.connect();

  socket.on("gameState", (payload: State) => {
    store.setState(payload);
  });

  socket.on("kick", () => {
    store.reset();
  });

  socket.on("connect_failed", () => {
    console.error("Connection Failed");
    store.reset();
    store.setAlertMessage("Login fehlgeschlagen", "Name existiert bereits");
  });
}

onMounted(() => {
  if (store.name) {
    nextTick(async () => {
      initSocket();
    });
  }
  document.title = `Cards against ${
    import.meta.env.VITE_APP_TITLE ?? "BOREDOM"
  }`;
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
