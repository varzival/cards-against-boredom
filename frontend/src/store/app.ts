// Utilities
import { defineStore } from "pinia";

export interface State {
  name: string;
  players: Array<Player>;
  hand: Array<string>;
  selectedCard: number | null;
}

export interface Player {
  name: string;
  points: number;
}

export const useStore = defineStore("app", {
  state(): State {
    return {
      name: "",
      players: [{ name: "tester", points: 0 }],
      hand: ["Antwort 1", "Antwort 2", "Antwort 3"],
      selectedCard: null
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
