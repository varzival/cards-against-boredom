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
          <v-row :no-gutters="true" v-if="store.question">
            <v-col cols="1"></v-col>
            <v-col>
              <Card :text="store.question?.text" style="margin: 100px 0" />
            </v-col>
          </v-row>
          <v-row
            v-if="
              store.question !== null &&
              store.voteOptions === null &&
              store.voteResult === null
            "
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
            v-if="store.voteOptions !== null && store.voteResult === null"
            v-for="(vote_option, idx) in store.voteOptions"
            :key="idx"
            :class="['vote-option']"
          >
            <v-col cols="1"> </v-col>
            <v-col>
              <VoteOption :cards="vote_option" :idx="idx"> </VoteOption>
            </v-col>
          </v-row>
          <v-row
            v-if="store.voteResult !== null && store.voteOptions !== null"
            v-for="(playerVote, idx) in store.voteResult"
          >
            <v-col cols="1"> </v-col>
            <v-col>
              <div class="player-vote-owner">
                <h2>{{ playerVote.owner }}</h2>
              </div>
              <VoteOption
                :cards="store.voteOptions[playerVote.vote]"
                :idx="idx"
                :selectable="false"
              >
              </VoteOption>
              <div class="player-vote-players">
                <h3>
                  <template
                    v-for="(player, idx) in playerVote.players"
                    :key="player"
                    >{{ player
                    }}{{
                      idx < playerVote.players.length - 1 ? ", " : ""
                    }}</template
                  >
                </h3>
              </div>
            </v-col>
          </v-row>
          <v-row
            v-if="store.voteResult !== null && store.voteOptions !== null"
            justify="center"
            class="continue-btn"
          >
            <v-col cols="1"></v-col>
            <v-btn prepend-icon="mdi-arrow-right">Weiter!</v-btn>
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
import { socket } from "@/socket";
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

  if (store.selectedCards.length >= store.question.card_number) {
    socket.emit("selectCards", { cards: store.selectedCards });
  }
}

const stateText = computed<string>(() => {
  if (store.voteResult) {
    return "Auswertung";
  }
  if (store.voteOptions) {
    if (store.selectedVoteOption !== null) return "Warte auf andere Spieler...";
    else return "Stimme für deinen Favoriten!";
  }
  if (!store.question) return "Warte...";
  const selectCardText =
    store.question.card_number === 1
      ? "Wähle eine Karte!"
      : `Wähle ${store.question.card_number} Karten!`;
  return store.selectedCards.length >= store.question.card_number
    ? "Warte auf andere Spieler..."
    : selectCardText;
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

.player-vote-owner {
  text-align: center;
  margin: 5px;
}

.player-vote-players {
  text-align: center;
  margin: 10px 5px;
}

.continue-btn {
  margin-top: 50px;
}
</style>
