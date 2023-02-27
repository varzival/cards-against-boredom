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
          <v-row :no-gutters="true">
            <v-col cols="1"></v-col>
            <v-col>
              <Card
                text="Sorry Herr Leherer, aber ich konnte meine Hausaufgaben nicht machen wegen _."
                style="margin: 100px 0"
              />
            </v-col>
          </v-row>
          <v-row
            v-for="(card, idx) in store.hand"
            :key="card"
            :no-gutters="true"
          >
            <v-col cols="1" align-self="center" style="text-align: center">
              <h3>{{ getSelectedIdx(idx) }}</h3>
            </v-col>
            <v-col>
              <Card
                :text="card"
                light
                selectable
                :faded="
                  store.selectedCards.length >= store.question.card_number &&
                  !store.selectedCards.includes(idx)
                "
                @click="selectCard(idx)"
                :ripple="false"
              />
            </v-col>
          </v-row>
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
  if (store.selectedCards.length < store.question.card_number) {
    store.selectedCards.push(idx);
  } else {
    store.selectedCards = [];
    store.selectedCards.push(idx);
  }
}

const stateText = computed<string>(() => {
  return store.selectedCards.length >= store.question.card_number
    ? "Warte auf andere Spieler..."
    : "Wähle eine Karte!";
});

function getSelectedIdx(idx: number): string {
  if (store.question.card_number <= 1) return "";
  const i = store.selectedCards.findIndex((e) => e === idx);
  if (i > -1) return i + 1 + "";
  return "";
}
</script>

<style scoped></style>
