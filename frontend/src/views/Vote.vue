<template>
  <PlayerOverview></PlayerOverview>

  <v-app-bar app>
    <h1 style="margin-left: auto; margin-right: auto">Auswertung</h1>
  </v-app-bar>

  <v-main>
    <v-container fluid> </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import Card from "@/components/Card.vue";
import PlayerOverview from "@/components/PlayerOverview.vue";
import { useStore } from "@/store/app";

const store = useStore();
</script>

<style scoped></style>
