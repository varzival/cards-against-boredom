import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { v4 as uuid } from "uuid";
import { delete_cookie } from "../utils/cookies";

export enum GameState {
  SELECT_CARD = "SELECT_CARD",
  VOTE = "VOTE",
  SHOW_RESULTS = "SHOW_RESULTS"
}
export interface State {
  gameState: GameState;
  name: string;
  uniqueUserId: string;
  alertMessage: AlertMessage;
  showAlert: boolean;
  question: Question | null;
  players: Array<Player>;
  hand: Array<string>;
  selectedCards: Array<number>;
  voteOptions: Array<Array<string>> | null;
  selectedVoteOption: number | null;
  voteResult: Array<PlayerVote> | null;
  readyForNextRound: boolean;
  gameStarted: boolean;
}

export interface AlertMessage {
  title: string;
  message: string;
}

export interface PlayerVote {
  players: Array<string>;
  vote: number;
  owner: string;
}

export interface Player {
  name: string;
  points: number;
  active: boolean;
  selectionMade: boolean;
}

export interface Question {
  text: string;
  card_number: number;
}

// https://stackoverflow.com/q/43080547
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export const useStore = defineStore("app", {
  state(): Overwrite<State, { name: any; uniqueUserId: any }> {
    return {
      name: useStorage("name", ""),
      uniqueUserId: useStorage("uniqueUserId", ""),
      alertMessage: {
        title: "",
        message: ""
      },
      showAlert: false,
      players: [],
      hand: [],
      selectedCards: [],
      question: null,
      gameStarted: false,
      voteOptions: null,
      selectedVoteOption: null,
      voteResult: null,
      readyForNextRound: false,
      gameState: GameState.SELECT_CARD
    };
  },
  actions: {
    reset() {
      this.$reset();
      this.name = ""; // necessary because of vueuse
      this.uniqueUserId = "";
      delete_cookie("session", "/", window.location.hostname);
    },
    setName(name: string) {
      this.name = name;
      this.uniqueUserId = uuid();
    },
    addPlayer(name: string) {
      this.players.push({
        name,
        points: 0,
        active: true,
        selectionMade: false
      });
    },
    setState(payload: State) {
      if (payload.gameState !== undefined) this.gameState = payload.gameState;
      if (payload.players !== undefined) this.players = payload.players;
      if (payload.hand !== undefined) this.hand = payload.hand;
      if (payload.selectedCards !== undefined)
        this.selectedCards = payload.selectedCards;
      if (payload.question !== undefined) this.question = payload.question;
      if (payload.voteOptions !== undefined && payload.voteOptions !== null) {
        this.voteOptions = [];
        for (const voteOpt of payload.voteOptions) {
          this.voteOptions.push(voteOpt);
        }
      }
      if (payload.selectedVoteOption !== undefined)
        this.selectedVoteOption = payload.selectedVoteOption;
      if (payload.voteResult !== undefined)
        this.voteResult = payload.voteResult;
      if (payload.readyForNextRound !== undefined)
        this.readyForNextRound = payload.readyForNextRound;
      if (payload.gameStarted !== undefined)
        this.gameStarted = payload.gameStarted;

      if (payload.gameState === GameState.SHOW_RESULTS) {
        this.selectedCards = [];
        this.selectedVoteOption = null;
      }
    },
    setAlertMessage(title: string, message: string) {
      this.showAlert = true;
      this.alertMessage = {
        title,
        message
      };
      setTimeout(() => {
        this.showAlert = false;
        this.alertMessage = {
          title: "",
          message: ""
        };
      }, 5000);
    }
  },
  getters: {
    pointsForPlayer(state) {
      return (name: string) => {
        if (!state.voteResult) return 0;
        const results = state.voteResult.find((r) => r.owner === name);
        if (!results) return 0;
        return results.players?.filter((p) => p !== name)?.length ?? 0;
      };
    }
  }
});
