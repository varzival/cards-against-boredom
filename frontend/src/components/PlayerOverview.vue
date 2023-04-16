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
            <v-btn
              v-if="!(player.name === store.name) && admin"
              icon
              variant="outlined"
              size="small"
              color="red"
              class="mr-2"
              @click="kick(player.name)"
              ><v-icon icon="mdi-karate"></v-icon
            ></v-btn>
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
import { delete_cookie } from "@/utils/cookies";

const store = useStore();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const { modelValue, admin } = defineProps<{
  modelValue: boolean;
  admin: boolean;
}>();

function logout() {
  socket.emit("logout");
  store.$reset();
  store.name = ""; // necessary because of vueuse
  delete_cookie("session", "/", window.location.hostname);
}

async function kick(name: string) {
  await fetch("/api/game/kick", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name
    })
  });
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
  align-items: center;
}
</style>
