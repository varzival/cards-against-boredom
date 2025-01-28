import { Schema, type, ArraySchema, MapSchema, filter } from "@colyseus/schema";
import { Client } from "colyseus";

export enum GameState {
  SELECT_CARD = "SELECT_CARD",
  VOTE = "VOTE",
  SHOW_RESULTS = "SHOW_RESULTS",
}
type GameStateType = keyof typeof GameState;

function filterSessionIds(this: User, client: Client) {
  return this.sessionIds.includes(client.sessionId);
}

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
  @type("boolean") continue: boolean = false;
  @type("boolean") active: boolean = true;
  @type("boolean") voted: boolean = false;

  //   @filter(filterSessionIds)
  @type([Card])
  cards: ArraySchema<Card> = new ArraySchema();

  //   @filter(filterSessionIds)
  @type(["number"])
  selectedCards: ArraySchema<number> = new ArraySchema();

  //   @filter(filterSessionIds)
  @type("number")
  votedFor: number;

  isAdmin: boolean;
  sessionIds: string[] = [];
  voteOrder: number;
}

export class VoteOption extends Schema {
  @type([Card]) cards: ArraySchema<Card> = new ArraySchema();
}

export class VoteResult extends Schema {
  @type(["string"]) players: ArraySchema<string> = new ArraySchema();
  @type("number") vote: number;
  @type("string") owner: string;
}

export class GameRoomState extends Schema {
  @type("string") startedAt: string | null = null;
  @type("string") gameState: GameStateType = GameState.SELECT_CARD;
  @type("boolean") presentersMode: boolean = false;

  @type({ map: User }) users = new MapSchema<User>();
  @type([VoteOption]) voteOptions: ArraySchema<VoteOption> = new ArraySchema();
  @type([VoteResult]) voteResults: ArraySchema<VoteResult> = new ArraySchema();
  @type(Question) question: Question | null = null;

  cards: Array<Card> = new Array();
  questions: Array<Question> = new Array();
}
