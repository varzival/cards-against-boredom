// Utilities
import { defineStore } from "pinia";

export interface State {
  name: string;
}

export const useStore = defineStore("app", {
  state(): State {
    return {
      name: ""
    };
  },
  actions: {
    setName(name: string) {
      this.name = name;
    }
  }
});
