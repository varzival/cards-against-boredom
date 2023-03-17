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
      players: [{ name: "tester", points: 0 }],
      hand: ["Antwort 1", "Antwort 2", "Antwort 3"],
      selectedCards: [],
      question: {
        text: "Sorry Herr Leherer, aber ich konnte meine Hausaufgaben nicht machen wegen _.",
        card_number: 2
      },
      gameStarted: false,
      //question: null,
      /*voteOptions: [
        ["Ich mag", "Züge"],
        ["123", "Polizei"]
      ],*/
      voteOptions: null,
      selectedVoteOption: null,
      /*voteResult: [
        {
          players: ["Tester 1", "Tester 2"],
          owner: "Tester 3",
          vote: 0
        },
        {
          players: ["Tester 4", "Tester 5", "Tester 6"],
          owner: "Tester 4",
          vote: 1
        }
      ],*/
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
      if (payload.players) this.players = payload.players;
      if (payload.hand) this.hand = payload.hand;
      if (payload.selectedCards) this.selectedCards = payload.selectedCards;
      if (payload.question) this.question = payload.question;
      if (payload.voteOptions) this.voteOptions = payload.voteOptions;
      if (payload.selectedVoteOption)
        this.selectedVoteOption = payload.selectedVoteOption;
      if (payload.voteResult) this.voteResult = payload.voteResult;
      if (payload.readyForNextRound !== undefined)
        this.readyForNextRound = payload.readyForNextRound;
      if (payload.gameStarted !== undefined)
        this.gameStarted = payload.gameStarted;
    }
  }
});
