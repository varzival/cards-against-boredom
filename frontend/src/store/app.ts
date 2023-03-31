// Utilities
import { defineStore } from "pinia";
import { uptime } from "process";

export interface State {
  name: string;
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

export interface PlayerVote {
  players: Array<string>;
  vote: number;
  owner: string;
}

export interface Player {
  name: string;
  points: number;
}

export interface Question {
  text: string;
  card_number: number;
}

export const useStore = defineStore("app", {
  state(): State {
    return {
      name: "new_player",
      players: [],
      hand: [],
      selectedCards: [],
      question: null,
      gameStarted: false,
      voteOptions: null,
      selectedVoteOption: null,
      voteResult: null,
      readyForNextRound: false
    };
  },
  actions: {
    setName(name: string) {
      this.name = name;
    },
    addPlayer(name: string) {
      this.players.push({ name, points: 0 });
    },
    setState(payload: State) {
      if (payload.players !== undefined) this.players = payload.players;
      if (payload.hand !== undefined) this.hand = payload.hand;
      if (payload.selectedCards !== undefined)
        this.selectedCards = payload.selectedCards;
      if (payload.question !== undefined) this.question = payload.question;
      if (payload.voteOptions !== undefined)
        this.voteOptions = payload.voteOptions;
      if (payload.selectedVoteOption !== undefined)
        this.selectedVoteOption = payload.selectedVoteOption;
      if (payload.voteResult !== undefined)
        this.voteResult = payload.voteResult;
      if (payload.readyForNextRound !== undefined)
        this.readyForNextRound = payload.readyForNextRound;
      if (payload.gameStarted !== undefined)
        this.gameStarted = payload.gameStarted;
    }
  }
});
