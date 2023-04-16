<template>
  <v-navigation-drawer
    app
    :modelValue="modelValue"
    @update:modelValue="(newValue) => emit('update:modelValue', newValue)"
  >
    <div class="container">
      <v-list>
        <v-list-item v-for="player in store.players" :key="player.name">
          <div class="player-row">
            <v-icon icon="mdi-wifi-off" v-if="!player.active"></v-icon>
            <span class="ml-2">{{ player.name }}</span>
            <v-icon
              icon="mdi-check"
              color="green"
              class="ml-2"
              v-if="player.selectionMade"
            ></v-icon>
            <span class="ml-auto">{{ player.points }}</span>
          </div>
        </v-list-item>
      </v-list>
      <div class="ml-auto mr-auto mb-5">
        <v-btn append-icon="mdi-door-open" color="#440000" @click="logout"
          >Logout</v-btn
        >
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { useStore } from "@/store/app";
import { socket } from "@/socket";

const store = useStore();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const { modelValue } = defineProps<{ modelValue: boolean }>();

function get_cookie(name: string) {
  return document.cookie.split(";").some((c) => {
    return c.trim().startsWith(name + "=");
  });
}

function delete_cookie(name: string, path: string, domain: string) {
  if (get_cookie(name)) {
    document.cookie =
      name +
      "=" +
      (path ? ";path=" + path : "") +
      (domain ? ";domain=" + domain : "") +
      ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }
}

function logout() {
  socket.emit("logout");
  store.$reset();
  store.name = ""; // necessary because of vueuse
  delete_cookie("session", "/", window.location.hostname);
}
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.player-row {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
</style>
