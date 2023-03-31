import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Document, HydratedDocument, SchemaTypes } from "mongoose";
import { Card } from "./card.schema";
import { Question } from "./question.schema";

export enum GameState {
  SELECT_CARD = "SELECT_CARD",
  VOTE = "VOTE",
  SHOW_RESULTS = "SHOW_RESULTS"
}

/*
@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: "Card" }] })
  cards: Array<Card>;

  @Prop([SchemaTypes.Number])
  selectedCards: Array<number>;
}


export const UserSchema = SchemaFactory.createForClass(User);
*/

export interface User extends Document {
  id: string;
  name: string;
  points: number;
  cards: Array<Card>;
  selectedCards: Array<number>;
  voteOrder: number;
  votedFor: number;
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
      points: SchemaTypes.Number,
      cards: {
        type: [{ type: SchemaTypes.ObjectId, ref: "Card" }],
        default: []
      },
      selectedCards: [SchemaTypes.Number],
      voteOrder: SchemaTypes.Number,
      votedFor: SchemaTypes.Number
    })
  ])
  users: Array<User>;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: "Card" }], default: [] })
  cards: Array<Card>;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: "Question" }] })
  questions: Array<Question>;
}

export const GameSchema = SchemaFactory.createForClass(Game);
