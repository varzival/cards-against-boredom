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
            v-if="store.question !== null"
            v-for="(card, idx) in store.hand"
            :key="card"
          >
            <v-col cols="1" align-self="center" class="card-selection-idx">
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
              />
            </v-col>
          </v-row>
          <v-row
            v-if="store.vote_options !== null"
            v-for="(vote_option, idx) in store.vote_options"
            :key="idx"
            :class="['vote-option']"
          >
            <v-col cols="1"> </v-col>
            <v-col>
              <VoteOption :cards="vote_option" :idx="idx"> </VoteOption>
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
import VoteOption from "@/components/VoteOption.vue";
import { useStore } from "@/store/app";
import { computed } from "vue";

const store = useStore();

function selectCard(idx: number) {
  if (!store.question) return;
  if (store.selectedCards.length < store.question.card_number) {
    store.selectedCards.push(idx);
  } else {
    store.selectedCards = [];
    store.selectedCards.push(idx);
  }
}

const stateText = computed<string>(() => {
  if (store.vote_options) {
    if (store.selectedVoteOption !== null) return "Warte auf andere Spieler...";
    else return "Stimme für deinen Favoriten!";
  }
  if (!store.question) return "Warte...";
  return store.selectedCards.length >= store.question.card_number
    ? "Warte auf andere Spieler..."
    : "Wähle eine Karte!";
});

function getSelectedIdx(idx: number): string {
  if (store.question === null || store.question.card_number <= 1) return "";
  const i = store.selectedCards.findIndex((e) => e === idx);
  if (i > -1) return i + 1 + "";
  return "";
}
</script>

<style scoped>
.vote-option {
  margin-bottom: 10px;
}

.card-selection-idx {
  text-align: center;
  font-weight: bold;
  color: red;
}
</style>
