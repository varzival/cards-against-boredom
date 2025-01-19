import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";

export enum GameState {
  SELECT_CARD = "SELECT_CARD",
  VOTE = "VOTE",
  SHOW_RESULTS = "SHOW_RESULTS",
}
type GameStateType = keyof typeof GameState;

export class Card extends Schema {
  @type("string") text: string;
}

export class Question extends Schema {
  @type("string") text: string;
  @type("number") num: number;
}

export class User extends Schema {
  @type("string") name: string;
  @type("number") points: number = 0;
  @type([Card]) cards: ArraySchema<Card>;
  @type(["number"]) selectedCards: ArraySchema<number>;
  @type("number") voteOrder: number | null = null;
  @type("number") votedFor: number | null = null;
  @type("boolean") continue: boolean = false;
  @type("boolean") isAdmin: boolean;
  @type("boolean") active: boolean = true;
}

export class GameRoomState extends Schema {
  @type("string") startedAt: string | null;
  @type("string") gameState: GameStateType = GameState.SELECT_CARD;
  @type("boolean")
  presentersMode: boolean = false;
  @type({ map: User }) users = new MapSchema<User>();
  @type([Card]) cards: ArraySchema<Card> = new ArraySchema();
  @type([Question]) questions: ArraySchema<Question> = new ArraySchema();
}
