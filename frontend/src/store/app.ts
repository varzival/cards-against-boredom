// Utilities
import { defineStore } from "pinia";

export interface State {
  name: string;
  question: Question;
  players: Array<Player>;
  hand: Array<string>;
  selectedCards: Array<number>;
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
      }
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
