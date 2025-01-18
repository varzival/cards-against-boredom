import { Room, Client } from "@colyseus/core";
import { Card, GameRoomState, Question, User } from "./schema/GameRoomState";
import { CardModel, QuestionModel } from "../mongodb/schemas";

export interface IUserOptions {
  name: string;
}

function shuffle(array: Array<any>) {
  for (let i = array.length - 1; i > 0; i--) {
    // Fisher-Yates shuffle

    // Pick a random index from 0 to i inclusive
    let j = Math.floor(Math.random() * (i + 1));

    // Swap arr[i] with the element
    // at random index
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export class GameRoom extends Room<GameRoomState> {
  maxClients = 100;

  async onCreate(options: any) {
    this.setState(new GameRoomState());
    this.roomId = "game_room";

    this.onMessage("start", async () => {
      // TODO check for admin auth
      if (this.state.startedAt) {
        throw new Error("Game has already been started");
      }
      this.shuffleDeck();
      this.shuffleQuestions();
      this.state.startedAt = new Date().toISOString();
    });

    this.onMessage("stop", async () => {
      if (!this.state.startedAt) {
        throw new Error("Game hasn't been started yet");
      }
      this.state.startedAt = undefined;
      this.state.cards.clear();
      this.state.questions.clear();
    });
  }

  async shuffleDeck() {
    const cards = await CardModel.find({});
    let idxCards = Array.from(Array(cards.length).keys());
    idxCards = shuffle(idxCards);
    this.state.cards.clear();
    for (const idx of idxCards) {
      const card = cards[idx];
      this.state.cards.push(new Card({ text: card.text }));
    }
  }

  async shuffleQuestions() {
    const questions = await QuestionModel.find({});
    let idxQuestions = Array.from(Array(questions.length).keys());
    idxQuestions = shuffle(idxQuestions);
    this.state.questions.clear();
    for (const idx of idxQuestions) {
      const question = questions[idx];
      this.state.questions.push(
        new Question({ text: question.text, num: question.num })
      );
    }
  }

  onJoin(client: Client, options: IUserOptions) {
    if (!options.name) {
      throw new Error("name is required");
    }
    console.log(client.sessionId, options.name, "joined!");
    this.state.users.set(client.sessionId, new User({ name: options.name }));
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left! consented:", consented);
    this.state.users.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
