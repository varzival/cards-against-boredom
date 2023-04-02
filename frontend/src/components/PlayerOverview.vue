<template>
  <v-navigation-drawer app>
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

function logout() {
  socket.emit("logout");
  store.$reset();
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
