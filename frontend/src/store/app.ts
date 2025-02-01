import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { delete_cookie } from "../utils/cookies";
import { v4 as uuid } from "uuid";

export enum GameState {
  SELECT_CARD = "SELECT_CARD",
  VOTE = "VOTE",
  SHOW_RESULTS = "SHOW_RESULTS"
}
export interface State {
  gameState: GameState;
  presentersMode: boolean;
  isAdmin: boolean;
  alertMessage: AlertMessage;
  showAlert: boolean;
  question: Question | null;
  players: Array<Player>;
  hand: Array<Card>;
  selectedCards: Array<number>;
  voteOptions: Array<Array<string>> | null;
  selectedVoteOption: number | null;
  voteResults: Array<PlayerVote> | null;
  readyForNextRound: boolean;
  startedAt: string | null;
}

export interface DisplayLogic {
  question: boolean;
  hand: boolean;
  voteOptions: boolean;
  voteResult: boolean;
  continue: boolean;
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
  voted: boolean;
  continue: boolean;
  selected: boolean;
}

export interface Card {
  text: string;
}

export interface Question {
  text: string;
  num: number;
}

// https://stackoverflow.com/q/43080547
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export const useStore = defineStore("app", {
  state(): Overwrite<
    State,
    { name: any; reconnectionToken: any; uniqueId: any }
  > {
    return {
      name: useStorage("name", ""),
      reconnectionToken: useStorage("reconnectionToken", ""),
      uniqueId: useStorage("uniqueId", ""),
      isAdmin: false,
      alertMessage: {
        title: "",
        message: ""
      },
      showAlert: false,
      players: [],
      hand: [],
      selectedCards: [],
      question: null,
      startedAt: null,
      voteOptions: null,
      selectedVoteOption: null,
      voteResults: null,
      readyForNextRound: false,
      gameState: GameState.SELECT_CARD,
      presentersMode: false
    };
  },
  actions: {
    reset() {
      this.$reset();
      this.name = ""; // necessary because of vueuse.
      this.reconnectionToken = "";
      this.uniqueId = "";
      delete_cookie("session", "/");
    },
    setName(name: string) {
      this.uniqueId = uuid();
      this.name = name;
    },
    setReconnectionToken(reconnectionToken: string) {
      this.reconnectionToken = reconnectionToken;
    },
    setIsAdmin(isAdmin: boolean) {
      this.isAdmin = isAdmin;
    },
    // TODO import state typing from colyseus server
    setState(payload: Partial<State>) {
      if (payload.gameState !== undefined) this.gameState = payload.gameState;
      if (payload.presentersMode !== undefined)
        this.presentersMode = payload.presentersMode;
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
      if (payload.voteResults !== undefined)
        this.voteResults = payload.voteResults;
      if (payload.readyForNextRound !== undefined)
        this.readyForNextRound = payload.readyForNextRound;

      this.startedAt = payload.startedAt ?? null;

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
    gameStarted(state) {
      return !!state.startedAt;
    },
    pointsForPlayer(state) {
      return (name: string) => {
        if (!state.voteResults) return 0;
        const results = state.voteResults.find((r) => r.owner === name);
        if (!results) return 0;
        return results.players?.filter((p) => p !== name)?.length ?? 0;
      };
    },
    playersReady(state) {
      if (state.gameState === GameState.SELECT_CARD) {
        return state.players.map((p) => ({ name: p.name, ready: p.selected }));
      } else if (state.gameState === GameState.VOTE) {
        return state.players.map((p) => ({ name: p.name, ready: p.voted }));
      } else if (state.gameState === GameState.SHOW_RESULTS) {
        return state.players.map((p) => ({ name: p.name, ready: p.continue }));
      }
      return [];
    },
    displayLogic(state) {
      let displayLogic: DisplayLogic;

      displayLogic = {
        question: !!state.question,
        hand:
          state.gameState === GameState.SELECT_CARD &&
          !!state.question &&
          (!state.presentersMode || !state.isAdmin),
        voteOptions:
          state.gameState === GameState.VOTE &&
          !!state.voteOptions?.length &&
          (!state.presentersMode || state.isAdmin),
        voteResult:
          state.gameState === GameState.SHOW_RESULTS &&
          !!state.voteResults?.length &&
          !!state.voteOptions?.length,
        continue:
          state.gameState === GameState.SHOW_RESULTS &&
          !!state.voteResults?.length &&
          !!state.voteOptions?.length &&
          (!state.presentersMode || state.isAdmin)
      };

      return () => displayLogic;
    }
  }
});
