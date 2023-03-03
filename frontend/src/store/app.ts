// Utilities
import { defineStore } from "pinia";

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
      /*question: {
        text: "Sorry Herr Leherer, aber ich konnte meine Hausaufgaben nicht machen wegen _.",
        card_number: 2
      },*/
      question: null,
      voteOptions: [
        ["Ich mag", "Züge"],
        ["123", "Polizei"]
      ],
      //voteOptions: null,
      selectedVoteOption: null,
      voteResult: [
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
      ],
      readyForNextRound: false
    };
  },
  actions: {
    setName(name: string) {
      this.name = name;
    },
    addPlayer(name: string) {
      this.players.push({ name, points: 0 });
    }
  }
});
