<template>
  <PlayerOverview></PlayerOverview>

  <v-app-bar app>
    <h1 style="margin-left: auto; margin-right: auto">{{ stateText }}</h1>
  </v-app-bar>

  <v-main>
    <v-container fluid>
      <v-row>
        <v-spacer></v-spacer>
        <v-col cols="auto">
          <Card
            text="Sorry Herr Leherer, aber ich konnte meine Hausaufgaben nicht machen wegen _."
            style="margin: 100px 0"
          />
          <Card
            v-for="(card, idx) in store.hand"
            :text="card"
            light
            selectable
            :faded="store.selectedCard !== null && store.selectedCard !== idx"
            @click="selectCard(idx)"
            :ripple="false"
          />
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import Card from "@/components/Card.vue";
import PlayerOverview from "@/components/PlayerOverview.vue";
import { useStore } from "@/store/app";
import { computed } from "vue";

const store = useStore();

function selectCard(idx: number) {
  store.selectedCard = idx;
}

const stateText = computed(() => {
  return store.selectedCard !== null
    ? "Warte auf andere Spieler..."
    : "Wähle eine Karte!";
});
</script>

<style scoped></style>
