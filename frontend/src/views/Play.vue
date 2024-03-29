<template>
  <AppBar :text="stateText" :admin="false" :hideTabs="true"></AppBar>

  <v-main>
    <v-container fluid>
      <v-row>
        <v-col lg="3" cols="1"></v-col>
        <v-col lg="6" cols="10">
          <Transition name="card" mode="out-in" appear>
            <v-row
              :no-gutters="true"
              v-if="store.displayLogic().question"
              :key="store.question?.text"
            >
              <v-col cols="1"></v-col>
              <v-col>
                <Card
                  :text="store.question?.text"
                  :light="false"
                  :selectable="false"
                  :faded="false"
                  style="margin: 100px auto"
                />
              </v-col>
            </v-row>
          </Transition>
          <TransitionGroup name="card" appear>
            <v-row
              v-if="store.displayLogic().hand && store.question"
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
          </TransitionGroup>
          <TransitionGroup name="card" appear>
            <v-row
              v-if="store.displayLogic().voteOptions && store.voteOptions"
              v-for="(vote_option, idx) in store.voteOptions"
              :key="idx"
              :class="['vote-option']"
            >
              <v-col cols="1"> </v-col>
              <v-col>
                <VoteOption :cards="vote_option" :idx="idx" @vote="vote(idx)">
                </VoteOption>
              </v-col>
            </v-row>
          </TransitionGroup>
          <TransitionGroup name="card" appear>
            <v-row
              v-if="store.displayLogic().voteResult && store.voteOptions"
              v-for="(playerVote, idx) in store.voteResult"
            >
              <v-col cols="1"> </v-col>
              <v-col>
                <div class="player-vote-owner">
                  <h2>
                    {{
                      `${playerVote.owner} - ${pointsForPlayer(
                        playerVote.owner
                      )} Punkt${
                        pointsForPlayer(playerVote.owner) !== 1 ? "e" : ""
                      }`
                    }}
                  </h2>
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
                      >{{ player }}
                      {{ player === playerVote.owner ? " (Unerde!) " : "" }}
                      {{
                        idx < playerVote.players.length - 1 ? ", " : ""
                      }}</template
                    >
                  </h3>
                </div>
              </v-col>
            </v-row>
          </TransitionGroup>
          <v-row
            v-if="store.displayLogic().continue"
            justify="center"
            class="continue-btn"
          >
            <v-col cols="1"></v-col>
            <v-btn prepend-icon="mdi-arrow-right" @click="continuePlay()"
              >Weiter!</v-btn
            >
          </v-row>
        </v-col>
        <v-col lg="3" cols="1"></v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import Card from "@/components/Card.vue";
import VoteOption from "@/components/VoteOption.vue";
import { socket } from "@/socket";
import { useStore, GameState } from "@/store/app";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import AppBar from "@/components/AppBar.vue";

const store = useStore();
const { pointsForPlayer } = storeToRefs(store);

function selectCard(idx: number) {
  if (!store.question) return;
  if (store.selectedCards.length < store.question.card_number) {
    if (store.selectedCards.includes(idx)) store.selectedCards = [];
    store.selectedCards.push(idx);
  } else {
    store.selectedCards = [];
    store.selectedCards.push(idx);
  }

  if (store.selectedCards.length >= store.question.card_number) {
    socket.emit("selectCards", { cards: store.selectedCards });
  }
}

function vote(idx: number) {
  store.selectedVoteOption = idx;
  socket.emit("vote", { voteOption: store.selectedVoteOption });
}

function continuePlay() {
  socket.emit("continue");
}

const stateText = computed<string>(() => {
  if (store.gameState === GameState.SHOW_RESULTS) {
    return "Auswertung";
  }
  if (store.gameState === GameState.VOTE) {
    if (store.selectedVoteOption !== null) return "Warte auf andere Spieler...";
    else return "Stimme für deinen Favoriten!";
  }
  if (!store.question)
    return "Warte..." + (!store.gameStarted ? " Lobby füllt sich..." : "");
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

.card-enter-active {
  animation: bounce-in 0.5s;
}

.card-leave-active {
  position: relative;
  animation: fade-left 0.5s;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fade-left {
  0% {
    right: 0;
    opacity: 1;
  }
  100% {
    opacity: 0;
    right: 300px;
  }
}
</style>
