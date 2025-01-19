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
import client from "./socket/colyseus";
import { useStore } from "./store/app";
import { useDisplay } from "vuetify";
import isAdminCheck from "./utils/adminCheck";

const { mobile } = useDisplay();
const store = useStore();

async function initSocket() {
  if (!client.connected) {
    await client.connect(store.name);
  }
  // TODO handle connection error, handle name already taken

  client.room!.onStateChange((state) => {
    const players = Array.from(state.users.values() as any[]);
    store.setState({
      players: players.map((p) => {
        return {
          name: p.name,
          points: p.points,
          active: true,
          selectionMade: false
        };
      })
    });
  });

  client.room!.onError((code, message) => {
    console.error(`[colyseus] ${code} - ${message}`);
  });

  client.room!.onLeave(() => {
    console.log("room left");
    store.reset();
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
  isAdminCheck();
});

watch(
  () => store.name,
  (newValue) => {
    if (newValue && !client.connected) {
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
