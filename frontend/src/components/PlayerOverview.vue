<template>
  <v-navigation-drawer app>
    <v-list>
      <v-list-item v-for="player in store.players" :key="player.name">
        {{ player.name }} - {{ player.points }}
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { useStore } from "@/store/app";

const store = useStore();
</script>
