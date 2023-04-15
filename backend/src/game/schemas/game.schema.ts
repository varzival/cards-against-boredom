import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Document, HydratedDocument, SchemaTypes } from "mongoose";
import { Card } from "../../cards/schemas/card.schema";
import { Question } from "./question.schema";

export enum GameState {
  SELECT_CARD = "SELECT_CARD",
  VOTE = "VOTE",
  SHOW_RESULTS = "SHOW_RESULTS"
}

export interface User extends Document {
  id: string;
  name: string;
  points: number;
  cards: Array<Card>;
  selectedCards: Array<number>;
  voteOrder: number;
  votedFor: number;
  continue: boolean;
}

export type GameDocument = HydratedDocument<Game>;

@Schema()
export class Game {
  @Prop()
  startedAt: Date;

  @Prop({
    type: SchemaTypes.String,
    default: GameState.SELECT_CARD,
    enum: GameState
  })
  state: GameState;

  @Prop([
    raw({
      name: SchemaTypes.String,
      points: { type: SchemaTypes.Number, default: 0 },
      cards: {
        type: [{ type: SchemaTypes.ObjectId, ref: "Card" }],
        default: []
      },
      selectedCards: [SchemaTypes.Number],
      voteOrder: SchemaTypes.Number,
      votedFor: SchemaTypes.Number,
      continue: { type: SchemaTypes.Boolean, default: false }
    })
  ])
  users: Array<User>;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: "Card" }], default: [] })
  cards: Array<Card>;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: "Question" }] })
  questions: Array<Question>;
}

export const GameSchema = SchemaFactory.createForClass(Game);
